'use client'

import { RefreshCw } from 'lucide-react'

interface Props {
  title: string
  icon: string
  children: React.ReactNode
  onRefresh?: () => void
  lastUpdated?: Date | null
  loading?: boolean
  error?: string | null
}

export default function WidgetCard({
  title, icon, children, onRefresh, lastUpdated, loading, error,
}: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl" role="img" aria-hidden>{icon}</span>
          <h2 className="font-semibold text-gray-700 dark:text-gray-200">{title}</h2>
        </div>

        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-gray-400">
              {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              title="Refresh"
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-40"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          )}
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm">
          ⚠️ {error}
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-7 h-7 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        children
      )}
    </div>
  )
}
