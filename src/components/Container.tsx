import { useEffect } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { dismiss } from '@/features/notifications/notificationsSlice'

const ICONS = { success: CheckCircle2, error: XCircle, info: Info }

export default function ToastContainer() {
  const items = useAppSelector((s) => s.notifications.items)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (items.length === 0) return
    const latest = items[items.length - 1]
    const timer = setTimeout(() => dispatch(dismiss(latest.id)), 3500)
    return () => clearTimeout(timer)
  }, [items, dispatch])

  if (items.length === 0) return null

  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {items.map((item) => {
        const Icon = ICONS[item.kind]
        return (
            
          <div key={item.id} className={`toast toast--${item.kind}`}>
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
      })}
    </div>
  )
}
