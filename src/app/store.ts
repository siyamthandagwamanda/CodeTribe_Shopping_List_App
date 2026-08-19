import { configureStore } from "@reduxjs/toolkit";
import authReducer from '@/features/auth/authSlice';
import shoppingReducer from '@/features/shopping-list/shoppingSlice';
import notificationReducer from '@/features/notifications/notificationsSlice';


export const store =  configureStore({
    reducer: {
       auth: authReducer ,
       shopping: shoppingReducer ,
       notifications: notificationReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch