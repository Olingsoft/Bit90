import type { AdminRole, NavItem, Permission } from './types'

const ALL_PERMISSIONS: Permission[] = [
  'dashboard.view',
  'users.view',
  'users.edit',
  'users.freeze',
  'kyc.view',
  'kyc.approve',
  'deposits.view',
  'deposits.approve',
  'withdrawals.view',
  'withdrawals.approve',
  'withdrawals.reject',
  'finance.export',
  'bonuses.manage',
  'referrals.manage',
  'reports.view',
  'reports.export',
  'support.view',
  'support.chat',
  'payments.configure',
  'server.view',
  'notifications.view',
  'audit.view',
  'admins.view',
  'admins.delete',
  'settings.manage',
  'aviator.control',
]

const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  super_admin: ALL_PERMISSIONS,
  finance_admin: [
    'dashboard.view',
    'deposits.view',
    'deposits.approve',
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
    'users.edit',
    'users.freeze',
    'support.view',
    'support.chat',
    'notifications.view',
    'audit.view',
  ],
  kyc_admin: [
    'dashboard.view',
    'kyc.view',
    'kyc.approve',
    'users.view',
    'notifications.view',
    'audit.view',
  ],
  marketing_admin: [
    'dashboard.view',
    'bonuses.manage',
    'referrals.manage',
    'reports.view',
    'notifications.view',
    'audit.view',
  ],
  system_admin: [
    'dashboard.view',
    'payments.configure',
    'server.view',
    'settings.manage',
    'notifications.view',
    'audit.view',
  ],
}

export const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', permission: 'dashboard.view', group: 'Overview' },
  { key: 'users', label: 'Users', permission: 'users.view', group: 'Management' },
  { key: 'kyc', label: 'KYC', permission: 'kyc.view', group: 'Management' },
  { key: 'deposits', label: 'Deposits', permission: 'deposits.view', group: 'Finance' },
  { key: 'withdrawals', label: 'Withdrawals', permission: 'withdrawals.view', group: 'Finance' },
  { key: 'bonuses', label: 'Bonuses', permission: 'bonuses.manage', group: 'Marketing' },
  { key: 'referrals', label: 'Referrals', permission: 'referrals.manage', group: 'Marketing' },
  { key: 'reports', label: 'Reports', permission: 'reports.view', group: 'Analytics' },
  { key: 'support', label: 'Support', permission: 'support.view', group: 'Support' },
  { key: 'payments', label: 'Payment Settings', permission: 'payments.configure', group: 'System' },
  { key: 'server', label: 'Server Monitor', permission: 'server.view', group: 'System' },
  { key: 'notifications', label: 'Notifications', permission: 'notifications.view', group: 'System' },
  { key: 'audit', label: 'Audit Log', permission: 'audit.view', group: 'Security' },
  { key: 'admins', label: 'Administrators', permission: 'admins.view', group: 'Security' },
  { key: 'aviator', label: 'Aviator Control', permission: 'aviator.control', group: 'Game' },
  { key: 'settings', label: 'Settings', permission: 'settings.manage', group: 'System' },
]

export const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: 'Super Admin',
  finance_admin: 'Finance Admin',
  support_admin: 'Support Admin',
  kyc_admin: 'KYC Admin',
  marketing_admin: 'Marketing Admin',
  system_admin: 'System Admin',
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
