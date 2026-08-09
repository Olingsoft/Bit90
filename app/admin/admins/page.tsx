'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchAdminDashboard } from '../lib/api'
import { AdminsSection } from '../components/ManagementSections'
import { AdminLayout } from '../components/AdminLayout'
import { SectionHeader, EmptyState } from '../components/ui'
import { hasPermission, normalizeAdminRole } from '../lib/rbac'

export default function AdminsPage() {
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
        
        if (!hasPermission(adminRole, 'admins.view')) {
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
  const canManage = hasPermission(adminRole, 'admins.manage')
  const canDelete = hasPermission(adminRole, 'admins.delete')

  return (
    <AdminLayout currentPage="admins" pageTitle="Admin Management">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          title="Admin Management"
          description={canManage ? "Manage admin accounts, roles, and permissions." : "View admin accounts."}
        />
        <AdminsSection canManage={canManage} canDelete={canDelete} currentRole={adminRole} />
      </div>
    </AdminLayout>
  )
}
