import { useEffect } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { dismiss } from '@/features/notifications/notificationsSlice'
import type { Notification } from '@/features/notifications/notificationsSlice'

const ICONS = { success: CheckCircle2, error: XCircle, info: Info }

export default function ToastContainer() {
  const items = useAppSelector((s) => s.notifications.items)

  if (items.length === 0) return null

  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {items.map((item) => (
       
        <ToastItem key={item.id} item={item} />
      ))}
    </div>
  )
}

function ToastItem({ item }: { item: Notification }) {
  const dispatch = useAppDispatch()
  const Icon = ICONS[item.kind]

  useEffect(() => {
    
    const timer = setTimeout(() => {
      dispatch(dismiss(item.id))
    }, 3500)

    return () => clearTimeout(timer)
  }, [item.id, dispatch])

  return (
    <div className={`toast toast--${item.kind}`}>
      <Icon size={16} />
      <span>{item.message}</span>

      <button
        type="button"
        onClick={() => dispatch(dismiss(item.id))}
        aria-label="Dismiss notification"
        className="toast__close"
      >
        <X size={14} />
      </button>
    </div>
  )
}
