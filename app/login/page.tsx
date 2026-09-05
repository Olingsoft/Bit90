'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { API_URL } from '@/lib/api'
import { withLocale } from '@/lib/locale'
import Image from 'next/image'
import Logo from '@/public/bit90logo.png'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('from') || '/'
  const { login, user, isLoading: authLoading } = useAuth()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(withLocale('/'))
    }
  }, [authLoading, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message ?? 'Login failed')
        return
      }

      login(data.token, data.user)
      router.push(withLocale(redirectTo))
    } catch {
      setError('Unable to connect to server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#F8F8F8] text-[#1A1A1A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mb-4">
            <Image src={Logo} alt="Bit90 Logo" width={150} height={50} className="h-12 w-auto mx-auto object-contain" priority />
          </div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">Welcome Back</h1>
          <p className="text-[#666666] text-sm">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#666666] mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              className="w-full bg-[#F9F9F9] border border-[#E5E5E5] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#22D67A]/50 placeholder:text-[#999999] text-[#1A1A1A]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#666666] mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full bg-[#F9F9F9] border border-[#E5E5E5] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#22D67A]/50 placeholder:text-[#999999] text-[#1A1A1A]"
              required
            />
          </div>

          {error && (
            <p className="text-[#FF4757] text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#22D67A] hover:bg-[#1CBE6B] disabled:opacity-60 disabled:cursor-not-allowed transition text-[#FFFFFF] font-semibold py-3 rounded-lg text-sm"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-[#666666] text-sm mt-6">
          Don&apos;t have an account?{' '}
          <Link href={withLocale('/register')} className="text-[#22D67A] hover:text-[#1CBE6B] font-medium">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full bg-[#F8F8F8] flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-[#22D67A] border-t-transparent animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
