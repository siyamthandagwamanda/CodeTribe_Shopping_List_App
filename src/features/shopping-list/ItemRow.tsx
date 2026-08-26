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
  
  
  const [draftName, setDraftName] = useState(item.name || '')
  const [draftQty, setDraftQty] = useState(item.quantity || '')
  const [draftCategory, setDraftCategory] = useState(item.category || CATEGORIES[0])
  const [draftNotes, setDraftNotes] = useState(item.notes || '')
  const [draftImage, setDraftImage] = useState(item.image || '')
  
  const dispatch = useAppDispatch()

  function save() {
    const trimmed = draftName.trim()

    if (trimmed) {
      dispatch(
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
      setEditing(false)
    } else {
      dispatch(notify('Item name cannot be empty.', 'error'))
    }
  }

  
  function cancel() {
    setDraftName(item.name || '')
    setDraftQty(item.quantity || '')
    setDraftCategory(item.category || CATEGORIES[0])
    setDraftNotes(item.notes || '')
    setDraftImage(item.image || '')
    setEditing(false)
  }

  function toggle() {
    dispatch(updateItem({ id: item.id, listId, patch: { checked: !item.checked } }))
  }

  async function remove() {
    const result = await dispatch(deleteItem({ id: item.id, listId }))
    if (deleteItem.fulfilled.match(result)) {
      dispatch(notify(`Removed "${item.name}"`, 'info'))
    }
  }

 
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') save()
    if (e.key === 'Escape') cancel()
  }

  return (
    <li className="item-row">
      <button
        type="button"
        onClick={toggle}
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
            onChange={(e) => setDraftName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Item name"
            className="item-edit__name"
          />

          <input
            value={draftQty}
            placeholder="qty"
            onChange={(e) => setDraftQty(e.target.value)}
            onKeyDown={handleKeyDown}
            className="item-edit__qty"
          />

          <select
            value={draftCategory}
            onChange={(e) => setDraftCategory(e.target.value)}
            className="item-edit__select"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <input
            value={draftNotes}
            placeholder="notes"
            onChange={(e) => setDraftNotes(e.target.value)}
            onKeyDown={handleKeyDown}
            className="item-edit__notes"
          />

          <input
            value={draftImage}
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
        <button
          type="button"
          onClick={() => (editing ? save() : setEditing(true))}
          aria-label={editing ? 'Save item' : 'Edit item'}
          className="icon-btn"
        >
          {editing ? <Check size={13} /> : <Pencil size={13} />}
        </button>

        {editing ? (
          <button
            type="button"
            onClick={cancel}
            aria-label="Cancel editing"
            className="icon-btn"
          >
            <X size={13} />
          </button>
        ) : (
          <button
            type="button"
            onClick={remove}
            aria-label="Delete item"
            className="icon-btn icon-btn--danger"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </li>
  )
}
