import { useEffect, useRef } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { dismiss } from '@/features/notifications/notificationsSlice'
import type { Notification } from '@/features/notifications/notificationsSlice'

const ICONS = { success: CheckCircle2, error: XCircle, info: Info }

const DURATIONS: Record<Notification['kind'], number> = {
  success: 3000,
  info: 3500,
  error: 6000,
}

export default function ToastContainer() {
  const items = useAppSelector((s) => s.notifications.items)

  if (items.length === 0) return null

  return (
    <div className="toast-stack">
      {items.map((item) => (
        <ToastItem key={item.id} item={item} />
      ))}
    </div>
  )
}

function ToastItem({ item }: { item: Notification }) {
  const dispatch = useAppDispatch()
  const Icon = ICONS[item.kind] ?? Info
  const duration = DURATIONS[item.kind] ?? 3500

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const start = () => {
    timerRef.current = setTimeout(() => {
      dispatch(dismiss(item.id))
    }, duration)
  }

  const clear = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  useEffect(() => {
    start()
    return clear
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id, dispatch])

  const isError = item.kind === 'error'

  return (
    <div
      className={`toast toast--${item.kind}`}
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      onMouseEnter={clear}
      onMouseLeave={start}
    >
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