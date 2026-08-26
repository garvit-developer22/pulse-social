import {
  doc, getDoc, setDoc, deleteDoc, serverTimestamp, increment, updateDoc,
  collection, query, where, getDocs, limit
} from 'firebase/firestore'
import { db } from '../firebase/config'

export async function followUser(me, targetUid) {
  if (me === targetUid) return
  const relId = `${me}_${targetUid}`
  const target = await getDoc(doc(db, 'users', targetUid))
  const isPrivate = target.exists() && target.data().isPrivate
  if (isPrivate) {
    await setDoc(doc(db, 'followRequests', relId), {
      from: me, to: targetUid, status: 'pending', createdAt: serverTimestamp()
    })
    return 'requested'
  }
  await setDoc(doc(db, 'follows', relId), {
    followerId: me, followingId: targetUid, createdAt: serverTimestamp()
  })
  await updateDoc(doc(db, 'users', me), { followingCount: increment(1) })
  await updateDoc(doc(db, 'users', targetUid), { followersCount: increment(1) })
  return 'following'
}

export async function unfollowUser(me, targetUid) {
  const relId = `${me}_${targetUid}`
  const f = await getDoc(doc(db, 'follows', relId))
  if (f.exists()) {
    await deleteDoc(doc(db, 'follows', relId))
    await updateDoc(doc(db, 'users', me), { followingCount: increment(-1) })
    await updateDoc(doc(db, 'users', targetUid), { followersCount: increment(-1) })
  }
  const r = await getDoc(doc(db, 'followRequests', relId))
  if (r.exists()) await deleteDoc(doc(db, 'followRequests', relId))
  return 'none'
}

export async function getFollowState(me, targetUid) {
  if (!me || me === targetUid) return 'self'
  const relId = `${me}_${targetUid}`
  if ((await getDoc(doc(db, 'follows', relId))).exists()) return 'following'
  if ((await getDoc(doc(db, 'followRequests', relId))).exists()) return 'requested'
  return 'none'
}

export async function acceptFollowRequest(fromUid, me) {
  const relId = `${fromUid}_${me}`
  await deleteDoc(doc(db, 'followRequests', relId))
  await setDoc(doc(db, 'follows', relId), {
    followerId: fromUid, followingId: me, createdAt: serverTimestamp()
  })
  await updateDoc(doc(db, 'users', fromUid), { followingCount: increment(1) })
  await updateDoc(doc(db, 'users', me), { followersCount: increment(1) })
}

export async function searchUsersByUsername(prefix, max = 15) {
  const p = String(prefix || '').toLowerCase().trim()
  if (!p) return []
  const qy = query(
    collection(db, 'users'),
    where('username', '>=', p),
    where('username', '<=', p + '\uf8ff'),
    limit(max)
  )
  const snap = await getDocs(qy)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}
