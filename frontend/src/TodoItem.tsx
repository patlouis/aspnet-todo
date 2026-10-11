import { Check, LoaderCircle, Pencil, Trash2, X } from 'lucide-react'
import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { getErrorMessage, type Todo } from './api'

interface Props {
  todo: Todo
  onToggle: (todo: Todo) => void
  onRename: (todo: Todo, title: string) => Promise<void>
  onDelete: (todo: Todo) => void
}

const iconButton =
  'inline-flex size-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-indigo-500 disabled:opacity-40 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'

// On devices with a mouse, row actions stay hidden until the row is hovered or focused.
// On touch screens (no hover) they're always visible.
const revealOnHover =
  '[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity'

export default function TodoItem({ todo, onToggle, onRename, onDelete }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(todo.title)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function startEditing() {
    setDraft(todo.title)
    setError(null)
    setEditing(true)
  }

  function cancelEditing() {
    setEditing(false)
    setError(null)
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    if (draft.trim() === todo.title) return cancelEditing()

    setSaving(true)
    setError(null)
    try {
      await onRename(todo, draft)
      setEditing(false)
    } catch (err) {
      setError(getErrorMessage(err, 'Could not save. Please try again.'))
    } finally {
      setSaving(false)
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') cancelEditing()
  }

  return (
    <li className="group px-3 py-2 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
      <div className="flex min-h-10 items-center gap-3">
        <label className="relative flex size-8 shrink-0 cursor-pointer items-center justify-center">
          <input
            type="checkbox"
            checked={todo.isDone}
            onChange={() => onToggle(todo)}
            aria-label={`Mark "${todo.title}" as ${todo.isDone ? 'not done' : 'done'}`}
            className="peer size-5 cursor-pointer appearance-none rounded-full border-2 border-zinc-300 transition-colors checked:border-indigo-600 checked:bg-indigo-600 hover:border-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-zinc-600 dark:checked:border-indigo-500 dark:checked:bg-indigo-500"
          />
          <Check
            className="pointer-events-none absolute hidden size-3 text-white peer-checked:block"
            strokeWidth={3}
            aria-hidden="true"
          />
        </label>

        {editing ? (
          <form onSubmit={handleSave} className="flex flex-1 items-center gap-1">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              aria-label="Task title"
              aria-invalid={error ? true : undefined}
              className="h-9 min-w-0 flex-1 rounded-md border border-zinc-300 bg-white px-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
            />
            <button type="submit" disabled={saving} className={iconButton} aria-label="Save">
              {saving ? <LoaderCircle className="size-4 animate-spin" /> : <Check className="size-4" />}
            </button>
            <button type="button" onClick={cancelEditing} className={iconButton} aria-label="Cancel editing">
              <X className="size-4" />
            </button>
          </form>
        ) : (
          <>
            <span
              onDoubleClick={startEditing}
              className={`flex-1 text-sm break-words transition-colors ${
                todo.isDone ? 'text-zinc-400 line-through dark:text-zinc-500' : 'text-zinc-800 dark:text-zinc-200'
              }`}
            >
              {todo.title}
            </span>
            <div className={`flex shrink-0 items-center ${revealOnHover}`}>
              <button type="button" onClick={startEditing} className={iconButton} aria-label={`Edit "${todo.title}"`}>
                <Pencil className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(todo)}
                className={`${iconButton} hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400`}
                aria-label={`Delete "${todo.title}"`}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-1 pl-11 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </li>
  )
}
