import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { type PayloadAction } from '@reduxjs/toolkit'
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


const sortListsByDate = (lists: ShoppingList[]) => {
  lists.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
}

export const fetchLists = createAsyncThunk<ShoppingList[], string, { rejectValue: string }>(
  'shopping/fetchLists',

  async (userId, {rejectWithValue} ) => {
    try {
     return await api.get<ShoppingList[]>(`/lists?userId=${userId}&_sort=-updatedAt`)
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
  { id: string; name: string; category: string },
  { rejectValue: string }
>('shopping/renameList', async ({ id, name, category }, { rejectWithValue }) => {
  try {
    return await api.patch<ShoppingList>(`/lists/${id}`, { 
      name, 
      category, 
      updatedAt: new Date().toISOString() 
    })
  } catch (err) {
    return rejectWithValue(errMsg(err, 'Could not rename the list.'))
  }
})

export const deleteList = createAsyncThunk<string, string, { rejectValue: string }>(
  'shopping/deleteList',
  async (id, { rejectWithValue }) => {
    try {
      const items = (await api.get<ShoppingItem[]>(`/items?listId=${id}`)) ?? []
      if (items.length > 0) {
        await Promise.all(items.map((item) => api.delete(`/items/${item.id}`)))
      }
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
    return { listId, items: items ?? [] }
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
      const now = new Date().toISOString()
      const item = await api.post<ShoppingItem>('/items', {
        ...input,
        checked: false,
        createdAt: now,
      })
      await api.patch(`/list/${input.listId}`, { updatedAt: now })
      return item
    } catch (err) {
      return rejectWithValue(errMsg(err, 'Could not add the item.'))
    }
  }
)

export const updateItem = createAsyncThunk<
  { item: ShoppingItem; listUpdatedAt: string },
  { id: string; listId: string; patch: Partial<ShoppingItem> },
  { rejectValue: string }
>('shopping/updateItem', async ({ id, listId, patch }, { rejectWithValue }) => {
  try {
    const now = new Date().toISOString()
    const item = await api.patch<ShoppingItem>(`/items/${id}`, patch)
    await api.patch(`/list/${listId}`, { updatedAt: now })
    return { item, listUpdatedAt: now } 
  } catch (err) {
    return rejectWithValue(errMsg(err, 'Could not update the item.'))
  }
})

export const deleteItem = createAsyncThunk<
  { id: string; listId: string; listUpdatedAt: string },
  { id: string; listId: string },
  { rejectValue: string }
>('shopping/deleteItem', async ({ id, listId }, { rejectWithValue }) => {
  try {
    const now = new Date().toISOString()
    await api.delete(`/items/${id}`)
    await api.patch(`/lists/${listId}`, { updatedAt: now })
    return { id, listId, listUpdatedAt: now }
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
        state.lists = action.payload ?? []
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
        if (index !== -1) {
          state.lists[index] = action.payload
          sortListsByDate(state.lists)
        }
      })
      .addCase(deleteList.fulfilled, (state, action) => {
        state.lists = state.lists.filter((l) => l.id !== action.payload)
        delete state.itemsByList[action.payload]
      })
      .addCase(fetchItems.pending, (state) => {
        state.itemsStatus = 'loading'
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.itemsStatus = 'idle'
        state.itemsByList[action.payload.listId] = action.payload.items ?? []
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.itemsStatus = 'error'
        state.error = action.payload ?? null
      })
      .addCase(createItem.fulfilled, (state, action) => {
        const { listId, createdAt } = action.payload
        if (!state.itemsByList[listId]) state.itemsByList[listId] = []
        state.itemsByList[listId].push(action.payload)
        
        const parentList = state.lists.find((l) => l.id === listId)
        if (parentList) {
          parentList.updatedAt = createdAt
          sortListsByDate(state.lists)
        }
      })
      .addCase(updateItem.fulfilled, (state, action) => {
        const { item, listUpdatedAt } = action.payload
        const items = state.itemsByList[item.listId]
        if (items) {
          const index = items.findIndex((i) => i.id === item.id)
          if (index !== -1) items[index] = item
        }
        
        const parentList = state.lists.find((l) => l.id === item.listId)
        if (parentList) {
          parentList.updatedAt = listUpdatedAt
          sortListsByDate(state.lists)
        }
      })
      .addCase(deleteItem.fulfilled, (state, action) => {
        const { listId, id, listUpdatedAt } = action.payload
        const items = state.itemsByList[listId]
        if (items) {
          state.itemsByList[listId] = items.filter((i) => i.id !== id)
        }
        
        const parentList = state.lists.find((l) => l.id === listId)
        if (parentList) {
          parentList.updatedAt = listUpdatedAt
          sortListsByDate(state.lists)
        }
      })
  },
})

export const { clearShoppingError } = shoppingSlice.actions
export default shoppingSlice.reducer
