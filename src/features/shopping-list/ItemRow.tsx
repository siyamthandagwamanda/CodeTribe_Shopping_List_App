import { useState } from 'react'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import type { ShoppingItem } from '@/app/types'
import { useAppDispatch } from '@/app/hooks'
import { updateItem, deleteItem } from '@/features/shopping-list/shoppingSlice'
import { notify } from '@/features/notifications/notificationsSlice'

const CATEGORIES = ['Produce', 'Dairy', 'Bakery', 'Meat', 'Pantry', 'Household', 'Other']

export default function ItemRow({
  listId,
  item,
}: {
  listId: string
  item: ShoppingItem
}) {
  const [editing, setEditing] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false) 

  
  const [draftName, setDraftName] = useState(item.name || '')
  const [draftQty, setDraftQty] = useState(item.quantity || '')
  const [draftCategory, setDraftCategory] = useState(item.category || CATEGORIES[0])
  const [draftNotes, setDraftNotes] = useState(item.notes || '')
  const [draftImage, setDraftImage] = useState(item.image || '')
  
  const dispatch = useAppDispatch()

  async function save() {
    const trimmed = draftName.trim()
    if (!trimmed) {
      dispatch(notify('Item name cannot be empty.', 'error'))
      return
    }
    if (isProcessing) return

    try {
      setIsProcessing(true)
      const result = await dispatch(
        updateItem({
          id: item.id,
          listId,
          patch: {
            name: trimmed,
            quantity: (draftQty || '').trim(),
            category: draftCategory,
            notes: (draftNotes || '').trim(),
            image: (draftImage || '').trim(),
          },
        })
      )

      if (updateItem.fulfilled.match(result)) {
        setEditing(false) 
      } else {
        dispatch(notify('Could not save item updates.', 'error'))
      }
    } finally {
      setIsProcessing(false)
    }
  }

  function handleCancel() {
    setDraftName(item.name || '')
    setDraftQty(item.quantity || '')
    setDraftCategory(item.category || CATEGORIES[0])
    setDraftNotes(item.notes || '')
    setDraftImage(item.image || '')
    setEditing(false)
  }

  async function toggle() {
    if (isProcessing) return
    try {
      setIsProcessing(true)
      await dispatch(updateItem({ id: item.id, listId, patch: { checked: !item.checked } }))
    } finally {
      setIsProcessing(false)
    }
  }

  async function remove() {
    if (isProcessing) return
    try {
      setIsProcessing(true)
      const result = await dispatch(deleteItem({ id: item.id, listId }))

      if (deleteItem.fulfilled.match(result)) {
        dispatch(notify(`Removed "${item.name}"`, 'info'))
      }
    } finally {
      setIsProcessing(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') save()
    if (e.key === 'Escape') handleCancel()
  }

  return (
    <li className={`item-row ${isProcessing ? 'item-row--disabled' : ''}`} style={{ opacity: isProcessing ? 0.6 : 1 }}>
      <button
        type="button"
        onClick={toggle}
        disabled={isProcessing}
        aria-pressed={item.checked}
        aria-label={item.checked ? 'Mark as not bought' : 'Mark as bought'}
        className={`item-checkbox${item.checked ? ' item-checkbox--checked' : ''}`}
      >
        <Check size={12} strokeWidth={3} />
      </button>

      {item.image && !editing && (
        <img src={item.image} alt="" className="item-thumb" onError={(e) => (e.currentTarget.style.display = 'none')} />
      )}

      {editing ? (
        <div className="item-edit">
          <input
            autoFocus
            value={draftName}
            disabled={isProcessing}
            onChange={(e) => setDraftName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Item name"
            className="item-edit__name"
          />

          <input
            value={draftQty}
            disabled={isProcessing}
            placeholder="qty"
            onChange={(e) => setDraftQty(e.target.value)}
            onKeyDown={handleKeyDown}
            className="item-edit__qty"
          />

          <select
            value={draftCategory}
            disabled={isProcessing}
            onChange={(e) => setDraftCategory(e.target.value)}
            className="item-edit__select"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <input
            value={draftNotes}
            disabled={isProcessing}
            placeholder="notes"
            onChange={(e) => setDraftNotes(e.target.value)}
            onKeyDown={handleKeyDown}
            className="item-edit__notes"
          />

          <input
            value={draftImage}
            disabled={isProcessing}
            placeholder="image URL"
            onChange={(e) => setDraftImage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="item-edit__image"
          />
        </div>
      ) : (
        <span className={`item-name${item.checked ? ' item-name--checked' : ''}`}>
          {item.name}
          {item.quantity && <span className="item-qty">{item.quantity}</span>}
          {item.category && <span className="item-badge">{item.category}</span>}
          {item.notes && <span className="item-notes">{item.notes}</span>}
        </span>
      )}

      <div className="item-actions">
        {editing ? (
          <>
            <button
              type="button"
              onClick={save}
              disabled={isProcessing || !draftName.trim()}
              aria-label="Save item"
              className="icon-btn"
            >
              <Check size={13} />
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isProcessing}
              aria-label="Cancel editing"
              className="icon-btn"
            >
              <X size={13} />
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setEditing(true)}
              disabled={isProcessing}
              aria-label="Edit item"
              className="icon-btn"
            >
              <Pencil size={13} />
            </button>
            <button
              type="button"
              onClick={remove}
              disabled={isProcessing}
              aria-label="Delete item"
              className="icon-btn icon-btn--danger"
            >
              <Trash2 size={13} />
            </button>
          </>
        )}
      </div>
    </li>
  )
}
