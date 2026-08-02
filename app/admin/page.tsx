'use client'

import React, { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  Activity,
  LineChart,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Wallet,
  Percent,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react'
import { API_URL } from '@/lib/api'
import { useRouter } from 'next/navigation'

// ---------------------------------------------------------------------------
// Dummy summary data — swap for real endpoints when available.
// ---------------------------------------------------------------------------
const AVIATOR_SUMMARY = {
  rounds: 1284,
  wins: 812,
  losses: 472,
  profit: 128450,
  winRate: 63.2,
}

const TRADING_SUMMARY = {
  trades: 356,
  wins: 201,
  losses: 155,
  pnl: 42380,
  winRate: 56.5,
}

type Page = 'dashboard' | 'aviator' | 'trading' | 'settings'

const NAV_ITEMS: { key: Page; label: string; icon: React.ElementType }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'aviator', label: 'Aviator', icon: Activity },
  { key: 'trading', label: 'Trading', icon: LineChart },
  { key: 'settings', label: 'Settings', icon: ShieldCheck },
]

const PHASE_STYLES: Record<string, string> = {
  waiting: 'bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/30',
  flying: 'bg-sky-400/10 text-sky-300 ring-1 ring-sky-400/30',
  crashed: 'bg-rose-400/10 text-rose-300 ring-1 ring-rose-400/30',
}

const PHASE_DOT: Record<string, string> = {
  waiting: 'bg-amber-400',
  flying: 'bg-sky-400',
  crashed: 'bg-rose-400',
}

function formatDate(iso?: string | null) {
  if (!iso) return 'N/A'
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

function formatCurrency(n: number) {
  return `KES ${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

function formatCrashMultiplier(value: unknown) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  return `${n.toFixed(2)}x`
}

function parseCrashRangeInput(minStr: string, maxStr: string) {
  const min = Number(minStr)
  const max = Number(maxStr)

  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    throw new Error('Crash range values must be valid numbers')
  }
  if (min < 1 || max < 1) {
    throw new Error('Crash range must be at least 1.00')
  }
  if (min > max) {
    throw new Error('Minimum crash point must be less than or equal to maximum crash point')
  }

  return {
    min: Number(min.toFixed(2)),
    max: Number(max.toFixed(2)),
  }
}

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

function StatCard({
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
  tone?: 'neutral' | 'positive' | 'negative'
}) {
  const toneClasses =
    tone === 'positive'
      ? 'text-emerald-400'
      : tone === 'negative'
      ? 'text-rose-400'
      : 'text-slate-100'

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#12161f] p-5 shadow-sm shadow-black/20">
      <div className="flex items-start justify-between">
        <p className="text-[13px] font-medium text-slate-400">{label}</p>
        <div className="rounded-lg bg-white/[0.04] p-1.5 text-slate-400">
          <Icon size={16} />
        </div>
      </div>
      <h2 className={`mt-3 text-2xl font-semibold tabular-nums tracking-tight ${toneClasses}`}>
        {value}
      </h2>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        if (!text) return
        navigator.clipboard?.writeText(text).catch(() => {})
        setCopied(true)
        setTimeout(() => setCopied(false), 1200)
      }}
      className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-xs text-slate-300 transition hover:bg-white/[0.08]"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function PublicStateBoard({ publicState }: { publicState: any }) {
  const phase = publicState?.phase ?? 'N/A'
  const phaseClass = PHASE_STYLES[phase] ?? 'bg-white/5 text-slate-300 ring-1 ring-white/10'
  const dotClass = PHASE_DOT[phase] ?? 'bg-slate-400'

  const rows: { label: string; value: React.ReactNode }[] = [
    {
      label: 'Round ID',
      value: <span className="font-mono text-sm text-slate-200">{publicState?.roundId ?? 'N/A'}</span>,
    },
    { label: 'Countdown', value: `${publicState?.countdown ?? '—'}s` },
    {
      label: 'Multiplier',
      value: (
        <span className="font-mono text-lg font-semibold tabular-nums text-sky-300">
          {(publicState?.multiplier ?? 0).toFixed(2)}x
        </span>
      ),
    },
    {
      label: 'Crash Point',
      value: publicState?.crashPoint ? `${publicState.crashPoint.toFixed(2)}x` : 'TBD',
    },
    {
      label: 'Hash',
      value: (
        <div className="flex items-center gap-2">
          <code className="font-mono text-xs text-slate-400">
            {(publicState?.hash ?? 'N/A').slice(0, 28)}...
          </code>
          <CopyButton text={publicState?.hash ?? ''} />
        </div>
      ),
    },
    { label: 'Started At', value: formatDate(publicState?.startedAt) },
    { label: 'Crashed At', value: formatDate(publicState?.crashedAt) },
  ]

  return (
    <section className="rounded-xl border border-white/[0.06] bg-[#12161f] overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${dotClass} animate-pulse`} />
          <h3 className="font-semibold text-slate-100">Live Round</h3>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${phaseClass}`}>
          {phase}
        </span>
      </div>
      <dl className="divide-y divide-white/[0.05]">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between px-5 py-3">
            <dt className="text-sm text-slate-500">{row.label}</dt>
            <dd className="text-sm text-slate-200">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function CrashQueueTable({ crashQueue }: { crashQueue: any[] }) {
  const rows = Array.isArray(crashQueue)
    ? [...crashQueue].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    : []

  return (
    <section className="rounded-xl border border-white/[0.06] bg-[#12161f] overflow-hidden">
      <div className="border-b border-white/[0.06] px-5 py-4">
        <h3 className="font-semibold text-slate-100">Crash Queue</h3>
        <p className="text-xs text-slate-500">Upcoming rounds, in order</p>
      </div>
      <div className="overflow-auto">
        <table className="w-full table-auto text-left">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3 font-medium">#</th>
              <th className="px-5 py-3 font-medium">Hash</th>
              <th className="px-5 py-3 font-medium">Crash Point</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {rows.length > 0 ? (
              rows.map((item, idx) => (
                <tr key={item.hash ?? idx} className="text-sm text-slate-300">
                  <td className="px-5 py-3 text-slate-500">{item.position ?? idx + 1}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-xs text-slate-400">
                        {(item.hash || '').slice(0, 12)}...
                      </code>
                      <CopyButton text={item.hash ?? ''} />
                    </div>
                  </td>
                  <td className="px-5 py-3 font-mono tabular-nums">
                    {(Number(item.crashPoint) ?? 0).toFixed(2)}x
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-5 py-6 text-sm text-slate-500" colSpan={3}>
                  No queue entries
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function AdminPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [activePage, setActivePage] = useState<Page>('dashboard')
  const [crashMin, setCrashMin] = useState('1.00')
  const [crashMax, setCrashMax] = useState('10.00')
  const [rangeDirty, setRangeDirty] = useState(false)
  const [rangeMessage, setRangeMessage] = useState<string | null>(null)
  const [rangeMessageTone, setRangeMessageTone] = useState<'success' | 'error'>('success')
  const [savingRange, setSavingRange] = useState(false)

  const router = useRouter()

  function applyCrashRangeFromServer(crashRange?: { min?: number; max?: number } | null) {
    if (!crashRange || typeof crashRange.min !== 'number' || typeof crashRange.max !== 'number') {
      return
    }

    setCrashMin(crashRange.min.toFixed(2))
    setCrashMax(crashRange.max.toFixed(2))
    setRangeDirty(false)
  }

  async function fetchAdmin() {
    const res = await fetch(`${API_URL}/admin`, {
      credentials: 'include',
      cache: 'no-store',
    })

    if (res.status === 401 || res.status === 403) {
      router.push('/admin/login')
      return null
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message || `Status ${res.status}`)
    }

    return res.json()
  }

  async function saveCrashRange() {
    setSavingRange(true)
    setRangeMessage(null)
    try {
      const { min, max } = parseCrashRangeInput(crashMin, crashMax)

      const res = await fetch(`${API_URL}/admin/crash-range`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ min, max }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message || `Status ${res.status}`)
      }

      const json = await res.json()
      applyCrashRangeFromServer(json.crashRange)
      setRangeMessageTone('success')
      setRangeMessage(
        `Saved: ${formatCrashMultiplier(json.crashRange.min)} - ${formatCrashMultiplier(json.crashRange.max)}`
      )
      await handleManualRefresh()
    } catch (err: any) {
      setRangeMessageTone('error')
      setRangeMessage(err.message || 'Could not save range')
    } finally {
      setSavingRange(false)
    }
  }

  function resetCrashRangeForm() {
    applyCrashRangeFromServer(data?.crashRange)
    setRangeMessage(null)
  }

  const savedCrashRange = data?.crashRange
  const parsedCrashRange = (() => {
    try {
      return parseCrashRangeInput(crashMin, crashMax)
    } catch {
      return null
    }
  })()
  const crashRangeUnchanged =
    parsedCrashRange &&
    savedCrashRange &&
    parsedCrashRange.min === savedCrashRange.min &&
    parsedCrashRange.max === savedCrashRange.max
  const canSaveCrashRange = Boolean(parsedCrashRange && !crashRangeUnchanged && !savingRange)

  useEffect(() => {
    let cancelled = false
    let initialRangeSynced = false

    async function load() {
      try {
        const json = await fetchAdmin()
        if (!cancelled && json) {
          setData(json)
          setError(null)
          setLastUpdated(new Date())
          if (!initialRangeSynced && json.crashRange) {
            applyCrashRangeFromServer(json.crashRange)
            initialRangeSynced = true
          }
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    const interval = setInterval(load, 2000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  async function handleManualRefresh() {
    setRefreshing(true)
    try {
      const json = await fetchAdmin()
      if (json) {
        setData(json)
        setLastUpdated(new Date())
        setError(null)
        if (!rangeDirty && json.crashRange) {
          applyCrashRangeFromServer(json.crashRange)
        }
      }
    } catch (err: any) {
      setError(err.message || 'Refresh error')
    } finally {
      setRefreshing(false)
    }
  }

  async function handleLogout() {
    await fetch(`${API_URL}/admin/logout`, { credentials: 'include' })
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0d12] text-slate-400">
        Loading dashboard...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0d12] text-rose-400">
        {error}
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#0a0d12] text-slate-200">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed z-40 h-screen w-64 border-r border-white/[0.06] bg-[#0d1017] transition-transform duration-300 lg:static
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/[0.06] px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sky-500/15 text-sky-400">
              <ShieldCheck size={16} />
            </div>
            <span className="font-semibold tracking-tight text-slate-100">Admin Panel</span>
          </div>
          <button className="lg:hidden text-slate-400" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <nav className="space-y-1 p-3">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => {
                setActivePage(key)
                setSidebarOpen(false)
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm font-medium transition
              ${
                activePage === key
                  ? 'bg-sky-500/10 text-sky-300 ring-1 ring-inset ring-sky-500/30'
                  : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full border-t border-white/[0.06] p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-rose-500/10 py-2.5 text-sm font-medium text-rose-300 transition hover:bg-rose-500/20"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/[0.06] bg-[#0a0d12]/90 px-6 backdrop-blur">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="text-slate-400 lg:hidden">
              <Menu />
            </button>

            <h1 className="text-lg font-semibold capitalize tracking-tight text-slate-100">
              {activePage}
            </h1>

            <span className="hidden text-xs text-slate-500 sm:inline">
              {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Not updated yet'}
            </span>

            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="ml-2 inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/[0.08] disabled:opacity-50"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Administrator
          </div>
        </header>

        <div className="space-y-6 p-6">
          {activePage === 'dashboard' && (
            <>
              <div>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Aviator
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard label="Rounds Played" value={AVIATOR_SUMMARY.rounds.toLocaleString()} icon={Activity} />
                  <StatCard
                    label="Wins / Losses"
                    value={`${AVIATOR_SUMMARY.wins} / ${AVIATOR_SUMMARY.losses}`}
                    sub={`${AVIATOR_SUMMARY.winRate}% win rate`}
                    icon={Percent}
                  />
                  <StatCard
                    label="Net Profit"
                    value={formatCurrency(AVIATOR_SUMMARY.profit)}
                    tone="positive"
                    icon={TrendingUp}
                  />
                  <StatCard
                    label="Live Multiplier"
                    value={`${(data?.publicState?.multiplier ?? 0).toFixed(2)}x`}
                    sub={data?.publicState?.phase ?? 'N/A'}
                    icon={Wallet}
                  />
                </div>
              </div>

              <div>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Trading
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard label="Total Trades" value={TRADING_SUMMARY.trades.toLocaleString()} icon={LineChart} />
                  <StatCard
                    label="Wins / Losses"
                    value={`${TRADING_SUMMARY.wins} / ${TRADING_SUMMARY.losses}`}
                    sub={`${TRADING_SUMMARY.winRate}% win rate`}
                    icon={Percent}
                  />
                  <StatCard
                    label="Net P&L"
                    value={formatCurrency(TRADING_SUMMARY.pnl)}
                    tone="positive"
                    icon={TrendingUp}
                  />
                  <StatCard label="Open Positions" value="—" sub="Coming soon" icon={TrendingDown} />
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <PublicStateBoard publicState={data?.publicState} />
                <div className="rounded-xl border border-white/[0.06] bg-[#12161f] p-6">
                  <h3 className="mb-4 font-semibold text-slate-100">Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">Crash Queue Size</p>
                      <p className="mt-1 font-medium text-slate-200">{data?.crashQueue?.length ?? 0}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Current Phase</p>
                      <p className="mt-1 font-medium text-slate-200 capitalize">
                        {data?.publicState?.phase ?? 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Round ID</p>
                      <p className="mt-1 font-mono text-xs text-slate-200">
                        {data?.publicState?.roundId ?? 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Crash Point</p>
                      <p className="mt-1 font-medium text-slate-200">
                        {data?.publicState?.crashPoint ? `${data.publicState.crashPoint.toFixed(2)}x` : 'TBD'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activePage === 'aviator' && (
            <>
                      <div className="grid gap-4 sm:grid-cols-3">
                <StatCard label="Crash Queue" value={String(data?.crashQueue?.length ?? 0)} icon={Activity} />
                <StatCard
                  label="Phase"
                  value={data?.publicState?.phase ?? 'N/A'}
                  icon={ShieldCheck}
                />
                <StatCard label="System" value="Online" tone="positive" icon={TrendingUp} />
              </div>

              <PublicStateBoard publicState={data?.publicState} />

              <section className="rounded-xl border border-white/[0.06] bg-[#12161f] p-6">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-100">Crash Range</h3>
                    <p className="text-sm text-slate-500">Control the next generated crash values.</p>
                  </div>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
                    Saved: {formatCrashMultiplier(savedCrashRange?.min)} - {formatCrashMultiplier(savedCrashRange?.max)}
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm text-slate-400">
                    Minimum crash point
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      value={crashMin}
                      onChange={(event) => {
                        setCrashMin(event.target.value)
                        setRangeDirty(true)
                        setRangeMessage(null)
                      }}
                      className="w-full rounded-lg border border-white/[0.08] bg-slate-950/70 px-3 py-2 text-slate-100 outline-none ring-1 ring-transparent transition focus:ring-sky-500"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-slate-400">
                    Maximum crash point
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      value={crashMax}
                      onChange={(event) => {
                        setCrashMax(event.target.value)
                        setRangeDirty(true)
                        setRangeMessage(null)
                      }}
                      className="w-full rounded-lg border border-white/[0.08] bg-slate-950/70 px-3 py-2 text-slate-100 outline-none ring-1 ring-transparent transition focus:ring-sky-500"
                    />
                  </label>
                </div>

                <p className="mt-3 text-xs text-slate-500">
                  Each queued round gets a random crash point between your saved minimum and maximum. Saving regenerates the crash queue.
                </p>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={saveCrashRange}
                      disabled={!canSaveCrashRange}
                      className="inline-flex items-center justify-center rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {savingRange ? 'Saving...' : 'Save Range'}
                    </button>
                    {rangeDirty && (
                      <button
                        type="button"
                        onClick={resetCrashRangeForm}
                        disabled={savingRange}
                        className="inline-flex items-center justify-center rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/[0.05] disabled:opacity-50"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  {rangeMessage && (
                    <p
                      className={`text-sm ${
                        rangeMessageTone === 'error' ? 'text-rose-300' : 'text-emerald-300'
                      }`}
                    >
                      {rangeMessage}
                    </p>
                  )}
                </div>
              </section>

              <CrashQueueTable crashQueue={data?.crashQueue ?? []} />
            </>
          )}

          {(activePage === 'trading' || activePage === 'settings') && (
            <div className="rounded-xl border border-white/[0.06] bg-[#12161f] p-10 text-center">
              <h2 className="mb-2 text-lg font-semibold text-slate-100">
                {activePage === 'trading' ? 'Trading' : 'Settings'}
              </h2>
              <p className="text-sm text-slate-500">
                Coming soon. This section will include advanced controls and analytics.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}