import type { ChartPoint, DashboardStats } from './types'

export const DASHBOARD_STATS: DashboardStats = {
  totalUsers: 24850,
  activeUsers: 18240,
  onlineUsers: 1247,
  todayDeposits: 2845000,
  todayWithdrawals: 1923000,
  pendingWithdrawals: 47,
  pendingKyc: 23,
  totalBets: 184920,
  totalRevenue: 8450000,
  totalBonuses: 420000,
  supportTickets: 18,
  referralSignups: 312,
  serverStatus: 'online',
}

export const DAILY_REVENUE: ChartPoint[] = [
  { label: 'Mon', value: 820000 },
  { label: 'Tue', value: 940000 },
  { label: 'Wed', value: 780000 },
  { label: 'Thu', value: 1100000 },
  { label: 'Fri', value: 1250000 },
  { label: 'Sat', value: 1580000 },
  { label: 'Sun', value: 1320000 },
]

export const DAILY_BETS: ChartPoint[] = [
  { label: 'Mon', value: 12400 },
  { label: 'Tue', value: 14200 },
  { label: 'Wed', value: 11800 },
  { label: 'Thu', value: 16500 },
  { label: 'Fri', value: 18900 },
  { label: 'Sat', value: 22400 },
  { label: 'Sun', value: 19800 },
]

export const DEPOSITS_VS_WITHDRAWALS: ChartPoint[] = [
  { label: 'Mon', value: 420000, value2: 310000 },
  { label: 'Tue', value: 510000, value2: 380000 },
  { label: 'Wed', value: 390000, value2: 290000 },
  { label: 'Thu', value: 620000, value2: 450000 },
  { label: 'Fri', value: 710000, value2: 520000 },
  { label: 'Sat', value: 890000, value2: 640000 },
  { label: 'Sun', value: 760000, value2: 580000 },
]

export const NEW_USERS: ChartPoint[] = [
  { label: 'W1', value: 420 },
  { label: 'W2', value: 510 },
  { label: 'W3', value: 480 },
  { label: 'W4', value: 620 },
]

export const MONTHLY_PROFIT: ChartPoint[] = [
  { label: 'Jan', value: 4200000 },
  { label: 'Feb', value: 4800000 },
  { label: 'Mar', value: 5100000 },
  { label: 'Apr', value: 6200000 },
  { label: 'May', value: 7100000 },
  { label: 'Jun', value: 8450000 },
]

export const MOCK_KYC = [
  { id: 'KYC-001', user: 'John Kamau', docType: 'National ID', status: 'pending', submitted: '2026-08-06T08:30:00Z' },
  { id: 'KYC-002', user: 'Mary Wanjiku', docType: 'Passport', status: 'pending', submitted: '2026-08-06T07:15:00Z' },
  { id: 'KYC-003', user: 'Peter Ochieng', docType: 'Driving License', status: 'approved', submitted: '2026-08-05T14:20:00Z' },
]

export const MOCK_DEPOSITS = [
  { id: 'DEP-8821', user: '0712***890', amount: 5000, method: 'M-Pesa', txId: 'QHX7K2M9P1', status: 'completed', date: '2026-08-06T10:22:00Z' },
  { id: 'DEP-8820', user: '0723***456', amount: 25000, method: 'Bank Transfer', txId: 'BT-20260806-001', status: 'pending', date: '2026-08-06T09:45:00Z' },
  { id: 'DEP-8819', user: '0701***234', amount: 1000, method: 'Airtel Money', txId: 'AM9X4K2L8', status: 'completed', date: '2026-08-06T08:10:00Z' },
]

export const MOCK_WITHDRAWALS = [
  { id: 'WTH-4412', user: '0712***890', amount: 15000, details: 'M-Pesa 0712***890', txId: '—', status: 'pending', requested: '2026-08-06T10:30:00Z' },
  { id: 'WTH-4411', user: '0734***678', amount: 50000, details: 'Equity Bank ***4521', txId: '—', status: 'hold', requested: '2026-08-06T09:00:00Z' },
  { id: 'WTH-4410', user: '0708***123', amount: 8000, details: 'M-Pesa 0708***123', txId: 'WTH-OK-991', status: 'approved', requested: '2026-08-05T16:20:00Z' },
]

