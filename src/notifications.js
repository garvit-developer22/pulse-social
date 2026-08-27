import {
  addDoc, collection, doc, getDocs, limit, orderBy, query, serverTimestamp,
  updateDoc, where, writeBatch
} from 'firebase/firestore'
import { db } from './config'

export async function createNotification({ recipientId, actorId, type, postId = null, message = '' }) {
  if (!recipientId || recipientId === actorId) return
  await addDoc(collection(db, 'notifications'), {
    recipientId,
    actorId,
    type,
    postId,
    message,
    isRead: false,
    createdAt: serverTimestamp(),
  })
}

export async function fetchNotifications(uid, max = 40) {
  const q = query(
    collection(db, 'notifications'),
    where('recipientId', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(max)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function markAllNotificationsRead(uid, items) {
  const batch = writeBatch(db)
  items.filter((n) => !n.isRead).forEach((n) => {
    batch.update(doc(db, 'notifications', n.id), { isRead: true })
  })
  await batch.commit()
}
