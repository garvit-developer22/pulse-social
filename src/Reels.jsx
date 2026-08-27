import { useEffect, useRef, useState } from 'react'
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore'
import { db, isFirebaseConfigured } from './config'
import { EmptyState } from './ui'

export default function Reels() {
  const [items, setItems] = useState([])
  const refs = useRef({})

  useEffect(() => {
    if (!isFirebaseConfigured) return
    ;(async () => {
      try {
        const q1 = query(collection(db, 'posts'), where('mediaType', '==', 'video'), orderBy('createdAt', 'desc'), limit(20))
        const snap = await getDocs(q1)
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      } catch {
        try {
          const snap = await getDocs(query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(30)))
          setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((p) => p.mediaType === 'video' || p.media?.[0]?.type === 'video'))
        } catch {
          setItems([])
        }
      }
    })()
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        const v = en.target
        if (!(v instanceof HTMLVideoElement)) return
        if (en.isIntersecting && en.intersectionRatio > 0.6) v.play().catch(() => {})
        else v.pause()
      })
    }, { threshold: [0.6] })
    Object.values(refs.current).forEach((el) => el && obs.observe(el))
    return () => obs.disconnect()
  }, [items])

  if (!isFirebaseConfigured) return <EmptyState title="Reels" subtitle="Connect Firebase and upload video posts." />
  if (!items.length) return <EmptyState title="No reels yet" subtitle="Upload a video from Create." />

  return (
    <div className="mx-auto max-w-md h-[calc(100dvh-7rem)] snap-y snap-mandatory overflow-y-auto">
      {items.map((p) => {
        const url = p.media?.find((m) => m.type === 'video')?.url || p.media?.[0]?.url
        return (
          <div key={p.id} className="relative h-full w-full snap-start bg-black">
            <video
              ref={(el) => { refs.current[p.id] = el }}
              src={url}
              className="h-full w-full object-contain"
              loop
              muted
              playsInline
              controls
            />
            <div className="absolute bottom-16 left-4 right-16 text-sm text-white drop-shadow">
              <p className="font-semibold">{p.authorName}</p>
              <p className="opacity-90">{p.caption}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
                                 }
