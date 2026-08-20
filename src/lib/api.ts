const BASE_URL = 'http://localhost:3000';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'Error';
  }
}

async function request<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  let res: Response;

  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    });
  } catch {
    throw new Error(
      "Can't reach the API Server. Run `npm run server`."
    );
  }

  if (!res.ok) {
    throw new ApiError(
      `Request failed with status ${res.status}`,
      res.status
    );
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

export const api = {
  get: <T>(
    path: string,
    init?: Omit<RequestInit, 'method'>
  ) =>
    request<T>(path, {
      ...init,
      method: 'GET',
    }),

  post: <T>(
    path: string,
    body: unknown,
    init?: Omit<RequestInit, 'method'>
  ) =>
    request<T>(path, {
      ...init,
      method: 'POST',
      body: JSON.stringify(body),
    }),

  patch: <T>(
    path: string,
    body: unknown,
    init?: Omit<RequestInit, 'method'>
  ) =>
    request<T>(path, {
      ...init,
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  delete: (
    path: string,
    init?: Omit<RequestInit, 'method'>
  ) =>
    request<void>(path, {
      ...init,
      method: 'DELETE',
    }),
};