import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingBag, Check } from 'lucide-react'
import { api } from '@/lib/api'
import type { ShoppingList, ShoppingItem } from '@/app/types'

export default function SharedListPage() {
  const { id } = useParams<{ id: string }>()
  const [list, setList] = useState<ShoppingList | null>(null)
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    if (!id) return
    let cancelled = false

    async function load() {
      try {
        const [fetchedList, fetchedItems] = await Promise.all([
          api.get<ShoppingList>(`/lists/${id}`),
          api.get<ShoppingItem[]>(`/items?listId=${id}`),
        ])
        if (!cancelled) {
          setList(fetchedList)
          setItems(fetchedItems)
          setStatus('ready')
        }
      } catch (err) {
        if (!cancelled) setStatus('error')
        void err
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [id])

  return (
    <div className="auth-page">
      <div className="auth-page__inner" style={{ maxWidth: '32rem' }}>

        <Link to="/" className="auth-page__brand brand">
          <span className="brand__icon">
            <ShoppingBag size={16} strokeWidth={2.25} />
          </span>
          <span className="brand__name">ShopSort.</span>
        </Link>

        <div className="auth-card">
          {status === 'loading' && <p className="empty-state">Loading shared list…</p>}
          {status === 'error' && (
            <p className="empty-state">This list doesn't exist or isn't shared anymore.</p>
          )}
          {status === 'ready' && list && (

            <>
              <span className="eyebrow">Shared list · read only</span>
              <h1 className="auth-card__title" style={{ marginTop: '0.5rem' }}>{list.name}</h1>
              <p className="auth-card__subtitle">
                {items.length} item{items.length === 1 ? '' : 's'}
              </p>

              <ul className="item-list" style={{ marginTop: '1rem' }}>
                {items.map((item) => (
                  <li key={item.id} className="item-row">
                    <span className={`item-checkbox${item.checked ? ' item-checkbox--checked' : ''}`}>
                      <Check size={12} strokeWidth={3} />
                    </span>

                    <span className={`item-name${item.checked ? ' item-name--checked' : ''}`}>
                      {item.name}
                      {item.quantity && <span className="item-qty">{item.quantity}</span>}
                      {item.category && <span className="item-badge">{item.category}</span>}
                    </span>
                    
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
