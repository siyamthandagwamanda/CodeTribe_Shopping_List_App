import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { ShoppingList, ShoppingItem } from '@/app/types'
import { api, ApiError } from '@/lib/api'

interface ShoppingState {
  lists: ShoppingList[]
  listsStatus: 'idle' | 'loading' | 'error'
  itemsByList: Record<string, ShoppingItem[]>
  itemsStatus: 'idle' | 'loading' | 'error'
  error: string | null
}

const initialState: ShoppingState = {
  lists: [],
  listsStatus: 'idle',
  itemsByList: {},
  itemsStatus: 'idle',
  error: null,
}

function errMsg(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback
}

export const fetchLists = createAsyncThunk<ShoppingList[], string, { rejectValue: string }>(
  'shopping/fetchLists',
  async (userId, { rejectWithValue }) => {
    try {
      return await api.get<ShoppingList[]>(`/lists?userId=${userId}&_sort=updatedAt&_order=desc`)
    } catch (err) {
      return rejectWithValue(errMsg(err, 'Could not load your lists.'))
    }
  }
)

export const createList = createAsyncThunk<
  ShoppingList,
  { userId: string; name: string; category: string },
  { rejectValue: string }

>('shopping/createList', async ({ userId, name, category }, { rejectWithValue }) => {
  try {
    const now = new Date().toISOString()
    return await api.post<ShoppingList>('/lists', {
      id: crypto.randomUUID(),
      userId,
      name,
      category,
      createdAt: now,
      updatedAt: now,
    })
  } catch (err) {
    return rejectWithValue(errMsg(err, 'Could not create the list.'))
  }
})

export const renameList = createAsyncThunk<
  ShoppingList,
  { id: string; name: string },
  { rejectValue: string }

>('shopping/renameList', async ({ id, name }, { rejectWithValue }) => {
  try {
    return await api.patch<ShoppingList>(`/lists/${id}`, { name, updatedAt: new Date().toISOString() })
  } catch (err) {
    return rejectWithValue(errMsg(err, 'Could not rename the list.'))
  }
})

export const deleteList = createAsyncThunk<string, string, { rejectValue: string }>(
  'shopping/deleteList',
  async (id, { rejectWithValue }) => {
    try {
      
      const items = await api.get<ShoppingItem[]>(`/items?listId=${id}`)
      await Promise.all(items.map((item) => api.delete(`/items/${item.id}`)))
      await api.delete(`/lists/${id}`)
      return id
    } catch (err) {
      return rejectWithValue(errMsg(err, 'Could not delete the list.'))
    }
  }
)

export const fetchItems = createAsyncThunk<
  { listId: string; items: ShoppingItem[] },
  string,
  { rejectValue: string }

>('shopping/fetchItems', async (listId, { rejectWithValue }) => {
  try {
    const items = await api.get<ShoppingItem[]>(`/items?listId=${listId}`)
    return { listId, items }
  } catch (err) {
    return rejectWithValue(errMsg(err, 'Could not load items.'))
  }
})

export interface NewItemInput {
  listId: string
  name: string
  quantity: string
  notes: string
  category: string
  image: string
}

export const createItem = createAsyncThunk<ShoppingItem, NewItemInput, { rejectValue: string }>(
  'shopping/createItem',
  async (input, { rejectWithValue }) => {
    try {
      return await api.post<ShoppingItem>('/items', {
        id: crypto.randomUUID(),
        ...input,
        checked: false,
        createdAt: new Date().toISOString(),
      })
    } catch (err) {
      return rejectWithValue(errMsg(err, 'Could not add the item.'))
    }
  }
)

export const updateItem = createAsyncThunk<
  ShoppingItem,
  { id: string; listId: string; patch: Partial<ShoppingItem> },
  { rejectValue: string }

>('shopping/updateItem', async ({ id, patch }, { rejectWithValue }) => {
  try {
    return await api.patch<ShoppingItem>(`/items/${id}`, patch)
  } catch (err) {
    return rejectWithValue(errMsg(err, 'Could not update the item.'))
  }
})

export const deleteItem = createAsyncThunk<
  { id: string; listId: string },
  { id: string; listId: string },
  { rejectValue: string }
>('shopping/deleteItem', async ({ id, listId }, { rejectWithValue }) => {
  try {
    await api.delete(`/items/${id}`)
    return { id, listId }
  } catch (err) {
    return rejectWithValue(errMsg(err, 'Could not delete the item.'))
  }
})

const shoppingSlice = createSlice({
  name: 'shopping',
  initialState,
  reducers: {
    clearShoppingError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
    
      .addCase(fetchLists.pending, (state) => {
        state.listsStatus = 'loading'
      })
      .addCase(fetchLists.fulfilled, (state, action) => {
        state.listsStatus = 'idle'
        state.lists = action.payload
      })
      .addCase(fetchLists.rejected, (state, action) => {
        state.listsStatus = 'error'
        state.error = action.payload ?? null
      })
      .addCase(createList.fulfilled, (state, action) => {
        state.lists.unshift(action.payload)
      })
      .addCase(renameList.fulfilled, (state, action) => {
        const index = state.lists.findIndex((l) => l.id === action.payload.id)
        if (index !== -1) state.lists[index] = action.payload
      })
      .addCase(deleteList.fulfilled, (state, action) => {
        state.lists = state.lists.filter((l) => l.id !== action.payload)
        delete state.itemsByList[action.payload]
      })
      
      .addCase(fetchItems.pending, (state) => {
        state.itemsStatus = 'loading'
      })
      .addCase(fetchItems.fulfilled, (state, action: PayloadAction<{ listId: string; items: ShoppingItem[] }>) => {
        state.itemsStatus = 'idle'
        state.itemsByList[action.payload.listId] = action.payload.items
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.itemsStatus = 'error'
        state.error = action.payload ?? null
      })
      .addCase(createItem.fulfilled, (state, action) => {
        const listId = action.payload.listId
        state.itemsByList[listId] = [...(state.itemsByList[listId] ?? []), action.payload]
      })
      .addCase(updateItem.fulfilled, (state, action) => {
        const list = state.itemsByList[action.payload.listId]
        if (list) {
          const index = list.findIndex((i) => i.id === action.payload.id)
          if (index !== -1) list[index] = action.payload
        }
      })
      .addCase(deleteItem.fulfilled, (state, action) => {
        const list = state.itemsByList[action.payload.listId]
        if (list) {
          state.itemsByList[action.payload.listId] = list.filter((i) => i.id !== action.payload.id)
        }
      })
  },
})

export const { clearShoppingError } = shoppingSlice.actions
export default shoppingSlice.reducer
