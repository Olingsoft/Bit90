'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  MOCK_KYC,
  MOCK_DEPOSITS,
  MOCK_WITHDRAWALS,
  MOCK_BONUSES,
  MOCK_TICKETS,
  MOCK_AUDIT,
  MOCK_ADMINS,
  MOCK_NOTIFICATIONS,
  SERVER_METRICS,
  formatCurrency,
  formatDate,
} from '../lib/mock-data'
import { fetchUsers } from '../lib/api'
import {
  SectionHeader,
  SearchInput,
  DataTable,
  StatusBadge,
  ActionButton,
  Pagination,
  EmptyState,
  StatCard,
} from './ui'
import { Server, Cpu, HardDrive, Database, Wifi } from 'lucide-react'

function useFilteredRows<T extends Record<string, unknown>>(rows: T[], search: string, keys: string[]) {
  return useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((row) => keys.some((k) => String(row[k] ?? '').toLowerCase().includes(q)))
  }, [rows, search, keys])
}

function ExportButtons() {
  return (
    <div className="flex gap-2">
      {['CSV', 'Excel', 'PDF'].map((fmt) => (
        <ActionButton key={fmt} variant="secondary">
          Export {fmt}
        </ActionButton>
      ))}
    </div>
  )
}

export function UsersSection() {
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    fetchUsers()
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useFilteredRows(users, search, ['phone', 'username', 'email', 'id'])
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))

  return (
    <div className="space-y-4">
      <SectionHeader
        title="User Management"
        description="Search, filter, and manage platform users."
        action={<SearchInput value={search} onChange={setSearch} placeholder="Search users..." />}
      />
      {loading ? (
        <EmptyState title="Loading users..." description="Fetching user records from the API." />
      ) : (
        <>
          <DataTable
            columns={[
              { key: 'phone', label: 'Phone' },
              { key: 'username', label: 'Username', render: (r) => String(r.username ?? '—') },
              { key: 'email', label: 'Email', render: (r) => String(r.email ?? '—') },
              {
                key: 'balance',
                label: 'Balance',
                render: (r) => formatCurrency(Number(r.balance ?? 0)),
              },
              {
                key: 'status',
                label: 'Status',
                render: () => <StatusBadge status="active" />,
              },
              {
                key: 'actions',
                label: 'Actions',
                render: () => (
                  <div className="flex flex-wrap gap-1">
                    <ActionButton variant="secondary">View</ActionButton>
                    <ActionButton variant="secondary">Edit</ActionButton>
                    <ActionButton variant="danger">Freeze</ActionButton>
                  </div>
                ),
              },
            ]}
            rows={paged}
            emptyMessage="No users found"
          />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}

export function KycSection() {
  const [search, setSearch] = useState('')
  const filtered = useFilteredRows(MOCK_KYC as unknown as Record<string, unknown>[], search, ['user', 'id', 'docType'])

  return (
    <div className="space-y-4">
      <SectionHeader title="KYC Management" description="Review and approve identity documents." action={<SearchInput value={search} onChange={setSearch} />} />
      <DataTable
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'user', label: 'User' },
          { key: 'docType', label: 'Document' },
          { key: 'submitted', label: 'Submitted', render: (r) => formatDate(String(r.submitted)) },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={String(r.status)} /> },
          {
            key: 'actions',
            label: 'Actions',
            render: () => (
              <div className="flex gap-1">
                <ActionButton>View</ActionButton>
                <ActionButton variant="secondary">Approve</ActionButton>
                <ActionButton variant="danger">Reject</ActionButton>
              </div>
            ),
          },
        ]}
        rows={filtered}
      />
    </div>
  )
}

export function DepositsSection() {
  const [search, setSearch] = useState('')
  const filtered = useFilteredRows(MOCK_DEPOSITS as unknown as Record<string, unknown>[], search, ['user', 'id', 'txId'])

  return (
    <div className="space-y-4">
      <SectionHeader title="Deposits" description="Monitor and approve deposit transactions." action={<ExportButtons />} />
      <SearchInput value={search} onChange={setSearch} placeholder="Filter deposits..." />
      <DataTable
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'user', label: 'User' },
          { key: 'amount', label: 'Amount', render: (r) => formatCurrency(Number(r.amount)) },
          { key: 'method', label: 'Method' },
          { key: 'txId', label: 'Transaction ID' },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={String(r.status)} /> },
          { key: 'date', label: 'Date', render: (r) => formatDate(String(r.date)) },
          {
            key: 'actions',
            label: 'Actions',
            render: (r) => (
              <div className="flex gap-1">
                <ActionButton variant="secondary">View</ActionButton>
                {r.status === 'pending' && <ActionButton>Approve</ActionButton>}
              </div>
            ),
          },
        ]}
        rows={filtered}
      />
    </div>
  )
}

