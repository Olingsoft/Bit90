'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchAdminDashboard } from '../lib/api'
import { DepositsSection } from '../components/ManagementSections'
import { AdminLayout } from '../components/AdminLayout'
import { SectionHeader, EmptyState } from '../components/ui'
import { hasPermission, normalizeAdminRole } from '../lib/rbac'

export default function DepositsPage() {
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
        
        if (!hasPermission(adminRole, 'deposits.view')) {
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
  const canApprove = hasPermission(adminRole, 'deposits.approve')

  return (
    <AdminLayout currentPage="deposits" pageTitle="Deposits">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          title="Deposits"
          description={canApprove ? "Monitor and approve deposit transactions." : "View deposit transactions."}
        />
        <DepositsSection canApprove={canApprove} />
      </div>
    </AdminLayout>
  )
}
