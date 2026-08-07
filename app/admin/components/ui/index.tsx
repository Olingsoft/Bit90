'use client'

import React from 'react'

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = 'neutral',
}: {
  label: string
  value: string
  sub?: string
  icon: React.ElementType
  tone?: 'neutral' | 'positive' | 'negative' | 'warning'
}) {
  const toneClasses = {
    neutral: 'text-slate-100 dark:text-slate-100',
    positive: 'text-emerald-500 dark:text-emerald-400',
    negative: 'text-rose-500 dark:text-rose-400',
    warning: 'text-amber-500 dark:text-amber-400',
  }[tone]

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[0.06] dark:bg-[#12161f] dark:shadow-black/20">
      <div className="flex items-start justify-between">
        <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <div className="rounded-lg bg-slate-100 p-1.5 text-slate-500 dark:bg-white/[0.04] dark:text-slate-400">
          <Icon size={16} />
        </div>
      </div>
      <h2 className={`mt-3 text-2xl font-semibold tabular-nums tracking-tight ${toneClasses}`}>{value}</h2>
      {sub && <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{sub}</p>}
    </div>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/30 dark:text-emerald-300',
    completed: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/30 dark:text-emerald-300',
    approved: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/30 dark:text-emerald-300',
    pending: 'bg-amber-500/10 text-amber-600 ring-amber-500/30 dark:text-amber-300',
    open: 'bg-sky-500/10 text-sky-600 ring-sky-500/30 dark:text-sky-300',
    hold: 'bg-orange-500/10 text-orange-600 ring-orange-500/30 dark:text-orange-300',
    rejected: 'bg-rose-500/10 text-rose-600 ring-rose-500/30 dark:text-rose-300',
    suspended: 'bg-rose-500/10 text-rose-600 ring-rose-500/30 dark:text-rose-300',
    closed: 'bg-slate-500/10 text-slate-600 ring-slate-500/30 dark:text-slate-400',
    draft: 'bg-slate-500/10 text-slate-600 ring-slate-500/30 dark:text-slate-400',
    urgent: 'bg-rose-500/10 text-rose-600 ring-rose-500/30 dark:text-rose-300',
    high: 'bg-orange-500/10 text-orange-600 ring-orange-500/30 dark:text-orange-300',
    normal: 'bg-slate-500/10 text-slate-600 ring-slate-500/30 dark:text-slate-400',
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ring-inset ${
        styles[status.toLowerCase()] ?? 'bg-slate-500/10 text-slate-600 ring-slate-500/30'
      }`}
    >
      {status}
    </span>
  )
}

export function SectionHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
        {description && <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function SearchInput({ placeholder, value, onChange }: { placeholder?: string; value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="search"
      placeholder={placeholder ?? 'Search...'}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full max-w-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-1 ring-transparent transition focus:ring-sky-500 dark:border-white/[0.08] dark:bg-slate-950/70 dark:text-slate-100"
    />
  )
}

export function DataTable({
  columns,
  rows,
  emptyMessage = 'No records found',
}: {
  columns: { key: string; label: string; render?: (row: Record<string, unknown>) => React.ReactNode }[]
  rows: Record<string, unknown>[]
  emptyMessage?: string
}) {
  return (
    <div className="overflow-auto rounded-xl border border-slate-200 bg-white dark:border-white/[0.06] dark:bg-[#12161f]">
      <table className="w-full table-auto text-left">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-white/[0.06]">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 font-medium">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05]">
          {rows.length > 0 ? (
            rows.map((row, idx) => (
              <tr key={String(row.id ?? idx)} className="text-sm text-slate-700 dark:text-slate-300">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    {col.render ? col.render(row) : String(row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export function MiniBarChart({
  data,
  title,
  color = 'sky',
  secondaryColor,
}: {
  data: { label: string; value: number; value2?: number }[]
  title: string
  color?: string
  secondaryColor?: string
}) {
  const max = Math.max(...data.flatMap((d) => [d.value, d.value2 ?? 0]), 1)
  const barColor = color === 'sky' ? 'bg-sky-500' : color === 'emerald' ? 'bg-emerald-500' : 'bg-violet-500'
  const bar2Color = secondaryColor === 'rose' ? 'bg-rose-400' : 'bg-amber-400'

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-white/[0.06] dark:bg-[#12161f]">
      <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      <div className="flex h-36 items-end gap-2">
        {data.map((point) => (
          <div key={point.label} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex w-full items-end justify-center gap-0.5" style={{ height: '120px' }}>
              <div
                className={`w-full max-w-[14px] rounded-t ${barColor}`}
                style={{ height: `${(point.value / max) * 100}%`, minHeight: point.value > 0 ? '4px' : '0' }}
                title={String(point.value)}
              />
              {point.value2 !== undefined && (
                <div
                  className={`w-full max-w-[14px] rounded-t ${bar2Color}`}
                  style={{ height: `${(point.value2 / max) * 100}%`, minHeight: point.value2 > 0 ? '4px' : '0' }}
                  title={String(point.value2)}
                />
              )}
            </div>
            <span className="text-[10px] text-slate-500">{point.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Toast({ message, tone }: { message: string; tone: 'success' | 'error' | 'info' }) {
  const tones = {
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    error: 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300',
    info: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  }
  return (
    <div className={`fixed bottom-6 right-6 z-50 rounded-lg border px-4 py-3 text-sm shadow-lg ${tones[tone]}`}>
      {message}
    </div>
  )
}

export function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-white/[0.08] dark:bg-[#12161f]">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 dark:border-white/10 dark:text-slate-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-400"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false)
  return (
    <button
      onClick={() => {
        if (!text) return
        navigator.clipboard?.writeText(text).catch(() => {})
        setCopied(true)
        setTimeout(() => setCopied(false), 1200)
      }}
      className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/[0.08]"
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

export function Pagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (p: number) => void }) {
  return (
    <div className="flex items-center justify-between pt-4 text-sm text-slate-500">
      <span>
        Page {page} of {totalPages}
      </span>
      <div className="flex gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-md border border-slate-200 px-3 py-1 disabled:opacity-40 dark:border-white/10"
        >
          Previous
        </button>
        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-md border border-slate-200 px-3 py-1 disabled:opacity-40 dark:border-white/10"
        >
          Next
        </button>
      </div>
    </div>
  )
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-10 text-center dark:border-white/[0.06] dark:bg-[#12161f]">
      <h2 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  )
}

export function ActionButton({
  children,
  variant = 'primary',
  onClick,
  disabled,
}: {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  onClick?: () => void
  disabled?: boolean
}) {
  const styles = {
    primary: 'bg-sky-500 text-white hover:bg-sky-400',
    secondary: 'border border-slate-200 text-slate-700 dark:border-white/10 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.05]',
    danger: 'bg-rose-500/10 text-rose-600 ring-1 ring-rose-500/30 dark:text-rose-300 hover:bg-rose-500/20',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]}`}
    >
      {children}
    </button>
  )
}
