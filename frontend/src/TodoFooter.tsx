export type Filter = 'all' | 'active' | 'completed'

const filters: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
]

interface Props {
  remaining: number
  completed: number
  filter: Filter
  onFilterChange: (filter: Filter) => void
  onClearCompleted: () => void
}

export default function TodoFooter({ remaining, completed, filter, onFilterChange, onClearCompleted }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-200 px-4 py-2.5 text-sm dark:border-zinc-800">
      <span className="text-zinc-500 tabular-nums dark:text-zinc-400">
        {remaining} {remaining === 1 ? 'task' : 'tasks'} left
      </span>

      {/* On phones the filters drop to their own full-width row; from `sm` up they sit in the middle. */}
      <div
        role="group"
        aria-label="Filter tasks"
        className="order-last flex w-full rounded-lg bg-zinc-100 p-0.5 sm:order-none sm:w-auto dark:bg-zinc-800"
      >
        {filters.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => onFilterChange(value)}
            aria-pressed={filter === value}
            className={`flex-1 rounded-md px-3 py-1 text-xs sm:flex-none font-medium transition-colors focus-visible:outline-2 focus-visible:outline-indigo-500 ${
              filter === value
                ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onClearCompleted}
        disabled={completed === 0}
        className="rounded-md px-2 py-1 text-zinc-500 transition-colors hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-indigo-500 disabled:invisible dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        Clear completed
      </button>
    </div>
  )
}
