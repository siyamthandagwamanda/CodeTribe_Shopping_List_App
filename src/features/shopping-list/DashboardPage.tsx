import { useEffect, useMemo, useState, useTransition } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Search, ArrowUpDown } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { fetchLists, createList } from '@/features/shopping-list/shoppingSlice'
import { notify } from '@/features/notifications/notificationsSlice'
import ListCard from '@/features/shopping-list/ListCard'
import type { SortKey } from '@/app/types'

const CATEGORIES = ['General', 'Groceries', 'Household', 'Gifts', 'Work', 'Other']
const DEFAULT_SORT: SortKey = 'updatedAt'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'updatedAt', label: 'Last updated' },
  { value: 'name', label: 'Name' },
  { value: 'category', label: 'Category' },
]

export default function DashboardPage() {
  const user = useAppSelector((s) => s.auth.user)
  const lists = useAppSelector((s) => s.shopping.lists) ?? [] 
  const listsStatus = useAppSelector((s) => s.shopping.listsStatus)
  const dispatch = useAppDispatch()
  
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState(CATEGORIES[0])
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [, startTransition] = useTransition()

  const [searchParams, setSearchParams] = useSearchParams()

  const query = searchParams.get('q') ?? ''
  const sortBy = (searchParams.get('sort') as SortKey) || DEFAULT_SORT

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchLists(user.id))
    }
  }, [user?.id, dispatch])

  
  const visibleLists = useMemo(() => {
    const lowerQuery = query.toLowerCase().trim()
    const filtered = lowerQuery 
      ? lists.filter((l) => l.name.toLowerCase().includes(lowerQuery)) 
      : lists

    return [...filtered].sort((a, b) => {
      if (sortBy === 'name') {
        return (a.name || '').localeCompare(b.name || '')
      }
      if (sortBy === 'category') {
        return (a.category || '').localeCompare(b.category || '')
      }
      
    
      const timeA = a.updatedAt ? Date.parse(a.updatedAt) : 0
      const timeB = b.updatedAt ? Date.parse(b.updatedAt) : 0
      return timeB - timeA
    })
  }, [lists, query, sortBy])

  function updateQuery(value: string) {
   
    startTransition(() => {
      const next = new URLSearchParams(searchParams)
      if (value) next.set('q', value)
      else next.delete('q')
      setSearchParams(next, { replace: true })
    })
  }

  function updateSort(value: SortKey) {
    const next = new URLSearchParams(searchParams)
    if (value && value !== DEFAULT_SORT) next.set('sort', value)
    else next.delete('sort')
    setSearchParams(next, { replace: true })
  }

  async function submitNewList(e?: React.FormEvent) {
    e?.preventDefault() 
    const trimmed = newName.trim()

    if (!trimmed) {
      dispatch(notify('Please enter a list name.', 'error'))
      return
    }
    if (!user?.id || isSubmitting) return

    try {
      setIsSubmitting(true)
      const result = await dispatch(createList({ userId: user.id, name: trimmed, category: newCategory, notes: notes.trim() }))
      
      if (createList.fulfilled.match(result)) {
        dispatch(notify(`Created "${trimmed}"`, 'success'))
        setNewName('')
        setNewCategory(CATEGORIES[0])
        setNotes('')
        setAdding(false) 
      } else {
        dispatch(notify('Could not create that list.', 'error'))
      }
    } catch {
      dispatch(notify('An unexpected error occurred.', 'error'))
    } finally {
      setIsSubmitting(false) 
    }
  }

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Your shopping dashboard</h1>
          <p className="dashboard-subtitle">
            {lists.length === 0 ? 'Start your first list below.' : `${lists.length} list${lists.length === 1 ? '' : 's'} in progress`}
          </p>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-input">
          <Search size={14} />
          <input
            value={query}
            onChange={(e) => updateQuery(e.target.value)}
            placeholder="Search your shoplists by name…"
            className="search-input__field"
            type="search"
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

      <div className="panel">
        {listsStatus === 'loading' && lists.length === 0 ? (
          <p className="empty-state">Loading your lists…</p>
        ) : visibleLists.length > 0 ? (
          <ul className="panel-list">
            {visibleLists.map((list) => (
              <ListCard key={list.id} list={list} />
            ))}
          </ul>
        ) : lists.length > 0 ? (
          <p className="empty-state">No lists match "{query}".</p>
        ) : null}

        {adding ? (
          /* Wrapped in a standard form element for better keyboard accessibility */
          <form onSubmit={submitNewList} className="add-form add-form--stacked">
            <div className="add-form__row">
              <input
                autoFocus
                value={newName}
                disabled={isSubmitting}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="List name, e.g. Groceries"
                className="input"
                required
              />

              <select 
                value={newCategory} 
                disabled={isSubmitting}
                onChange={(e) => setNewCategory(e.target.value)} 
                className="input add-form__select"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <input
                value={notes}
                disabled={isSubmitting}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="notes (optional)"
                className="input"
              />
              
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="add-form__btn"
              >
                {isSubmitting ? 'Adding...' : 'Add'}
              </button>
              
              <button 
                type="button" 
                onClick={() => setAdding(false)} 
                disabled={isSubmitting}
                className="add-form__cancel-btn"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button type="button" onClick={() => setAdding(true)} className="add-trigger">
            <Plus size={15} /> Add a new shopping list
          </button>
        )}
      </div>
    </div>
  )
}
