const BASE_URL = 'http:localhost:3001'

export class ApiError extends Error{
    status: number 
    constructor(message: string, status: number){
        super(message)
        this.status = status
    }
}

async function request<T>(path: string, init?: RequestInit): Promise<T>{

    let res: Response
    try{
        res = await fetch(`${BASE_URL}${path}`, {
            headers: {'Content-Type': 'application/json'},
            ...init,
        })

    }catch{
        throw new Error("Can't reach the Api Server. Run `npm run server`.",);
    }
    if (!res.ok) throw new Error(`Request failed: ${res.status}`) /*res.status*/
    if (res.status === 204) return undefined as T
    return (await res.json()) as T
}

export const api = {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body: unknown) => request<T>(path, {method: 'POST', body: JSON.stringify(body)}),
    patch: <T>(path: string, body: unknown) => request<T>(path, {method: 'PATCH', body: JSON.stringify(body)}),
    delete: (path: string) => request<void>(path, {method: 'DELETE'})
    
}