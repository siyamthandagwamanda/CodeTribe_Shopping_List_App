import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ShoppingBag, LogOut, User, Search } from 'lucide-react'
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

  function handleLogout() {
    
    navigate('/', { replace: true })
    dispatch(logout())
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
            <button
              type="button"
              aria-label="Search"
              className="icon-btn app-header__search"
            >
              <Search size={16} />
            </button>

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
