import { LoaderCircle, Plus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { getErrorMessage } from './api'

interface Props {
  onAdd: (title: string) => Promise<void>
}

export default function AddTodoForm({ onAdd }: Props) {
  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim() || saving) return

    setSaving(true)
    setError(null)
    try {
      await onAdd(title)
      setTitle('')
    } catch (err) {
      setError(getErrorMessage(err, 'Could not add the task. Please try again.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-b border-zinc-200 p-3 dark:border-zinc-800">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Plus
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400"
            aria-hidden="true"
          />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a new task…"
            aria-label="New task"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'add-error' : undefined}
            className="h-10 w-full rounded-lg bg-transparent pr-3 pl-9 text-sm placeholder:text-zinc-400 focus:bg-zinc-50 focus:outline-none dark:focus:bg-zinc-800/50"
          />
        </div>
        <button
          type="submit"
          disabled={!title.trim() || saving}
          className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {saving && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
          Add
        </button>
      </div>
      {error && (
        <p id="add-error" role="alert" className="mt-2 px-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </form>
  )
}