export function WithdrawalsSection() {
  const [search, setSearch] = useState('')
  const filtered = useFilteredRows(MOCK_WITHDRAWALS as unknown as Record<string, unknown>[], search, ['user', 'id'])

  return (
    <div className="space-y-4">
      <SectionHeader title="Withdrawals" description="Approve, reject, or hold withdrawal requests." action={<ExportButtons />} />
      <SearchInput value={search} onChange={setSearch} placeholder="Filter withdrawals..." />
      <DataTable
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'user', label: 'User' },
          { key: 'amount', label: 'Amount', render: (r) => formatCurrency(Number(r.amount)) },
          { key: 'details', label: 'Bank / M-Pesa' },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={String(r.status)} /> },
          { key: 'requested', label: 'Requested', render: (r) => formatDate(String(r.requested)) },
          {
            key: 'actions',
            label: 'Actions',
            render: (r) => (
              <div className="flex gap-1">
                <ActionButton>Approve</ActionButton>
                <ActionButton variant="danger">Reject</ActionButton>
                {r.status !== 'hold' && <ActionButton variant="secondary">Hold</ActionButton>}
              </div>
            ),
          },
        ]}
        rows={filtered}
      />
    </div>
  )
}

export function BonusesSection() {
  return (
    <div className="space-y-4">
      <SectionHeader
        title="Bonuses & Promotions"
        description="Create welcome, deposit, cashback, referral, VIP bonuses and promo codes."
        action={<ActionButton>Create Bonus</ActionButton>}
      />
      <DataTable
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'type', label: 'Type' },
          { key: 'amount', label: 'Amount / %' },
          { key: 'wager', label: 'Wager Req.' },
          { key: 'expiry', label: 'Expiry' },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={String(r.status)} /> },
          {
            key: 'actions',
            label: 'Actions',
            render: () => (
              <div className="flex gap-1">
                <ActionButton variant="secondary">Edit</ActionButton>
                <ActionButton variant="danger">Disable</ActionButton>
              </div>
            ),
          },
        ]}
        rows={MOCK_BONUSES as unknown as Record<string, unknown>[]}
      />
    </div>
  )
}

