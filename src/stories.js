import {
  addDoc, collection, doc, getDocs, limit, orderBy, query, serverTimestamp,
  where, setDoc
} from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../firebase/config'

const DAY = 24 * 60 * 60 * 1000

export async function createStory({ uid, authorName, authorPhoto, file, text = '' }) {
  const path = `stories/${uid}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  const storageRef = ref(storage, path)
  const task = uploadBytesResumable(storageRef, file)
  await new Promise((resolve, reject) => task.on('state_changed', null, reject, resolve))
  const url = await getDownloadURL(task.snapshot.ref)
  const now = Date.now()
  const docRef = await addDoc(collection(db, 'stories'), {
    authorId: uid,
    authorName,
    authorPhoto: authorPhoto || '',
    mediaUrl: url,
    mediaPath: path,
    mediaType: file.type.startsWith('video/') ? 'video' : 'image',
    text,
    createdAt: serverTimestamp(),
    createdAtMs: now,
    expiresAt: now + DAY,
    viewsCount: 0,
  })
  return docRef.id
}

export async function fetchActiveStories() {
  const now = Date.now()
  const q = query(
    collection(db, 'stories'),
    where('expiresAt', '>', now),
    orderBy('expiresAt', 'desc'),
    limit(60)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function markStoryViewed(storyId, uid) {
  await setDoc(doc(db, 'stories', storyId, 'views', uid), {
    uid, viewedAt: serverTimestamp()
  }, { merge: true })
}
