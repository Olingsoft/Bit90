import { API_URL } from '@/lib/api'
import type { AdminDashboardData } from './types'

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('admin_token')
}

export async function fetchAdminDashboard(): Promise<AdminDashboardData> {
  const token = getAuthToken()
  const headers: Record<string, string> = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_URL}admin`, {
    headers,
    cache: 'no-store',
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw Object.assign(new Error(body.message || `Status ${res.status}`), { status: res.status })
  }

  return res.json()
}

export async function saveCrashRange(min: number, max: number) {
  const token = getAuthToken()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_URL}admin/crash-range`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ min, max }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || `Status ${res.status}`)
  }

  return res.json()
}

export async function saveCrashMode(mode: 'auto' | 'manual') {
  const token = getAuthToken()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_URL}admin/config`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ crash_mode: mode }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || `Status ${res.status}`)
  }

  return res.json()
}

export async function adminLogout() {
  const token = getAuthToken()
  const headers: Record<string, string> = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  await fetch(`${API_URL}admin/logout`, { headers })
  localStorage.removeItem('admin_token')
}

export async function fetchUsers() {
  const token = getAuthToken()
  const headers: Record<string, string> = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_URL}users`, { headers, cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to load users')
  return res.json()
}
