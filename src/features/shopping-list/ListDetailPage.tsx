import { useEffect, useMemo, useState } from 'react'
import { useParams, Navigate, Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Plus, Search, ArrowUpDown, Share2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { fetchItems, createItem } from '@/features/shopping-list/shoppingSlice'
import { notify } from '@/features/notifications/notificationsSlice'
import ItemRow from '@/features/shopping-list/ItemRow'
import type { SortKey } from '@/app/types'

const CATEGORIES = ['Produce', 'Dairy', 'Bakery', 'Meat', 'Pantry', 'Household', 'Other']
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'dateAdded', label: 'Date added' },
  { value: 'name', label: 'Name' },
  { value: 'category', label: 'Category' },
]

export default function ListDetailPage() {

  const { id } = useParams<{ id: string }>()
  const list = useAppSelector((s) => s.shopping.lists.find((l) => l.id === id))
  const items = useAppSelector((s) => (id ? s.shopping.itemsByList[id] ?? [] : []))
  const itemsStatus = useAppSelector((s) => s.shopping.itemsStatus)
  const dispatch = useAppDispatch()

  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const sortBy = (searchParams.get('sort') as SortKey) || 'dateAdded'

  const [name, setName] = useState('')
  const [qty, setQty] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [notes, setNotes] = useState('')
  const [image, setImage] = useState('')

  useEffect(() => {
    if (id) dispatch(fetchItems(id))
  }, [id, dispatch])

  const visibleItems = useMemo(() => {

    const filtered = query
      ? items.filter((i) => i.name.toLowerCase().includes(query.toLowerCase()))
      : items

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'category') return a.category.localeCompare(b.category)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return sorted
  }, [items, query, sortBy])

  if (!list) {
    return <Navigate to="/dashboard" replace />
  }

  const checkedCount = items.filter((i) => i.checked).length

  async function submitItem() {
    const trimmed = name.trim()
    if (!trimmed || !list) return
    const result = await dispatch(
      createItem({ listId: list.id, name: trimmed, quantity: qty.trim(), notes: notes.trim(), category, image: image.trim() })
    )
    if (createItem.fulfilled.match(result)) {
      dispatch(notify(`Added "${trimmed}" to ${list.name}`, 'success'))
      setName('')
      setQty('')
      setNotes('')
      setImage('')
    } else {
      dispatch(notify('Could not add that item.', 'error'))
    }
  }

  function updateQuery(value: string) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set('q', value)
    else next.delete('q')
    setSearchParams(next, { replace: true })
  }

  function updateSort(value: SortKey) {
    const next = new URLSearchParams(searchParams)
    next.set('sort', value)
    setSearchParams(next, { replace: true })
  }

  async function copyShareLink() {
    if (!list) return
    const url = `${window.location.origin}/shared/${list.id}`
    try {
      await navigator.clipboard.writeText(url)
      dispatch(notify('Share link copied to clipboard', 'success'))
    } catch {
      dispatch(notify(url, 'info'))
    }
  }

  return (
    <div>
      <Link to="/dashboard" className="back-link">
        <ArrowLeft size={14} />
        All lists
      </Link>

      <div className="detail-header">
        <div>
          <p className="detail-title">{list.name}</p>
          <p className="detail-subtitle">
            {items.length === 0
              ? 'No items yet — add your first one below.'
              : `${checkedCount} of ${items.length} checked off`}
          </p>
        </div>
        <button type="button" onClick={copyShareLink} className="btn btn-outline">
          <Share2 size={14} />
          Share
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-input">
          <Search size={14} />
          <input
            value={query}
            onChange={(e) => updateQuery(e.target.value)}
            placeholder="Search items by name…"
            className="search-input__field"
          />
        </div>

        <label className="sort-select">
          <ArrowUpDown size={13} />

          <select value={sortBy} onChange={(e) => updateSort(e.target.value as SortKey)}>
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>Sort: {opt.label}</option>
            ))}
          </select>
          
        </label>

      </div>

      <div className="panel detail-panel">

        <div className="add-item-form">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitItem()}
            placeholder="Item name, e.g. Oat milk"
            className="input add-item-form__name"
          />

          <input
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            placeholder="qty"
            className="input add-item-form__qty"
          />

          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input add-item-form__select">
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="notes (optional)"
            className="input add-item-form__notes"
          />

          <input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="image URL (optional)"
            className="input add-item-form__image"
          />

          <button
            type="button"
            onClick={submitItem}
            aria-label="Add item"
            className="add-item-form__submit"
          >
            <Plus size={16} />
          </button>
        </div>

        {itemsStatus === 'loading' && items.length === 0 ? (
          <p className="empty-state">Loading items…</p>
        ) : visibleItems.length > 0 ? (
          <ul className="item-list">
            {visibleItems.map((item) => (
              <ItemRow key={item.id} listId={list.id} item={item} />
            ))}
          </ul>

        ) : items.length > 0 ? (
          <p className="empty-state">No items match "{query}".</p>
        ) : null}
      </div>

    </div>
  )
}
