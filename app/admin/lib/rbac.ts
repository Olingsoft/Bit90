import type { AdminRole, NavItem, Permission } from './types'

const ALL_PERMISSIONS: Permission[] = [
  'dashboard.view',
  'users.view',
  'users.edit',
  'users.freeze',
  'kyc.view',
  'kyc.approve',
  'kyc.reject',
  'kyc.resubmit',
  'deposits.view',
  'deposits.approve',
  'withdrawals.view',
  'withdrawals.approve',
  'withdrawals.reject',
  'finance.export',
  'bonuses.manage',
  'bonuses.create',
  'referrals.manage',
  'referrals.campaigns',
  'promo.codes',
  'reports.view',
  'reports.export',
  'support.view',
  'support.chat',
  'support.resolve',
  'payments.configure',
  'server.view',
  'server.health',
  'notifications.view',
  'notifications.push',
  'audit.view',
  'logs.view',
  'maintenance.mode',
  'admins.view',
  'admins.manage',
  'admins.delete',
  'settings.manage',
  'aviator.control',
]

const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  super_admin: ALL_PERMISSIONS,
  finance_admin: [
    'dashboard.view',
    'deposits.view',
    'withdrawals.view',
    'withdrawals.approve',
    'withdrawals.reject',
    'finance.export',
    'reports.view',
    'reports.export',
    'notifications.view',
    'audit.view',
  ],
  support_admin: [
    'dashboard.view',
    'users.view',
    'users.freeze',
    'support.view',
    'support.chat',
    'support.resolve',
    'notifications.view',
    'audit.view',
  ],
  kyc_admin: [
    'dashboard.view',
    'kyc.view',
    'kyc.approve',
    'kyc.reject',
    'kyc.resubmit',
    'users.view',
    'notifications.view',
    'audit.view',
  ],
  marketing_admin: [
    'dashboard.view',
    'bonuses.manage',
    'bonuses.create',
    'referrals.manage',
    'referrals.campaigns',
    'promo.codes',
    'notifications.push',
    'reports.view',
    'notifications.view',
    'audit.view',
  ],
  system_admin: [
    'dashboard.view',
    'payments.configure',
    'server.view',
    'server.health',
    'logs.view',
    'maintenance.mode',
    'settings.manage',
    'notifications.view',
    'audit.view',
  ],
}

export const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', permission: 'dashboard.view', group: 'Overview' },
  { key: 'users', label: 'Users', permission: 'users.view', group: 'User Management' },
  { key: 'kyc', label: 'KYC Verification', permission: 'kyc.view', group: 'User Management' },
  { key: 'deposits', label: 'Deposits', permission: 'deposits.view', group: 'Finance' },
  { key: 'withdrawals', label: 'Withdrawals', permission: 'withdrawals.view', group: 'Finance' },
  { key: 'bonuses', label: 'Bonuses & Promotions', permission: 'bonuses.manage', group: 'Marketing' },
  { key: 'referrals', label: 'Referral Program', permission: 'referrals.manage', group: 'Marketing' },
  { key: 'reports', label: 'Financial Reports', permission: 'reports.view', group: 'Finance' },
  { key: 'support', label: 'Support Tickets', permission: 'support.view', group: 'Support' },
  { key: 'payments', label: 'Payment Gateways', permission: 'payments.configure', group: 'System' },
  { key: 'server', label: 'Server Health', permission: 'server.view', group: 'System' },
  { key: 'notifications', label: 'Notifications', permission: 'notifications.view', group: 'Communication' },
  { key: 'audit', label: 'Audit Logs', permission: 'audit.view', group: 'Security' },
  { key: 'admins', label: 'Admin Management', permission: 'admins.view', group: 'Security' },
  { key: 'aviator', label: 'Aviator Control', permission: 'aviator.control', group: 'Gaming' },
  { key: 'settings', label: 'System Settings', permission: 'settings.manage', group: 'System' },
]

export const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: 'Super Admin',
  finance_admin: 'Finance Admin',
  support_admin: 'Support Admin',
  kyc_admin: 'KYC Admin',
  marketing_admin: 'Marketing Admin',
  system_admin: 'System Admin',
}

export const ROLE_DESCRIPTIONS: Record<AdminRole, string> = {
  super_admin: 'Full access to all features including role management and system settings',
  finance_admin: 'Can view deposits, manage withdrawals, and export finance reports',
  support_admin: 'Can view users, freeze accounts, chat with customers, and resolve support tickets',
  kyc_admin: 'Can review submitted IDs, approve/reject KYC, and request resubmission',
  marketing_admin: 'Can create bonuses, manage referral campaigns, create promo codes, and send push notifications',
  system_admin: 'Can configure payment gateways, view server health, view logs, and configure maintenance mode',
}

/** Map legacy backend JWT roles to frontend RBAC roles. */
export function normalizeAdminRole(raw?: string | null): AdminRole {
  switch (raw) {
    case 'super_admin':
    case 'superadmin':
      return 'super_admin'
    case 'finance_admin':
      return 'finance_admin'
    case 'support_admin':
      return 'support_admin'
    case 'kyc_admin':
      return 'kyc_admin'
    case 'marketing_admin':
      return 'marketing_admin'
    case 'system_admin':
      return 'system_admin'
    case 'admin':
    default:
      return 'super_admin'
  }
}

export function hasPermission(role: AdminRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function getVisibleNav(role: AdminRole): NavItem[] {
  return NAV_ITEMS.filter((item) => hasPermission(role, item.permission))
}

export function canAccessPage(role: AdminRole, page: NavItem['key']): boolean {
  const item = NAV_ITEMS.find((nav) => nav.key === page)
  if (!item) return false
  return hasPermission(role, item.permission)
}
