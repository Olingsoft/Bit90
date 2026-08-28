'use client'

import React, { useState } from 'react'
import { Activity, ShieldCheck, Sliders, TrendingUp, Zap } from 'lucide-react'
import { saveCrashMode, saveCrashRange } from '../lib/api'
import { formatCrashMultiplier } from '../lib/mock-data'
import { CopyButton, StatCard } from './ui'

const PHASE_STYLES: Record<string, string> = {
  waiting: 'bg-orange-400/10 text-orange-700 ring-orange-400/30 dark:text-orange-300',
  flying: 'bg-sky-400/10 text-sky-700 ring-sky-400/30 dark:text-sky-300',
  crashed: 'bg-rose-400/10 text-rose-700 ring-rose-400/30 dark:text-rose-300',
}

const PHASE_DOT: Record<string, string> = {
  waiting: 'bg-orange-400',
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

  return { min: Number(min.toFixed(2)), max: Number(max.toFixed(2)) }
}

function PublicStateBoard({ publicState }: { publicState: Record<string, unknown> | undefined }) {
  const phase = String(publicState?.phase ?? 'N/A')
  const phaseClass = PHASE_STYLES[phase] ?? 'bg-slate-500/10 text-slate-700 ring-slate-500/30'
  const dotClass = PHASE_DOT[phase] ?? 'bg-slate-400'

  const rows: { label: string; value: React.ReactNode }[] = [
    {
      label: 'Round ID',
      value: <span className="font-mono text-sm">{String(publicState?.roundId ?? 'N/A')}</span>,
    },
    { label: 'Countdown', value: `${publicState?.countdown ?? '—'}s` },
    {
      label: 'Multiplier',
      value: (
        <span className="font-mono text-lg font-semibold tabular-nums text-sky-500 dark:text-sky-300">
          {Number(publicState?.multiplier ?? 0).toFixed(2)}x
        </span>
      ),
    },
    {
      label: 'Next Crash Point',
      value: publicState?.crashPoint ? `${Number(publicState.crashPoint).toFixed(2)}x` : 'TBD',
    },
    {
      label: 'Hash',
      value: (
        <div className="flex items-center gap-2">
          <code className="font-mono text-xs text-slate-500">
            {String(publicState?.hash ?? 'N/A').slice(0, 28)}...
          </code>
          <CopyButton text={String(publicState?.hash ?? '')} />
        </div>
      ),
    },
    { label: 'Started At', value: formatDate(publicState?.startedAt as string) },
    { label: 'Crashed At', value: formatDate(publicState?.crashedAt as string) },
  ]

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-white/[0.06] dark:bg-[#12161f]">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 animate-pulse rounded-full ${dotClass}`} />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Live Round</h3>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ring-inset ${phaseClass}`}>
          {phase}
        </span>
      </div>
      <dl className="divide-y divide-slate-100 dark:divide-white/[0.05]">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between px-5 py-3">
            <dt className="text-sm text-slate-500">{row.label}</dt>
            <dd className="text-sm text-slate-800 dark:text-slate-200">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function CrashQueueTable({ crashQueue }: { crashQueue: Array<{ position?: number; hash?: string; crashPoint?: number }> }) {
  const rows = [...crashQueue].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-white/[0.06] dark:bg-[#12161f]">
      <div className="border-b border-slate-200 px-5 py-4 dark:border-white/[0.06]">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">Crash Queue — Next Crash Points</h3>
        <p className="text-xs text-slate-500">Upcoming rounds in order (Super Admin only)</p>
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
          <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05]">
            {rows.length > 0 ? (
              rows.map((item, idx) => (
                <tr key={item.hash ?? idx} className="text-sm text-slate-700 dark:text-slate-300">
                  <td className="px-5 py-3 text-slate-500">{item.position ?? idx + 1}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-xs text-slate-500">{(item.hash || '').slice(0, 12)}...</code>
                      <CopyButton text={item.hash ?? ''} />
                    </div>
                  </td>
                  <td className="px-5 py-3 font-mono tabular-nums">{(Number(item.crashPoint) || 0).toFixed(2)}x</td>
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

export function AviatorControls({
  data,
  onRefresh,
}: {
  data: {
    publicState?: Record<string, unknown>
    crashQueue?: Array<{ position?: number; hash?: string; crashPoint?: number }>
    crashRange?: { min?: number; max?: number }
    game_config?: { crash_mode?: 'auto' | 'manual'; rtp_param?: number; band_weights?: Record<string, number> }
  }
  onRefresh: () => Promise<unknown>
}) {
  const [crashMin, setCrashMin] = useState('1.00')
  const [crashMax, setCrashMax] = useState('10.00')
  const [rangeDirty, setRangeDirty] = useState(false)
  const [rangeMessage, setRangeMessage] = useState<string | null>(null)
  const [rangeMessageTone, setRangeMessageTone] = useState<'success' | 'error'>('success')
  const [savingRange, setSavingRange] = useState(false)
  const [crashMode, setCrashMode] = useState<'auto' | 'manual'>(data.game_config?.crash_mode ?? 'manual')
  const [savingMode, setSavingMode] = useState(false)
  const [modeMessage, setModeMessage] = useState<string | null>(null)
  const [modeMessageTone, setModeMessageTone] = useState<'success' | 'error'>('success')
  const [initialized, setInitialized] = useState(false)

  function applyCrashRangeFromServer(crashRange?: { min?: number; max?: number } | null) {
    if (!crashRange || typeof crashRange.min !== 'number' || typeof crashRange.max !== 'number') return
    setCrashMin(crashRange.min.toFixed(2))
    setCrashMax(crashRange.max.toFixed(2))
    setRangeDirty(false)
  }

  React.useEffect(() => {
    if (!initialized && data.crashRange) {
      applyCrashRangeFromServer(data.crashRange)
      setInitialized(true)
    }
    if (!initialized && data.game_config?.crash_mode) {
      setCrashMode(data.game_config.crash_mode)
    }
  }, [data, initialized])

  React.useEffect(() => {
    if (!rangeDirty && data.crashRange) {
      applyCrashRangeFromServer(data.crashRange)
    }
  }, [data.crashRange, rangeDirty])

  async function handleSaveCrashRange() {
    setSavingRange(true)
    setRangeMessage(null)
    try {
      const { min, max } = parseCrashRangeInput(crashMin, crashMax)
      const json = await saveCrashRange(min, max)
      applyCrashRangeFromServer(json.crashRange)
      setRangeMessageTone('success')
      setRangeMessage(`Saved: ${formatCrashMultiplier(json.crashRange.min)} - ${formatCrashMultiplier(json.crashRange.max)}`)
      await onRefresh()
    } catch (err: unknown) {
      setRangeMessageTone('error')
      setRangeMessage(err instanceof Error ? err.message : 'Could not save range')
    } finally {
      setSavingRange(false)
    }
  }

  async function handleSaveCrashMode(mode: 'auto' | 'manual') {
    setSavingMode(true)
    setModeMessage(null)
    try {
      await saveCrashMode(mode)
      setCrashMode(mode)
      setModeMessageTone('success')
      setModeMessage(`Mode set to "${mode}". Takes effect on the next round.`)
    } catch (err: unknown) {
      setModeMessageTone('error')
      setModeMessage(err instanceof Error ? err.message : 'Could not save mode')
    } finally {
      setSavingMode(false)
    }
  }

  const savedCrashRange = data.crashRange
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

  return (
    <>
      <div className="mb-2 rounded-lg border border-orange-500/20 bg-orange-500/5 px-4 py-3 text-sm text-orange-700 dark:text-orange-300">
        <strong>Super Admin only.</strong> Crash mode, range, and next crash point queue are restricted to the highest privilege level.
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Crash Queue" value={String(data.crashQueue?.length ?? 0)} icon={Activity} />
        <StatCard label="Phase" value={String(data.publicState?.phase ?? 'N/A')} icon={ShieldCheck} />
        <StatCard label="System" value="Online" tone="positive" icon={TrendingUp} />
      </div>

      <PublicStateBoard publicState={data.publicState} />

      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-white/[0.06] dark:bg-[#12161f]">
        <div className="mb-5 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Sliders size={18} className="text-sky-500 dark:text-sky-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Crash Mode</h3>
          </div>
          <p className="text-sm text-slate-500">Choose how crash points are generated each round.</p>
        </div>

        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-white/[0.08] dark:bg-slate-950/60">
          {(['auto', 'manual'] as const).map((mode) => (
            <button
              key={mode}
              id={`crash-mode-${mode}`}
              onClick={() => handleSaveCrashMode(mode)}
              disabled={savingMode}
              className={`relative flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium capitalize transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
                crashMode === mode
                  ? mode === 'auto'
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
                    : 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {mode === 'auto' ? <Zap size={14} /> : <Sliders size={14} />}
              {mode}
              {crashMode === mode && <span className="ml-1 h-1.5 w-1.5 rounded-full bg-white/60" />}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-white/[0.06] dark:bg-slate-950/40">
          {crashMode === 'auto' ? (
            <div className="space-y-1">
              <p className="font-medium text-sky-600 dark:text-sky-300">Auto Mode — Algorithm-driven</p>
              <p className="text-slate-500">
                Each round&apos;s crash point is generated by the band-weight algorithm. RTP:{' '}
                <span className="font-mono text-slate-800 dark:text-slate-200">{data.game_config?.rtp_param ?? 0.97}</span>
              </p>
              {data.game_config?.band_weights && (
                <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-5">
                  {Object.entries(data.game_config.band_weights).map(([band, w]) => (
                    <div key={band} className="flex items-center justify-between gap-2">
                      <span className="text-xs capitalize text-slate-500">{band.replace('_', ' ')}</span>
                      <span className="font-mono text-xs text-slate-700 dark:text-slate-300">{String(w)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <p className="font-medium text-orange-600 dark:text-orange-300">Manual Mode — Crash Range</p>
              <p className="text-slate-500">Each round picks a random crash point between the min and max you set below.</p>
            </div>
          )}
        </div>

        {modeMessage && (
          <p className={`mt-3 text-sm ${modeMessageTone === 'error' ? 'text-rose-500' : 'text-emerald-500'}`}>{modeMessage}</p>
        )}
      </section>

      <section
        className={`rounded-xl border bg-white p-6 transition-opacity dark:bg-[#12161f] ${
          crashMode === 'manual'
            ? 'border-orange-500/20 opacity-100 dark:border-orange-500/20'
            : 'pointer-events-none border-slate-200 opacity-40 dark:border-white/[0.04]'
        }`}
      >
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Crash Range</h3>
            <p className="text-sm text-slate-500">Control the next generated crash values.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            Saved: {formatCrashMultiplier(savedCrashRange?.min)} - {formatCrashMultiplier(savedCrashRange?.max)}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-500">
            Minimum crash point
            <input
              type="number"
              step="0.01"
              min="1"
              value={crashMin}
              onChange={(e) => {
                setCrashMin(e.target.value)
                setRangeDirty(true)
                setRangeMessage(null)
              }}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none ring-1 ring-transparent transition focus:ring-sky-500 dark:border-white/[0.08] dark:bg-slate-950/70 dark:text-slate-100"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-500">
            Maximum crash point
            <input
              type="number"
              step="0.01"
              min="1"
              value={crashMax}
              onChange={(e) => {
                setCrashMax(e.target.value)
                setRangeDirty(true)
                setRangeMessage(null)
              }}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none ring-1 ring-transparent transition focus:ring-sky-500 dark:border-white/[0.08] dark:bg-slate-950/70 dark:text-slate-100"
            />
          </label>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Each queued round gets a random crash point between your saved minimum and maximum. Saving regenerates the crash queue.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSaveCrashRange}
              disabled={!canSaveCrashRange}
              className="inline-flex items-center justify-center rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingRange ? 'Saving...' : 'Save Range'}
            </button>
            {rangeDirty && (
              <button
                type="button"
                onClick={() => {
                  applyCrashRangeFromServer(data.crashRange)
                  setRangeMessage(null)
                }}
                disabled={savingRange}
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/[0.05]"
              >
                Reset
              </button>
            )}
          </div>
          {rangeMessage && (
            <p className={`text-sm ${rangeMessageTone === 'error' ? 'text-rose-500' : 'text-emerald-500'}`}>{rangeMessage}</p>
          )}
        </div>
      </section>

      <CrashQueueTable crashQueue={data.crashQueue ?? []} />
    </>
  )
}
