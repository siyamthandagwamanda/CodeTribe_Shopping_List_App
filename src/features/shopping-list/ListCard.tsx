import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import type { ShoppingList } from '@/app/types'
import { useAppDispatch } from '@/app/hooks'
import { renameList, deleteList } from '@/features/shopping-list/shoppingSlice'
import { notify } from '@/features/notifications/notificationsSlice'

function relativeDate(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const diffMin = Math.round(diffMs / 60000)
  if (diffMin < 1) return 'updated just now'
  if (diffMin < 60) return `updated ${diffMin}m ago`
  const diffHr = Math.round(diffMin / 60)
  if (diffHr < 24) return `updated ${diffHr}h ago`
  const diffDay = Math.round(diffHr / 24)
  if (diffDay === 1) return 'updated yesterday'
  if (diffDay < 7) return `updated ${diffDay}d ago`
  return `updated ${new Date(iso).toLocaleDateString()}`
}

export default function ListCard({ list }: { list: ShoppingList }) {
  const [editing, setEditing] = useState(false)
  const [draftName, setDraftName] = useState(list.name)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  function saveRename() {
    const trimmed = draftName.trim()
    if (trimmed && trimmed !== list.name) {
      dispatch(renameList({ id: list.id, name: trimmed }))
    }
    setEditing(false)
  }

  async function confirmDelete() {
    const result = await dispatch(deleteList(list.id))
    if (deleteList.fulfilled.match(result)) {
      dispatch(notify(`Deleted "${list.name}"`, 'info'))
    }
  }

  return (
    <li className="list-card">
      <button
        type="button"
        onClick={() => !editing && navigate(`/lists/${list.id}`)}
        className="list-card__info"
      >
        {editing ? (

          <input
            autoFocus
            value={draftName}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setDraftName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && saveRename()}
            className="list-card__name-input"
          />

        ) : (
          <span className="list-card__name">
            {list.name}
            {list.category && <span className="list-card__category">{list.category}</span>}
          </span>
        )}
        <span className="list-card__meta">{relativeDate(list.updatedAt)}</span>
      </button>

      <div className="list-card__actions">
        {editing ? (

          <button
            type="button"
            onClick={saveRename}
            aria-label="Save name"
            className="icon-btn icon-btn--square icon-btn--active"
          >
            <Check size={14} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label="Rename list"
            className="icon-btn icon-btn--square"
          >
            <Pencil size={14} />
          </button>
        )}

        {confirmingDelete ? (
          <div className="confirm-actions">
            <button type="button" onClick={confirmDelete} className="btn-confirm">
              Confirm
            </button>
            
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              aria-label="Cancel delete"
              className="icon-btn"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="btn-danger-soft"
          >
            <Trash2 size={13} />
            Delete
          </button>
        )}
      </div>
    </li>
  )
}