export const MOCK_BONUSES = [
  { id: 'BN-101', name: 'Welcome Bonus', type: 'Welcome Bonus', amount: '100%', wager: '5x', expiry: '2026-12-31', status: 'active' },
  { id: 'BN-102', name: 'Weekend Cashback', type: 'Cashback Bonus', amount: '10%', wager: '3x', expiry: '2026-08-31', status: 'active' },
  { id: 'BN-103', name: 'VIP Reload', type: 'VIP Bonus', amount: 'KES 5,000', wager: '8x', expiry: '2026-09-15', status: 'draft' },
]

export const MOCK_TICKETS = [
  { id: 'TKT-901', user: '0712***890', subject: 'Withdrawal delay', priority: 'high', status: 'open', assigned: 'Unassigned' },
  { id: 'TKT-900', user: '0723***456', subject: 'Deposit not credited', priority: 'urgent', status: 'pending', assigned: 'Support Team' },
  { id: 'TKT-899', user: '0701***234', subject: 'Account verification', priority: 'normal', status: 'closed', assigned: 'KYC Admin' },
]

export const MOCK_AUDIT = [
  { admin: 'Super Admin', role: 'Super Admin', action: 'Approved Withdrawal', target: 'WTH-4410', ip: '102.68.86.20', browser: 'Chrome 128', date: '2026-08-06', time: '10:15:32' },
  { admin: 'Finance Admin', role: 'Finance Admin', action: 'Exported Finance Report', target: '—', ip: '41.90.12.44', browser: 'Firefox 127', date: '2026-08-06', time: '09:42:18' },
  { admin: 'KYC Admin', role: 'KYC Admin', action: 'Rejected KYC', target: 'KYC-004', ip: '105.163.22.11', browser: 'Safari 17', date: '2026-08-05', time: '18:30:05' },
  { admin: 'Super Admin', role: 'Super Admin', action: 'Updated Crash Range', target: 'Aviator', ip: '102.68.86.20', browser: 'Chrome 128', date: '2026-08-05', time: '14:22:41' },
]

export const MOCK_ADMINS = [
  { name: 'System Owner', username: 'superadmin', email: 'admin@bit90.com', phone: '0700000001', role: 'Super Admin', status: 'Active', lastLogin: '2026-08-06T10:00:00Z' },
  { name: 'Finance Lead', username: 'finance01', email: 'finance@bit90.com', phone: '0700000002', role: 'Finance Admin', status: 'Active', lastLogin: '2026-08-06T08:30:00Z' },
  { name: 'Support Agent', username: 'support01', email: 'support@bit90.com', phone: '0700000003', role: 'Support Admin', status: 'Active', lastLogin: '2026-08-05T17:45:00Z' },
]

export const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'Large Withdrawal', message: 'Withdrawal KES 50,000 pending review', time: '2 min ago', read: false },
  { id: 2, type: 'KYC Submission', message: 'New KYC from John Kamau', time: '15 min ago', read: false },
  { id: 3, type: 'Large Deposit', message: 'Deposit KES 100,000 received', time: '1 hr ago', read: true },
  { id: 4, type: 'Support Ticket', message: 'Urgent ticket TKT-900 opened', time: '2 hr ago', read: true },
]

export const SERVER_METRICS = {
  cpu: 34,
  ram: 62,
  disk: 48,
  db: 'healthy',
  api: 'healthy',
  mpesa: 'healthy',
  uptime: '99.97%',
  sessions: 1247,
}

export function formatCurrency(n: number) {
  return `KES ${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

export function formatDate(iso?: string | null) {
  if (!iso) return 'N/A'
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

export function formatCrashMultiplier(value: unknown) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  return `${n.toFixed(2)}x`
}
