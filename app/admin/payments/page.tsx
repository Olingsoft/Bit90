'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchAdminDashboard } from '../lib/api'
import { PaymentsSection } from '../components/ManagementSections'
import { AdminLayout } from '../components/AdminLayout'
import { SectionHeader } from '../components/ui'

export default function PaymentsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      try {
        await fetchAdminDashboard()
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

  return (
    <AdminLayout currentPage="payments" pageTitle="Payment Methods">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          title="Payment Methods"
          description="Configure payment gateways, methods, and transaction processing."
        />
        <PaymentsSection />
      </div>
    </AdminLayout>
  )
}
