import { useState, useRef, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ShoppingBag, LogOut, User, Search, X } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { logout } from '@/features/auth/authSlice'
import ToastContainer from '@/components/Container'

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
]

export default function Layout() {
  const user = useAppSelector((s) => s.auth.user)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchOpen) {
      inputRef.current?.focus()
    }
  }, [searchOpen])

  function handleLogout() {
    dispatch(logout())
    navigate('/', { replace: true })
  }

  function openSearch() {
    setSearchOpen(true)
  }

  function closeSearch() {
    setSearchOpen(false)
    setQuery('')
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    navigate(`/search?q=${encodeURIComponent(trimmed)}`)
    closeSearch()
  }

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      closeSearch()
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__inner">
          <div className="app-header__left">
            <NavLink to="/dashboard" className="brand">
              <span className="brand__icon">
                <ShoppingBag size={16} strokeWidth={2.25} />
              </span>
              <span className="brand__name">ShopSort.</span>
            </NavLink>

            <nav className="app-header__nav">
              {navItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={({ isActive }) =>
                    isActive
                      ? 'app-header__nav-link app-header__nav-link--active'
                      : 'app-header__nav-link'
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="app-header__right">
            {searchOpen ? (
              <form
                className="app-header__search-form"
                onSubmit={handleSearchSubmit}
                role="search"
              >
                <Search size={16} className="app-header__search-icon" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  onBlur={() => {
                    if (!query.trim()) closeSearch()
                  }}
                  placeholder="Search products..."
                  aria-label="Search products"
                  className="app-header__search-input"
                />
                <button
                  type="button"
                  aria-label="Close search"
                  className="icon-btn"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={closeSearch}
                >
                  <X size={16} />
                </button>
              </form>
            ) : (
              <button
                type="button"
                aria-label="Search"
                className="icon-btn app-header__search"
                onClick={openSearch}
              >
                <Search size={16} />
              </button>
            )}

            <NavLink to="/profile" aria-label="Profile" className="icon-btn">
              <User size={16} />
            </NavLink>

            <button type="button" onClick={handleLogout} className="btn btn-primary">
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      <ToastContainer />

      <footer className="app-footer">
        {new Date().getFullYear()} ShopSort &middot; signed in as{' '}
        {user?.name ?? 'guest'}
      </footer>
    </div>
  )
}