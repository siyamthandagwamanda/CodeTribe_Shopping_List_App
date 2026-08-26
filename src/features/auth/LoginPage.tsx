import { useState, useEffect, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { loginUser, clearAuthError } from '@/features/auth/authSlice'
import { notify } from '@/features/notifications/notificationsSlice'

export default function LoginPage() {
  const { user, status, error } = useAppSelector((s) => s.auth)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const isLoading = status === 'loading'

  
  useEffect(() => {
    return () => {
      dispatch(clearAuthError())
    }
  }, [dispatch])

  if (user) return <Navigate to="/dashboard" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (isLoading) return 

    dispatch(clearAuthError())

    const result = await dispatch(loginUser({ email: email.trim(), password }))

    if (loginUser.fulfilled.match(result)) {
      dispatch(notify(`Welcome back, ${result.payload.name}!`, 'success'))
      
      const from =
        (location.state as { from?: { pathname: string } } | null)?.from
          ?.pathname ?? '/dashboard'
      
      
      navigate(from, { replace: true })
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-page__inner">
        <Link to="/" className="auth-page__brand brand">
          <span className="brand__icon">
            <ShoppingBag size={16} strokeWidth={2.25} />
          </span>
          <span className="brand__name">ShopSort.</span>
        </Link>

        <div className="auth-card">
          <h1 className="auth-card__title">Welcome back</h1>
          <p className="auth-card__subtitle">
            Log in to pick up where you left off.
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            <Field label="Email address">
              <input
                type="email"
                required
                disabled={isLoading} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="input"
              />
            </Field>

            <Field label="Password">
              <input
                type="password"
                required
                disabled={isLoading} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input"
              />
            </Field>

            {error && <p className="error-banner">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-block"
            >
              {isLoading ? 'Logging in…' : 'Log In'}
            </button>
          </form>

          <p className="auth-card__footer">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {children}
    </label>
  )
}
