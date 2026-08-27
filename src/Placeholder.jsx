import { EmptyState } from '../components/ui'
export default function Placeholder({ title, subtitle }) {
  return <EmptyState title={title} subtitle={subtitle || 'This module is scaffolded — next iteration will complete Firestore flows.'} />
}
