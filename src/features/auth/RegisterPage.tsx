import { useState, useEffect, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ShoppingBag, Eye, EyeOff } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { registerUser, clearAuthError } from '@/features/auth/authSlice'
import { notify } from '@/features/notifications/notificationsSlice'

export default function RegisterPage() {
  const { user, status, error } = useAppSelector((s) => s.auth)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [surname, setSurname] = useState('')
  const [cellNumber, setCellNumber] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

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

    const result = await dispatch(
      registerUser({
        name: name.trim(),
        surname: surname.trim(),
        cellNumber: cellNumber.trim(),
        email: email.trim(),
        password
      })
    )

    if (registerUser.fulfilled.match(result)) {
      dispatch(notify(`Welcome to ShopSort, ${name.trim()}!`, 'success'))

      navigate('/dashboard', { replace: true })
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
          <h1 className="auth-card__title">Create Account</h1>
          <p className="auth-card__subtitle">
            Register a new profile to track your custom lists.
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="field-row">
              <Field label="First Name">
                <input
                  required
                  disabled={isLoading}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex"
                  className="input"
                />
              </Field>
              <Field label="Surname">
                <input
                  required
                  disabled={isLoading}
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  placeholder="Carter"
                  className="input"
                />
              </Field>
            </div>

            <Field label="Email Address">
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

            <Field label="Cell Number">
              <input
                type="tel"
                required
                disabled={isLoading}
                value={cellNumber}
                onChange={(e) => setCellNumber(e.target.value)}
                placeholder="082 123 4567"
                className="input"
              />
            </Field>

            <Field label="Password">
              <div className="password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input"
                />
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="password-toggle"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </Field>

            <p className="auth-form__terms">
              Your password is hashed with bcrypt before it's stored. By
              signing up you agree to our Terms of Service and Privacy
              Policy.
            </p>

            {error && <p className="error-banner">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-block"
            >
              {isLoading ? 'Creating account…' : 'Create Free Account'}
            </button>
          </form>

          <p className="auth-card__footer">
            Already a registered User? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {children}
    </label>
  )
}