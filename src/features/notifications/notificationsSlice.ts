import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface Notification{
    id: string
    kind: 'success' | 'error' | 'info'
    message: string
}

const notificationsSlice = createSlice({
    name: 'notifications',
    initialState: {items: [] as Notification[] } ,
    reducers: {
        notify: {
            reducer(state, action: PayloadAction<Notification>){
                state.items.push(action.payload)
            },
            prepare(message: string, kind: Notification['kind'] = 'success'){
                return {payload: {id: Date.now(), kind, message}}
            },
        },
        dismiss(state, action: PayloadAction<string>){
            state.items = state.items.filter((n) => n.id !== action payload)
        },
    },
})

export const { notify, dismiss } = notificationsSlice.actions
export default notificationsSlice.reducer