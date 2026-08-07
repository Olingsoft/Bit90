'use client'

import React from 'react'
import {
  Activity,
  Users,
  Wallet,
  TrendingUp,
  FileCheck,
  Headphones,
  Server,
  UserPlus,
} from 'lucide-react'
import {
  DASHBOARD_STATS,
  DAILY_REVENUE,
  DAILY_BETS,
  DEPOSITS_VS_WITHDRAWALS,
  NEW_USERS,
  MONTHLY_PROFIT,
  formatCurrency,
} from '../lib/mock-data'
import { StatCard, MiniBarChart, CopyButton } from './ui'

const PHASE_STYLES: Record<string, string> = {
  waiting: 'bg-amber-400/10 text-amber-600 ring-amber-400/30 dark:text-amber-300',
  flying: 'bg-sky-400/10 text-sky-600 ring-sky-400/30 dark:text-sky-300',
  crashed: 'bg-rose-400/10 text-rose-600 ring-rose-400/30 dark:text-rose-300',
}

function LiveRoundSummary({ publicState }: { publicState?: Record<string, unknown> }) {
  const phase = String(publicState?.phase ?? 'N/A')
  const phaseClass = PHASE_STYLES[phase] ?? 'bg-slate-500/10 text-slate-600 ring-slate-500/30'

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-white/[0.06] dark:bg-[#12161f]">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/[0.06]">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">Live Aviator Round</h3>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ring-1 ring-inset ${phaseClass}`}>{phase}</span>
      </div>
      <dl className="divide-y divide-slate-100 dark:divide-white/[0.05]">
        {[
          ['Multiplier', `${Number(publicState?.multiplier ?? 0).toFixed(2)}x`],
          ['Next Crash Point', publicState?.crashPoint ? `${Number(publicState.crashPoint).toFixed(2)}x` : 'TBD'],
          ['Round ID', String(publicState?.roundId ?? 'N/A')],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between px-5 py-3">
            <dt className="text-sm text-slate-500">{label}</dt>
            <dd className="text-sm font-medium text-slate-800 dark:text-slate-200">{value}</dd>
          </div>
        ))}
        <div className="flex items-center justify-between px-5 py-3">
          <dt className="text-sm text-slate-500">Hash</dt>
          <dd className="flex items-center gap-2">
            <code className="font-mono text-xs text-slate-500">{String(publicState?.hash ?? 'N/A').slice(0, 20)}...</code>
            <CopyButton text={String(publicState?.hash ?? '')} />
          </dd>
        </div>
      </dl>
    </section>
  )
}

export function DashboardSection({
  liveData,
}: {
  liveData?: {
    publicState?: Record<string, unknown>
    crashQueue?: unknown[]
  }
}) {
  const stats = DASHBOARD_STATS

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <StatCard label="Total Users" value={stats.totalUsers.toLocaleString()} icon={Users} />
        <StatCard label="Active Users" value={stats.activeUsers.toLocaleString()} icon={UserPlus} tone="positive" />
        <StatCard label="Online Now" value={stats.onlineUsers.toLocaleString()} icon={Activity} />
        <StatCard label="Today's Deposits" value={formatCurrency(stats.todayDeposits)} icon={Wallet} tone="positive" />
        <StatCard label="Today's Withdrawals" value={formatCurrency(stats.todayWithdrawals)} icon={TrendingUp} />
        <StatCard label="Pending Withdrawals" value={String(stats.pendingWithdrawals)} icon={Wallet} tone="warning" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <StatCard label="Pending KYC" value={String(stats.pendingKyc)} icon={FileCheck} tone="warning" />
        <StatCard label="Total Bets" value={stats.totalBets.toLocaleString()} icon={Activity} />
        <StatCard label="Total Revenue" value={formatCurrency(stats.totalRevenue)} icon={TrendingUp} tone="positive" />
        <StatCard label="Bonuses Issued" value={formatCurrency(stats.totalBonuses)} icon={Wallet} />
        <StatCard label="Support Tickets" value={String(stats.supportTickets)} icon={Headphones} tone="warning" />
        <StatCard
          label="Server Status"
          value={stats.serverStatus === 'online' ? 'Online' : stats.serverStatus}
          icon={Server}
          tone={stats.serverStatus === 'online' ? 'positive' : 'negative'}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <MiniBarChart data={DAILY_REVENUE} title="Daily Revenue" color="emerald" />
        <MiniBarChart data={DAILY_BETS} title="Daily Bets" color="sky" />
        <MiniBarChart data={DEPOSITS_VS_WITHDRAWALS} title="Deposits vs Withdrawals" color="sky" secondaryColor="rose" />
        <MiniBarChart data={NEW_USERS} title="New Users" color="violet" />
        <MiniBarChart data={MONTHLY_PROFIT} title="Monthly Profit" color="emerald" />
        <LiveRoundSummary publicState={liveData?.publicState} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-white/[0.06] dark:bg-[#12161f]">
        <h3 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Referral Statistics</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-slate-500">This Month Signups</p>
            <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">{stats.referralSignups}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Commission Paid</p>
            <p className="mt-1 text-lg font-semibold text-emerald-500">{formatCurrency(89000)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Active Referrers</p>
            <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">156</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Crash Queue Size</p>
            <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">{liveData?.crashQueue?.length ?? 0}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
