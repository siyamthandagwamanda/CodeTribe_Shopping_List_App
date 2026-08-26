import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import bcrypt from 'bcryptjs'
import type { User, KeptUser } from '@/app/types'
import { readStorage, writeStorage } from '@/lib/storage'
import { api, ApiError } from '@/lib/api'

const SESSION_KEY = 'shopsort_session'
const SALT_ROUNDS = 10

function toPublicUser(stored: KeptUser): User {
  const { password: _password, ...publicUser } = stored
  return publicUser
}

interface AuthState {
  user: User | null
  status: 'idle' | 'loading' | 'error'
  error: string | null
}

const initialState: AuthState = {
  user: readStorage<User | null>(SESSION_KEY, null),
  status: 'idle',
  error: null,
}

export const registerUser = createAsyncThunk<
  User,
  { name: string; surname: string; cellNumber: string; email: string; password: string },
  { rejectValue: string }
>('auth/register', async (form, { rejectWithValue }) => {
  try {
    const targetEmail = form.email.toLowerCase()
    
    const matches = await api.get<KeptUser[]>(`/users?email=${encodeURIComponent(targetEmail)}`)
    const exactMatch = matches.find(u => u.email.toLowerCase() === targetEmail)
    
    if (exactMatch) {
      return rejectWithValue('An account with that email already exists.')
    }
   
    const passwordHash = await bcrypt.hash(form.password, SALT_ROUNDS)

    
    const created = await api.post<KeptUser>('/users', {
      name: form.name,
      surname: form.surname,
      cellNumber: form.cellNumber,
      email: targetEmail,
      password: passwordHash,
    })

    const publicUser = toPublicUser(created)
    writeStorage(SESSION_KEY, publicUser)
    return publicUser

  } catch (err) {
    if (err instanceof ApiError) return rejectWithValue(err.message)
    return rejectWithValue('Something went wrong. Try again.')
  }
})

export const loginUser = createAsyncThunk<
  User,
  { email: string; password: string },
  { rejectValue: string }
>('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const targetEmail = email.toLowerCase()
    const matches = await api.get<KeptUser[]>(`/users?email=${encodeURIComponent(targetEmail)}`)

    const account = matches.find(u => u.email.toLowerCase() === targetEmail)
    if (!account) {
      return rejectWithValue('Email or password is incorrect.')
    }
    
    const passwordMatches = await bcrypt.compare(password, account.password)
    if (!passwordMatches) {
      return rejectWithValue('Email or password is incorrect.')
    }

    const publicUser = toPublicUser(account)
    writeStorage(SESSION_KEY, publicUser)
    return publicUser
  } catch (err) {
    if (err instanceof ApiError) return rejectWithValue(err.message)
    return rejectWithValue('Something went wrong. Try again.')
  }
})

export const updateProfile = createAsyncThunk<
  User,
  { id: string; name: string; surname: string; cellNumber: string; email: string; password?: string },
  { rejectValue: string }
>('auth/updateProfile', async (form, { rejectWithValue }) => {
  try {
    const targetEmail = form.email.toLowerCase()

    const matches = await api.get<KeptUser[]>(`/users?email=${encodeURIComponent(targetEmail)}`)
    const duplicate = matches.find(u => u.email.toLowerCase() === targetEmail && u.id !== form.id)
    if (duplicate) {
      return rejectWithValue('This email is already in use by another account.')
    }

    const patch: Partial<KeptUser> = {
      name: form.name,
      surname: form.surname,
      cellNumber: form.cellNumber,
      email: targetEmail,
    }

    if (form.password) {
      patch.password = await bcrypt.hash(form.password, SALT_ROUNDS)
    }

    const updated = await api.patch<KeptUser>(`/users/${form.id}`, patch)

    const publicUser = toPublicUser(updated)
    writeStorage(SESSION_KEY, publicUser)

    return publicUser
    
  } catch (err) {
    if (err instanceof ApiError) return rejectWithValue(err.message)
    return rejectWithValue('Could not update profile. Try again.')
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null
      state.status = 'idle'
      state.error = null
      
      writeStorage(SESSION_KEY, null)
    },
    clearAuthError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = 'idle'
        state.user = action.payload
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'error'
        state.error = action.payload ?? 'Something went wrong. Try again.'
      })
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = 'idle'
        state.user = action.payload
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'error'
        state.error = action.payload ?? 'Something went wrong. Try again.'
      })
      .addCase(updateProfile.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = 'idle'
        state.user = action.payload
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.status = 'error'
        state.error = action.payload ?? 'Could not update profile.'
      })
  },
})

export const { logout, clearAuthError } = authSlice.actions
export default authSlice.reducer
