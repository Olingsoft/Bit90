import { API_URL } from '@/lib/api'
import type { AdminDashboardData } from './types'

export async function fetchAdminDashboard(): Promise<AdminDashboardData> {
  const res = await fetch(`${API_URL}admin`, {
    credentials: 'include',
    cache: 'no-store',
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw Object.assign(new Error(body.message || `Status ${res.status}`), { status: res.status })
  }

  return res.json()
}

export async function saveCrashRange(min: number, max: number) {
  const res = await fetch(`${API_URL}admin/crash-range`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ min, max }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || `Status ${res.status}`)
  }

  return res.json()
}

export async function saveCrashMode(mode: 'auto' | 'manual') {
  const res = await fetch(`${API_URL}admin/config`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ crash_mode: mode }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || `Status ${res.status}`)
  }

  return res.json()
}

export async function adminLogout() {
  await fetch(`${API_URL}admin/logout`, { credentials: 'include' })
}

export async function fetchUsers() {
  const res = await fetch(`${API_URL}users`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to load users')
  return res.json()
}
