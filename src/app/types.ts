export interface User{
    id: string;
    email: string;
    name: string;
    surname: string;
    cellNumber: string;
}

export interface KeptUser extends User{
    password: string;
}

export type SortKey = 'name' | 'category' | 'dateAdded'

export interface ShoppingItem{
    id: string;
    listId: string;
    name: string;
    quantity: string;
    notes: string;
    category: string;
    image: string;
    checked: boolean;
    createdAt: string;
}

export interface ShoppingList{
    id: string;
    userId: string;
    name: string;
    category: string;
    createdAt: string;
    updatedAt: string;
}