export function ReferralsSection() {
  return (
    <div className="space-y-4">
      <SectionHeader title="Referral System" description="Manage referral commissions, invite codes, and levels." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Commission Rate" value="5%" icon={Server} />
        <StatCard label="Total Referrals" value="1,842" icon={Server} />
        <StatCard label="Referral Earnings" value={formatCurrency(890000)} icon={Server} tone="positive" />
        <StatCard label="Active Levels" value="3" icon={Server} />
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-white/[0.06] dark:bg-[#12161f]">
        <h3 className="mb-3 font-semibold">Referral Levels</h3>
        <div className="space-y-2 text-sm">
          {[
            { level: 'Level 1', rate: '5%', desc: 'Direct referrals' },
            { level: 'Level 2', rate: '2%', desc: 'Second-tier referrals' },
            { level: 'Level 3', rate: '1%', desc: 'Third-tier referrals' },
          ].map((l) => (
            <div key={l.level} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 dark:bg-white/[0.03]">
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">{l.level}</p>
                <p className="text-xs text-slate-500">{l.desc}</p>
              </div>
              <span className="font-semibold text-sky-500">{l.rate}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ReportsSection() {
  const reportTypes = [
    'Daily Revenue',
    'Weekly Revenue',
    'Monthly Revenue',
    'Deposits',
    'Withdrawals',
    'Bets',
    'Wins & Losses',
    'Active Users',
    'New Registrations',
    'Bonus Costs',
  ]

  return (
    <div className="space-y-4">
      <SectionHeader title="Reports" description="Generate and export platform analytics." action={<ExportButtons />} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {reportTypes.map((report) => (
          <div
            key={report}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 dark:border-white/[0.06] dark:bg-[#12161f]"
          >
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{report}</span>
            <ActionButton variant="secondary">Generate</ActionButton>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SupportSection() {
  const [search, setSearch] = useState('')
  const filtered = useFilteredRows(MOCK_TICKETS as unknown as Record<string, unknown>[], search, ['subject', 'user', 'id'])

  return (
    <div className="space-y-4">
      <SectionHeader title="Customer Support" description="Manage tickets and live chat with users." />
      <SearchInput value={search} onChange={setSearch} placeholder="Search tickets..." />
      <DataTable
        columns={[
          { key: 'id', label: 'Ticket' },
          { key: 'user', label: 'User' },
          { key: 'subject', label: 'Subject' },
          { key: 'priority', label: 'Priority', render: (r) => <StatusBadge status={String(r.priority)} /> },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={String(r.status)} /> },
          { key: 'assigned', label: 'Assigned To' },
          {
            key: 'actions',
            label: 'Actions',
            render: () => (
              <div className="flex gap-1">
                <ActionButton>Open Chat</ActionButton>
                <ActionButton variant="secondary">Assign</ActionButton>
              </div>
            ),
          },
        ]}
        rows={filtered}
      />
    </div>
  )
}

export function PaymentsSection() {
  const gateways = ['M-Pesa', 'Airtel Money', 'Bank Transfer', 'Crypto (Optional)']

  return (
    <div className="space-y-4">
      <SectionHeader title="Payment Settings" description="Configure payment gateways and transaction limits." />
      <div className="grid gap-4 lg:grid-cols-2">
        {gateways.map((gw) => (
          <div key={gw} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-white/[0.06] dark:bg-[#12161f]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">{gw}</h3>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" defaultChecked={gw !== 'Crypto (Optional)'} className="peer sr-only" />
                <div className="h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition peer-checked:bg-sky-500 peer-checked:after:translate-x-full dark:bg-slate-700" />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <label className="space-y-1 text-slate-500">
                Min Deposit
                <input defaultValue="100" className="w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-white/[0.08] dark:bg-slate-950/70" />
              </label>
              <label className="space-y-1 text-slate-500">
                Max Deposit
                <input defaultValue="500000" className="w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-white/[0.08] dark:bg-slate-950/70" />
              </label>
              <label className="space-y-1 text-slate-500">
                Min Withdrawal
                <input defaultValue="200" className="w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-white/[0.08] dark:bg-slate-950/70" />
              </label>
              <label className="space-y-1 text-slate-500">
                Transaction Fee %
                <input defaultValue="0" className="w-full rounded-lg border border-slate-200 px-3 py-2 dark:border-white/[0.08] dark:bg-slate-950/70" />
              </label>
            </div>
          </div>
        ))}
      </div>
      <ActionButton>Save Payment Settings</ActionButton>
    </div>
  )
}

export function ServerSection() {
  const m = SERVER_METRICS

  return (
    <div className="space-y-4">
      <SectionHeader title="Server Monitoring" description="Real-time infrastructure health and logs." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="CPU Usage" value={`${m.cpu}%`} icon={Cpu} tone={m.cpu > 80 ? 'negative' : 'neutral'} />
        <StatCard label="RAM Usage" value={`${m.ram}%`} icon={Server} tone={m.ram > 80 ? 'warning' : 'neutral'} />
        <StatCard label="Disk Usage" value={`${m.disk}%`} icon={HardDrive} />
        <StatCard label="Active Sessions" value={String(m.sessions)} icon={Wifi} />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {[
          { label: 'Database', status: m.db },
          { label: 'API Server', status: m.api },
          { label: 'M-Pesa Gateway', status: m.mpesa },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/[0.06] dark:bg-[#12161f]">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">{s.label}</span>
              <StatusBadge status={s.status === 'healthy' ? 'active' : 'pending'} />
            </div>
            <p className="mt-2 text-lg font-semibold capitalize text-slate-900 dark:text-slate-100">{s.status}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-white/[0.06] dark:bg-[#12161f]">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">Error Logs</h3>
          <span className="text-xs text-slate-500">Uptime: {m.uptime}</span>
        </div>
        <div className="space-y-2 font-mono text-xs text-slate-500">
          <p>[2026-08-06 10:22:01] INFO — Aviator round #1284 started</p>
          <p>[2026-08-06 10:21:45] WARN — Slow query on transactions collection (142ms)</p>
          <p>[2026-08-06 10:20:12] INFO — M-Pesa callback processed successfully</p>
        </div>
      </div>
    </div>
  )
}

export function NotificationsSection() {
  return (
    <div className="space-y-4">
      <SectionHeader title="Notifications" description="Admin alerts for critical platform events." />
      <div className="space-y-2">
        {MOCK_NOTIFICATIONS.map((n) => (
          <div
            key={n.id}
            className={`flex items-start justify-between rounded-xl border p-4 ${
              n.read
                ? 'border-slate-200 bg-white dark:border-white/[0.06] dark:bg-[#12161f]'
                : 'border-sky-500/30 bg-sky-500/5 dark:bg-sky-500/10'
            }`}
          >
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{n.type}</p>
              <p className="text-sm text-slate-500">{n.message}</p>
            </div>
            <span className="text-xs text-slate-400">{n.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AuditSection() {
  return (
    <div className="space-y-4">
      <SectionHeader
        title="Audit Log"
        description="Immutable record of all admin actions. Logs cannot be modified or deleted."
      />
      <DataTable
        columns={[
          { key: 'admin', label: 'Admin' },
          { key: 'role', label: 'Role' },
          { key: 'action', label: 'Action' },
          { key: 'target', label: 'Target' },
          { key: 'ip', label: 'IP Address' },
          { key: 'browser', label: 'Browser' },
          { key: 'date', label: 'Date' },
          { key: 'time', label: 'Time' },
        ]}
        rows={MOCK_AUDIT as unknown as Record<string, unknown>[]}
      />
    </div>
  )
}

export function AdminsSection() {
  return (
    <div className="space-y-4">
      <SectionHeader
        title="Administrators"
        description="Manage admin accounts, roles, and access status."
        action={<ActionButton>Create Admin</ActionButton>}
      />
      <DataTable
        columns={[
          { key: 'name', label: 'Full Name' },
          { key: 'username', label: 'Username' },
          { key: 'email', label: 'Email' },
          { key: 'phone', label: 'Phone' },
          { key: 'role', label: 'Role' },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={String(r.status)} /> },
          { key: 'lastLogin', label: 'Last Login', render: (r) => formatDate(String(r.lastLogin)) },
          {
            key: 'actions',
            label: 'Actions',
            render: () => (
              <div className="flex gap-1">
                <ActionButton variant="secondary">Edit</ActionButton>
                <ActionButton variant="danger">Suspend</ActionButton>
              </div>
            ),
          },
        ]}
        rows={MOCK_ADMINS as unknown as Record<string, unknown>[]}
      />
    </div>
  )
}

export function SettingsSection() {
  return (
    <div className="space-y-4">
      <SectionHeader title="System Settings" description="Platform configuration and security preferences." />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-white/[0.06] dark:bg-[#12161f]">
          <h3 className="mb-4 font-semibold">Security</h3>
          <div className="space-y-3 text-sm">
            {[
              'Two-Factor Authentication (optional)',
              'Session timeout (60 min)',
              'Automatic logout after inactivity',
              'CSRF Protection',
              'Rate Limiting',
              'HTTPS Only',
            ].map((item) => (
              <label key={item} className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">{item}</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </label>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-white/[0.06] dark:bg-[#12161f]">
          <h3 className="mb-4 font-semibold">Account</h3>
          <div className="space-y-3">
            <ActionButton variant="secondary">Change Password</ActionButton>
            <ActionButton variant="secondary">Reset Password</ActionButton>
            <ActionButton variant="danger">Logout from All Devices</ActionButton>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-white/[0.06] dark:bg-[#12161f] lg:col-span-2">
          <h3 className="mb-4 font-semibold">Maintenance Mode</h3>
          <label className="flex items-center gap-3">
            <input type="checkbox" className="rounded" />
            <span className="text-sm text-slate-600 dark:text-slate-400">Enable maintenance mode (blocks user access)</span>
          </label>
        </div>
      </div>
    </div>
  )
}
