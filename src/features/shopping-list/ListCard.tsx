import { useState, useEffect } from 'react'
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
  const [isProcessing, setIsProcessing] = useState(false)
  
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    setDraftName(list.name)
  }, [list.name])

  async function saveRename(e?: React.MouseEvent | React.KeyboardEvent) {
    if (e) e.stopPropagation() 
    
    const trimmed = draftName.trim()
    if (!trimmed || isProcessing) return

    if (trimmed === list.name) {
      setEditing(false)
      return
    }

    try {
      setIsProcessing(true)
      
      const result = await dispatch(renameList({ 
        id: list.id, 
        name: trimmed, 
        category: list.category || '' 
      }))
      if (renameList.fulfilled.match(result)) {
        setEditing(false)
      } else {
        dispatch(notify('Could not save list name updates.', 'error'))
      }
    } finally {
      setIsProcessing(false)
    }
  }

  function handleCancelEdit(e: React.MouseEvent) {
    e.stopPropagation() 
    setDraftName(list.name) 
    setEditing(false)
  }

  async function confirmDelete(e: React.MouseEvent) {
    e.stopPropagation()
    if (isProcessing) return

    try {
      setIsProcessing(true)
      const result = await dispatch(deleteList(list.id))
      if (deleteList.fulfilled.match(result)) {
        dispatch(notify(`Deleted "${list.name}"`, 'info'))
      }
    } finally {
      setIsProcessing(false)
    }
  }

 
  function handleToggleEdit(e: React.MouseEvent) {
    e.stopPropagation() 
    setEditing(true)
  }

  function handleToggleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    setConfirmingDelete(true)
  }

  function handleCancelDelete(e: React.MouseEvent) {
    e.stopPropagation() 
    setConfirmingDelete(false)
  }

  return (
    <li 
      className="list-card" 
      style={{ opacity: isProcessing ? 0.6 : 1, pointerEvents: isProcessing ? 'none' : 'auto' }}
    >
      <button
        type="button"
        disabled={isProcessing}
        onClick={() => !editing && navigate(`/lists/${list.id}`)}
        className="list-card__info"
      >
        {editing ? (
          <input
            autoFocus
            value={draftName}
            disabled={isProcessing}
            onClick={(e) => e.stopPropagation()} 
            onChange={(e) => setDraftName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && saveRename(e)}
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
          <>
            <button
              type="button"
              onClick={(e) => saveRename(e)}
              disabled={isProcessing || !draftName.trim()}
              aria-label="Save name"
              className="icon-btn icon-btn--square icon-btn--active"
            >
              <Check size={14} />
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={isProcessing}
              aria-label="Cancel rename"
              className="icon-btn icon-btn--square"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={handleToggleEdit}
            disabled={isProcessing}
            aria-label="Rename list"
            className="icon-btn icon-btn--square"
          >
            <Pencil size={14} />
          </button>
        )}

        {confirmingDelete ? (
          <div className="confirm-actions">
            <button 
              type="button" 
              onClick={confirmDelete} 
              disabled={isProcessing}
              className="btn-confirm"
            >
              {isProcessing ? '...' : 'Confirm'}
            </button>
            <button
              type="button"
              onClick={handleCancelDelete}
              disabled={isProcessing}
              aria-label="Cancel delete"
              className="icon-btn"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleToggleDelete}
            disabled={isProcessing}
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
