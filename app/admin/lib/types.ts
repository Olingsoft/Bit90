export type AdminRole =
  | 'super_admin'
  | 'finance_admin'
  | 'support_admin'
  | 'kyc_admin'
  | 'marketing_admin'
  | 'system_admin'
  | 'unassigned'

export type AdminPage =
  | 'dashboard'
  | 'users'
  | 'kyc'
  | 'deposits'
  | 'withdrawals'
  | 'bonuses'
  | 'referrals'
  | 'reports'
  | 'support'
  | 'payments'
  | 'server'
  | 'notifications'
  | 'audit'
  | 'admins'
  | 'aviator'
  | 'settings'

export type Permission =
  | 'dashboard.view'
  | 'users.view'
  | 'users.edit'
  | 'users.freeze'
  | 'kyc.view'
  | 'kyc.approve'
  | 'kyc.reject'
  | 'kyc.resubmit'
  | 'deposits.view'
  | 'withdrawals.view'
  | 'withdrawals.approve'
  | 'withdrawals.reject'
  | 'finance.export'
  | 'bonuses.manage'
  | 'bonuses.create'
  | 'referrals.manage'
  | 'referrals.campaigns'
  | 'promo.codes'
  | 'reports.view'
  | 'reports.export'
  | 'support.view'
  | 'support.chat'
  | 'support.resolve'
  | 'payments.configure'
  | 'server.view'
  | 'server.health'
  | 'notifications.view'
  | 'notifications.push'
  | 'audit.view'
  | 'logs.view'
  | 'maintenance.mode'
  | 'admins.view'
  | 'admins.manage'
  | 'admins.delete'
  | 'settings.manage'
  | 'aviator.control'

export interface AdminProfile {
  id: string
  phone: string
  role: AdminRole
  fullName?: string
}

export interface AdminDashboardData {
  title?: string
  publicState?: Record<string, unknown>
  crashQueue?: Array<{ position?: number; hash?: string; crashPoint?: number }>
  crashRange?: { min?: number; max?: number }
  game_config?: {
    crash_mode?: 'auto' | 'manual'
    rtp_param?: number
    band_weights?: Record<string, number>
  }
  admin?: AdminProfile
}

export interface NavItem {
  key: AdminPage
  label: string
  permission: Permission
  group?: string
}

export interface DashboardStats {
  totalUsers: number
  activeUsers: number
  onlineUsers: number
  todayDeposits: number
  todayWithdrawals: number
  pendingWithdrawals: number
  pendingKyc: number
  totalBets: number
  totalRevenue: number
  totalBonuses: number
  supportTickets: number
  referralSignups: number
  serverStatus: 'online' | 'degraded' | 'offline'
}

export interface ChartPoint {
  label: string
  value: number
  value2?: number
}
