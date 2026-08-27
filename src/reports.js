import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'

export async function createReport({ reporterId, targetType, targetId, reason, details = '' }) {
  await addDoc(collection(db, 'reports'), {
    reporterId,
    targetType,
    targetId,
    reason,
    details,
    status: 'open',
    createdAt: serverTimestamp(),
  })
}
