import {
  addDoc, collection, doc, getDoc, getDocs, limit, orderBy, query,
  startAfter, updateDoc, deleteDoc, serverTimestamp, increment, where, writeBatch
} from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from './config'

export async function fetchFeedPage(pageSize = 12, cursor = null) {
  let q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(pageSize))
  if (cursor) q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), startAfter(cursor), limit(pageSize))
  const snap = await getDocs(q)
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data(), _cursor: d }))
  const next = snap.docs.length === pageSize ? snap.docs[snap.docs.length - 1] : null
  return { items, nextCursor: next }
}

export async function uploadMediaFiles(uid, files, onProgress) {
  const media = []
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const path = `posts/${uid}/${Date.now()}_${i}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const storageRef = ref(storage, path)
    const task = uploadBytesResumable(storageRef, file)
    await new Promise((resolve, reject) => {
      task.on('state_changed', (snap) => {
        if (onProgress) onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100))
      }, reject, resolve)
    })
    const url = await getDownloadURL(task.snapshot.ref)
    media.push({ url, path, type: file.type.startsWith('video/') ? 'video' : 'image' })
  }
  return media
}

export async function createPost({ uid, authorName, authorPhoto, media, caption, location = '' }) {
  const hashtags = Array.from(String(caption || '').matchAll(/#([\w]+)/g)).map((m) => m[1].toLowerCase())
  const docRef = await addDoc(collection(db, 'posts'), {
    authorId: uid,
    authorName,
    authorPhoto: authorPhoto || '',
    media,
    mediaType: media[0]?.type || 'image',
    caption: caption || '',
    hashtags,
    location,
    taggedUsers: [],
    likesCount: 0,
    commentsCount: 0,
    savesCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  await updateDoc(doc(db, 'users', uid), { postsCount: increment(1), updatedAt: serverTimestamp() })
  return docRef.id
}

export async function deletePost(post) {
  if (post.media) {
    for (const m of post.media) {
      if (m.path) {
        try { await deleteObject(ref(storage, m.path)) } catch {}
      }
    }
  }
  await deleteDoc(doc(db, 'posts', post.id))
  if (post.authorId) {
    try { await updateDoc(doc(db, 'users', post.authorId), { postsCount: increment(-1) }) } catch {}
  }
}

export async function toggleLike(postId, uid) {
  const likeRef = doc(db, 'posts', postId, 'likes', uid)
  const postRef = doc(db, 'posts', postId)
  const snap = await getDoc(likeRef)
  const batch = writeBatch(db)
  if (snap.exists()) {
    batch.delete(likeRef)
    batch.update(postRef, { likesCount: increment(-1) })
    await batch.commit()
    return false
  }
  batch.set(likeRef, { uid, createdAt: serverTimestamp() })
  batch.update(postRef, { likesCount: increment(1) })
  await batch.commit()
  return true
}

export async function hasLiked(postId, uid) {
  const snap = await getDoc(doc(db, 'posts', postId, 'likes', uid))
  return snap.exists()
}

export async function toggleSave(postId, uid) {
  const saveRef = doc(db, 'users', uid, 'saved', postId)
  const postRef = doc(db, 'posts', postId)
  const snap = await getDoc(saveRef)
  const batch = writeBatch(db)
  if (snap.exists()) {
    batch.delete(saveRef)
    batch.update(postRef, { savesCount: increment(-1) })
    await batch.commit()
    return false
  }
  batch.set(saveRef, { postId, createdAt: serverTimestamp() })
  batch.update(postRef, { savesCount: increment(1) })
  await batch.commit()
  return true
}

export async function addComment(postId, { uid, username, displayName, photoURL, text, parentId = null }) {
  const refC = await addDoc(collection(db, 'posts', postId, 'comments'), {
    authorId: uid,
    username,
    displayName,
    photoURL: photoURL || '',
    text,
    parentId,
    likesCount: 0,
    createdAt: serverTimestamp(),
  })
  await updateDoc(doc(db, 'posts', postId), { commentsCount: increment(1) })
  return refC.id
}

export async function fetchComments(postId, pageSize = 30) {
  const q = query(collection(db, 'posts', postId, 'comments'), orderBy('createdAt', 'asc'), limit(pageSize))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function deleteComment(postId, commentId) {
  await deleteDoc(doc(db, 'posts', postId, 'comments', commentId))
  await updateDoc(doc(db, 'posts', postId), { commentsCount: increment(-1) })
}
