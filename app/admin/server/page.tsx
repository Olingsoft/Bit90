'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchAdminDashboard } from '../lib/api'
import { ServerSection } from '../components/ManagementSections'
import { AdminLayout } from '../components/AdminLayout'
import { SectionHeader } from '../components/ui'
import { hasPermission, normalizeAdminRole } from '../lib/rbac'

export default function ServerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetchAdminDashboard()
        setData(response)
        const adminRole = normalizeAdminRole(response?.admin?.role)
        
        if (!hasPermission(adminRole, 'server.view')) {
          router.push('/admin')
          return
        }
        
        setAuthorized(true)
      } catch (err) {
        router.push('/admin/login')
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-500 dark:bg-[#0a0d12] dark:text-slate-400">
        Loading...
      </div>
    )
  }

  if (!authorized) {
    return null
  }

  const adminRole = normalizeAdminRole(data?.admin?.role)
  const canViewHealth = hasPermission(adminRole, 'server.health')
  const canViewLogs = hasPermission(adminRole, 'logs.view')

  return (
    <AdminLayout currentPage="server" pageTitle="Server Management">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          title="Server Management"
          description={(canViewHealth || canViewLogs) ? "Monitor server performance, metrics, and system health." : "View server status."}
        />
        <ServerSection canViewHealth={canViewHealth} canViewLogs={canViewLogs} />
      </div>
    </AdminLayout>
  )
}
