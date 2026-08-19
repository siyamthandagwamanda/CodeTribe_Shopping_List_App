export interface User{
    id: string;
    email: string;
    name: string;
    surname: string;
    cellnumber: string;
}

export interface KeptUser extends User{
    password: string;
}

export type SortKey = 'name' | 'category' | 'dataAdded'

export interface ShoppingItem{
    id: number;
    listId: string;
    name: string;
    quantity: number;
    notes: string;
    category: string;
    image: string;
    checked: boolean;
    createdAt: string;
}

export interface ShoppingList{
    id: number;
    userId: string;
    name: string;
    category: string;
    createdAt: string;
    updatedAt: string;
}