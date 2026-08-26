// This file collects the simple "shapes" of our data in one place, so
// every file that needs them can just import from here instead of
// re-declaring the same interface over and over.
//
// An `interface` in TypeScript describes what properties an object
// must have, and what type each property is. It doesn't do anything
// at runtime — it just helps catch mistakes while we're coding (for
// example, forgetting to pass `category` when creating a list).

// The user record as it's stored on the server (includes the hashed
// password).
export interface StoredUser {
  id: string
  name: string
  surname: string
  cellNumber: string
  email: string
  password: string
}

// The user info we're allowed to keep in Redux / localStorage. Notice
// this is the same as StoredUser but without `password` — we never
// want the hash sitting around in the browser longer than it has to.
export interface PublicUser {
  id: string
  name: string
  surname: string
  cellNumber: string
  email: string
}

export interface ShoppingList {
  id: string
  userId: string
  name: string
  category: string
  createdAt: string
  updatedAt: string
}

export interface ShoppingItem {
  id: string
  listId: string
  name: string
  quantity: string
  notes: string
  category: string
  image: string
  checked: boolean
  createdAt: string
}

export type NotificationKind = 'success' | 'error' | 'info'

export interface AppNotification {
  id: string
  kind: NotificationKind
  message: string
}
