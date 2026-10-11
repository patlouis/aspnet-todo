// The only file that knows how to talk to the backend.
// Shapes mirror backend/Models/Todo.cs and TodoInput.cs (camelCase in JSON).

export interface Todo {
  id: number
  title: string
  isDone: boolean
}

export interface TodoInput {
  title: string
  isDone: boolean
}

// Thrown for any non-2xx response. For a 400, `errors` holds the API's
// validation messages, e.g. { title: ["Title is required."] }.
export class ApiError extends Error {
  status: number
  errors: Record<string, string[]>

  constructor(status: number, message: string, errors: Record<string, string[]> = {}) {
    super(message)
    this.status = status
    this.errors = errors
  }
}

// Best human-readable message for an error: the API's validation message if
// there is one, otherwise the given fallback.
export function getErrorMessage(err: unknown, fallback: string): string {
  if (!(err instanceof ApiError)) return fallback
  return Object.values(err.errors)[0]?.[0] ?? fallback
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })

  if (!res.ok) {
    // ASP.NET returns ValidationProblem as JSON; other errors may have no body.
    const body = await res.json().catch(() => null)
    throw new ApiError(res.status, body?.title ?? `Request failed (${res.status})`, body?.errors)
  }

  // 204 No Content (PUT, DELETE) has no body to parse.
  return (res.status === 204 ? undefined : await res.json()) as T
}

export const getTodos = () => request<Todo[]>('/todos')

export const createTodo = (input: TodoInput) =>
  request<Todo>('/todos', { method: 'POST', body: JSON.stringify(input) })

export const updateTodo = (id: number, input: TodoInput) =>
  request<void>(`/todos/${id}`, { method: 'PUT', body: JSON.stringify(input) })

export const deleteTodo = (id: number) =>
  request<void>(`/todos/${id}`, { method: 'DELETE' })
