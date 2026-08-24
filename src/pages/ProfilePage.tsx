import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Phone, LogOut, Pencil } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { logout, updateProfile, clearAuthError } from '@/features/auth/authSlice'
import { notify } from '@/features/notifications/notificationsSlice'

export default function ProfilePage() {
  const user = useAppSelector((s) => s.auth.user)
  const status = useAppSelector((s) => s.auth.status)
  const error = useAppSelector((s) => s.auth.error)
  const listCount = useAppSelector((s) => s.shopping.lists.length)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.name ?? '')
  const [surname, setSurname] = useState(user?.surname ?? '')
  const [cellNumber, setCellNumber] = useState(user?.cellNumber ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [password, setPassword] = useState('')

  const isLoading = status === 'loading'

 
  useEffect(() => {
    if (user) {
      setName(user.name)
      setSurname(user.surname)
      setCellNumber(user.cellNumber)
      setEmail(user.email)
    }
  }, [user, editing])

  
  if (!user) return null

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    if (isLoading) return

    dispatch(clearAuthError())
    const result = await dispatch(
      updateProfile({
        id: user!.id,
        name: name.trim(),
        surname: surname.trim(),
        cellNumber: cellNumber.trim(),
        email: email.trim(),
        password: password || undefined,
      })
    )

    if (updateProfile.fulfilled.match(result)) {
      dispatch(notify('Profile updated', 'success'))
      setPassword('')
      setEditing(false)
    }
  }

  function handleCancel() {
    setEditing(false)
    dispatch(clearAuthError())
  }

  function handleLogout() {
    
    navigate('/', { replace: true })
    dispatch(logout())
  }

  return (
    <div className="profile-page">
      <p className="profile-title">Profile</p>
      <p className="profile-subtitle">Your account details.</p>

      <div className="profile-card">
        {editing ? (
          <form onSubmit={handleSave} className="auth-form">
            <div className="field-row">
              <label className="field">
                <span className="field__label">First Name</span>
                <input 
                  required 
                  disabled={isLoading}
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="input" 
                />
              </label>

              <label className="field">
                <span className="field__label">Surname</span>
                <input 
                  required 
                  disabled={isLoading}
                  value={surname} 
                  onChange={(e) => setSurname(e.target.value)} 
                  className="input" 
                />
              </label>
            </div>
            
            <label className="field">
              <span className="field__label">Email Address</span>
              <input 
                type="email" 
                required 
                disabled={isLoading}
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="input" 
              />
            </label>

            <label className="field">
              <span className="field__label">Cell Number</span>
              <input 
                type="tel" 
                required 
                disabled={isLoading}
                value={cellNumber} 
                onChange={(e) => setCellNumber(e.target.value)} 
                className="input" 
              />
            </label>
            
            <label className="field">
              <span className="field__label">New Password (optional)</span>
              <input
                type="password"
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                className="input"
              />
            </label>

            {error && <p className="error-banner">{error}</p>}

            <div className="field-row">
              <button 
                type="submit" 
                disabled={isLoading} 
                className="btn btn-primary btn-block"
              >
                {isLoading ? 'Saving…' : 'Save changes'}
              </button>
              <button 
                type="button" 
                onClick={handleCancel} 
                disabled={isLoading} 
                className="btn btn-outline btn-block"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="profile-header">
              <span className="profile-avatar">
                <User size={20} />
              </span>
              <div>
                <p className="profile-name">{user.name} {user.surname}</p>
                <p className="profile-email">
                  <Mail size={13} />
                  {user.email}
                </p>
                <p className="profile-email">
                  <Phone size={13} />
                  {user.cellNumber}
                </p>
              </div>
            </div>

            <div className="profile-stat">
              <span className="profile-stat__label">Shopping lists</span>
              <span className="profile-stat__value">{listCount}</span>
            </div>

            <button type="button" onClick={() => setEditing(true)} className="profile-logout">
              <Pencil size={14} />
              Edit profile
            </button>
          </>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className="profile-logout profile-logout--danger"
        >
          <LogOut size={14} />
          Log out
        </button>
      </div>
    </div>
  )
}
