import { CircleAlert, ClipboardList, RotateCw, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import AddTodoForm from './AddTodoForm'
import { createTodo, deleteTodo, getTodos, updateTodo, type Todo } from './api'
import TodoFooter, { type Filter } from './TodoFooter'
import TodoItem from './TodoItem'

const byId = (a: Todo, b: Todo) => a.id - b.id

// Computed once at page load rather than on every render.
const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })

const emptyMessages: Record<Filter, { title: string; hint: string }> = {
  all: { title: 'No tasks yet', hint: 'Add your first task above to get started.' },
  active: { title: 'All caught up', hint: 'You have no active tasks.' },
  completed: { title: 'Nothing completed yet', hint: 'Tick off a task and it will show up here.' },
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('all')

  // READ: state is only set once the request settles, never synchronously in the effect.
  const fetchTodos = useCallback(
    () =>
      getTodos()
        .then((data) => {
          setTodos(data)
          setLoadFailed(false)
        })
        .catch(() => setLoadFailed(true))
        .finally(() => setLoading(false)),
    [],
  )

  useEffect(() => {
    fetchTodos()
  }, [fetchTodos])

  function retry() {
    setLoading(true)
    fetchTodos()
  }

  // CREATE: wait for the API, because it assigns the id. Errors are shown by the form.
  async function handleAdd(title: string) {
    const created = await createTodo({ title, isDone: false })
    setTodos((prev) => [...prev, created])
  }

  // UPDATE (checkbox): optimistic — flip it immediately, roll back if the API refuses.
  async function handleToggle(todo: Todo) {
    const toggled = { ...todo, isDone: !todo.isDone }
    setTodos((prev) => prev.map((t) => (t.id === todo.id ? toggled : t)))
    try {
      setError(null)
      await updateTodo(todo.id, { title: todo.title, isDone: toggled.isDone })
    } catch {
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? todo : t)))
      setError(`Couldn't update "${todo.title}". Please try again.`)
    }
  }

  // UPDATE (title): wait for the API, since it may reject the title. Errors are shown in the row.
  async function handleRename(todo: Todo, title: string) {
    await updateTodo(todo.id, { title, isDone: todo.isDone })
    setTodos((prev) => prev.map((t) => (t.id === todo.id ? { ...t, title: title.trim() } : t)))
  }

  // DELETE: optimistic — remove immediately, put it back if the API refuses.
  async function handleDelete(todo: Todo) {
    setTodos((prev) => prev.filter((t) => t.id !== todo.id))
    try {
      setError(null)
      await deleteTodo(todo.id)
    } catch {
      setTodos((prev) => [...prev, todo].sort(byId))
      setError(`Couldn't delete "${todo.title}". Please try again.`)
    }
  }

  async function handleClearCompleted() {
    const done = todos.filter((t) => t.isDone)
    setTodos((prev) => prev.filter((t) => !t.isDone))
    setError(null)

    const results = await Promise.allSettled(done.map((t) => deleteTodo(t.id)))
    const failed = done.filter((_, i) => results[i].status === 'rejected')
    if (failed.length > 0) {
      setTodos((prev) => [...prev, ...failed].sort(byId))
      setError(`Couldn't delete ${failed.length} completed ${failed.length === 1 ? 'task' : 'tasks'}.`)
    }
  }

  const remaining = todos.filter((t) => !t.isDone).length
  const completed = todos.length - remaining
  const visible = todos.filter((t) => (filter === 'all' ? true : filter === 'active' ? !t.isDone : t.isDone))

  return (
    <main className="mx-auto max-w-xl px-4 py-12 sm:py-20">
      <header className="mb-6">
        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{today}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">My Tasks</h1>
        {!loading && !loadFailed && todos.length > 0 && (
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {completed} of {todos.length} completed
          </p>
        )}
      </header>

      <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <AddTodoForm onAdd={handleAdd} />

        {error && (
          <div
            role="alert"
            className="flex items-center gap-2 border-b border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
          >
            <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
            <span className="flex-1">{error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              aria-label="Dismiss"
              className="rounded p-0.5 hover:bg-red-100 dark:hover:bg-red-500/20"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {loading ? (
          <ul aria-label="Loading tasks" className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {[60, 45, 70].map((width) => (
              <li key={width} className="flex items-center gap-3 px-4 py-4">
                <div className="size-5 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" style={{ width: `${width}%` }} />
              </li>
            ))}
          </ul>
        ) : loadFailed ? (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <CircleAlert className="size-10 text-red-500" strokeWidth={1.5} aria-hidden="true" />
            <p className="mt-3 font-medium">Couldn't load your tasks</p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Make sure the backend is running on port 5199.
            </p>
            <button
              type="button"
              onClick={retry}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-indigo-500 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              <RotateCw className="size-4" aria-hidden="true" />
              Try again
            </button>
          </div>
        ) : (
          <>
            {visible.length > 0 ? (
              <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {visible.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={handleToggle}
                    onRename={handleRename}
                    onDelete={handleDelete}
                  />
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center px-6 py-14 text-center">
                <ClipboardList className="size-10 text-zinc-300 dark:text-zinc-700" strokeWidth={1.5} aria-hidden="true" />
                <p className="mt-3 font-medium">{emptyMessages[filter].title}</p>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{emptyMessages[filter].hint}</p>
              </div>
            )}

            {todos.length > 0 && (
              <TodoFooter
                remaining={remaining}
                completed={completed}
                filter={filter}
                onFilterChange={setFilter}
                onClearCompleted={handleClearCompleted}
              />
            )}
          </>
        )}
      </section>

      {todos.length > 0 && (
        <p className="mt-4 text-center text-xs text-zinc-400 dark:text-zinc-500 [@media(hover:none)]:hidden">
          Double-click a task to edit · Enter to save · Esc to cancel
        </p>
      )}
    </main>
  )
}
