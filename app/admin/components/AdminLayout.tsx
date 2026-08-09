'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  LayoutDashboard,
  Users,
  FileCheck,
  Wallet,
  ArrowDownToLine,
  Gift,
  Share2,
  BarChart3,
  Headphones,
  CreditCard,
  Server,
  Bell,
  ScrollText,
  ShieldCheck,
  Activity,
  Settings,
  LogOut,
  Menu,
  X,
  RefreshCw,
  Sun,
  Moon,
  Search,
} from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { fetchAdminDashboard, adminLogout } from '../lib/api'
import { getVisibleNav, canAccessPage, normalizeAdminRole, ROLE_LABELS, hasPermission } from '../lib/rbac'
import type { AdminDashboardData, AdminPage, AdminRole } from '../lib/types'
import { Toast } from './ui'

const NAV_ICONS: Record<AdminPage, React.ElementType> = {
  dashboard: LayoutDashboard,
  users: Users,
  kyc: FileCheck,
  deposits: Wallet,
  withdrawals: ArrowDownToLine,
  bonuses: Gift,
  referrals: Share2,
  reports: BarChart3,
  support: Headphones,
  payments: CreditCard,
  server: Server,
  notifications: Bell,
  audit: ScrollText,
  admins: ShieldCheck,
  aviator: Activity,
  settings: Settings,
}

const SESSION_TIMEOUT_MS = 60 * 60 * 1000 // 1 hour — matches JWT cookie

interface AdminLayoutProps {
  children: React.ReactNode
  currentPage: AdminPage
  pageTitle?: string
}

export function AdminLayout({ children, currentPage, pageTitle }: AdminLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [data, setData] = useState<AdminDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [globalSearch, setGlobalSearch] = useState('')
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'error' | 'info' } | null>(null)
  const [lastActivity, setLastActivity] = useState(Date.now())

  const adminRole: AdminRole = normalizeAdminRole(data?.admin?.role)
  const visibleNav = useMemo(() => getVisibleNav(adminRole), [adminRole])

  const loadDashboard = useCallback(async () => {
    try {
      const json = await fetchAdminDashboard()
      setData(json)
      setError(null)
      setLastUpdated(new Date())
      return json
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status
      if (status === 401 || status === 403) {
        router.push('/admin/login')
        return null
      }
      throw err
    }
  }, [router])

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        await loadDashboard()
      } catch (err: unknown) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error loading dashboard')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    init()
    const interval = setInterval(() => {
      loadDashboard().catch(() => {})
    }, 2000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [loadDashboard])

  // Session timeout — auto logout after inactivity
  useEffect(() => {
    function resetActivity() {
      setLastActivity(Date.now())
    }

    window.addEventListener('mousemove', resetActivity)
    window.addEventListener('keydown', resetActivity)
    window.addEventListener('click', resetActivity)

    const timer = setInterval(() => {
      if (Date.now() - lastActivity > SESSION_TIMEOUT_MS) {
        adminLogout().finally(() => router.push('/admin/login'))
      }
    }, 30000)

    return () => {
      window.removeEventListener('mousemove', resetActivity)
      window.removeEventListener('keydown', resetActivity)
      window.removeEventListener('click', resetActivity)
      clearInterval(timer)
    }
  }, [lastActivity, router])

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  async function handleManualRefresh() {
    setRefreshing(true)
    try {
      await loadDashboard()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Refresh error')
    } finally {
      setRefreshing(false)
    }
  }

  async function handleLogout() {
    await adminLogout()
    router.push('/admin/login')
  }

  function navigateTo(page: AdminPage) {
    if (!canAccessPage(adminRole, page)) {
      setToast({ message: 'You do not have permission to access this section.', tone: 'error' })
      return
    }
    if (page === 'dashboard') {
      router.push('/admin')
    } else {
      router.push(`/admin/${page}`)
    }
    setSidebarOpen(false)
  }

  const groupedNav = useMemo(() => {
    const groups: Record<string, typeof visibleNav> = {}
    for (const item of visibleNav) {
      const g = item.group ?? 'Other'
      if (!groups[g]) groups[g] = []
      groups[g].push(item)
    }
    return groups
  }, [visibleNav])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-500 dark:bg-[#0a0d12] dark:text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-6 w-6 animate-spin" />
          Loading dashboard...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-rose-500 dark:bg-[#0a0d12]">
        {error}
      </div>
    )
  }

  const currentPageLabel = pageTitle || visibleNav.find((n) => n.key === currentPage)?.label || currentPage

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 dark:bg-[#0a0d12] dark:text-slate-200">
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed z-40 flex h-screen w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 dark:border-white/[0.06] dark:bg-[#0d1017] lg:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-6 dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sky-500/15 text-sky-500 dark:text-sky-400">
              <ShieldCheck size={16} />
            </div>
            <span className="font-semibold tracking-tight text-slate-900 dark:text-slate-100">Bit90 Admin</span>
          </div>
          <button className="text-slate-500 lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto p-3">
          {Object.entries(groupedNav).map(([group, items]) => (
            <div key={group}>
              <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">{group}</p>
              <div className="space-y-0.5">
                {items.map(({ key, label }) => {
                  const Icon = NAV_ICONS[key]
                  const isActive = pathname === `/admin/${key}` || (key === 'dashboard' && pathname === '/admin')
                  return (
                    <button
                      key={key}
                      onClick={() => navigateTo(key)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                        isActive
                          ? 'bg-sky-500/10 text-sky-600 ring-1 ring-inset ring-sky-500/30 dark:text-sky-300'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/[0.04] dark:hover:text-slate-200'
                      }`}
                    >
                      <Icon size={17} />
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-slate-200 p-3 dark:border-white/[0.06]">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-rose-500/10 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-500/20 dark:text-rose-300"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-white/[0.06] dark:bg-[#0a0d12]/90 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="text-slate-500 lg:hidden">
              <Menu size={20} />
            </button>
            <h1 className="truncate text-lg font-semibold capitalize tracking-tight text-slate-900 dark:text-slate-100">
              {currentPageLabel}
            </h1>
            <span className="hidden text-xs text-slate-400 sm:inline">
              {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : ''}
            </span>
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/[0.08]"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Search..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-44 rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs outline-none focus:ring-1 focus:ring-sky-500 dark:border-white/10 dark:bg-white/[0.03] lg:w-56"
              />
            </div>

            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/[0.05]"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button
              onClick={() => navigateTo('notifications')}
              className="relative rounded-lg border border-slate-200 p-2 text-slate-500 dark:border-white/10"
            >
              <Bell size={16} />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-rose-500" />
            </button>

            <div className="hidden text-right sm:block">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-200">{data?.admin?.phone ?? 'Administrator'}</p>
              <p className="text-[10px] text-sky-500 dark:text-sky-400">{ROLE_LABELS[adminRole]}</p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>

      {toast && (
        <Toast
          message={toast.message}
          tone={toast.tone}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
