import {
  addDoc, collection, doc, getDoc, getDocs, limit, orderBy, query,
  serverTimestamp, setDoc, updateDoc, onSnapshot, where
} from 'firebase/firestore'
import { db } from '../firebase/config'

function conversationId(a, b) {
  return [a, b].sort().join('_')
}

export async function getOrCreateConversation(uidA, uidB) {
  const id = conversationId(uidA, uidB)
  const ref = doc(db, 'conversations', id)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      participants: [uidA, uidB],
      lastMessage: '',
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    })
  }
  return id
}

export function listenMessages(conversationId, cb, pageSize = 50) {
  const q = query(
    collection(db, 'conversations', conversationId, 'messages'),
    orderBy('createdAt', 'asc'),
    limit(pageSize)
  )
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

export async function sendMessage(conversationId, { senderId, text, mediaUrl = null, mediaType = null }) {
  await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
    senderId,
    text: text || '',
    mediaUrl,
    mediaType,
    createdAt: serverTimestamp(),
    seenBy: [senderId],
  })
  await updateDoc(doc(db, 'conversations', conversationId), {
    lastMessage: text || (mediaType ? `[${mediaType}]` : ''),
    updatedAt: serverTimestamp(),
  })
}

export async function listConversationsFor(uid) {
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', uid),
    orderBy('updatedAt', 'desc'),
    limit(40)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}
