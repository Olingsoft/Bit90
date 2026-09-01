'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { API_URL } from '@/lib/api'
import Image from 'next/image'
import Logo from '@/public/bit90logo.jpg'

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
      router.replace('/')
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
      router.push(redirectTo)
    } catch {
      setError('Unable to connect to server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#120D08] text-[#F3E6D6] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mb-4">
            <Image src={Logo} alt="Bit90 Logo" width={150} height={50} className="h-12 w-auto mx-auto object-contain" priority />
          </div>
          <h1 className="text-2xl font-bold text-[#F3E6D6] mb-2">Welcome Back</h1>
          <p className="text-[#9C8A73] text-sm">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#9C8A73] mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              className="w-full bg-[#1B140C] border border-[#3A2818] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#FF5A1F]/50 placeholder:text-[#6E5C46] text-[#F3E6D6]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#9C8A73] mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full bg-[#1B140C] border border-[#3A2818] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#FF5A1F]/50 placeholder:text-[#6E5C46] text-[#F3E6D6]"
              required
            />
          </div>

          {error && (
            <p className="text-[#E5484D] text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF5A1F] hover:bg-[#E64F17] disabled:opacity-60 disabled:cursor-not-allowed transition text-[#120D08] font-semibold py-3 rounded-lg text-sm"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-[#9C8A73] text-sm mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-[#FF5A1F] hover:text-[#E64F17] font-medium">
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
      <div className="min-h-screen w-full bg-[#120D08] flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-[#FF5A1F] border-t-transparent animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
