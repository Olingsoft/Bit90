'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { API_URL } from '@/lib/api'
import { withLocale } from '@/lib/locale'
import Image from 'next/image'
import Logo from '@/public/bit90logo.png'

export default function RegisterPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(withLocale('/'))
    }
  }, [authLoading, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`${API_URL}users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message ?? 'Registration failed')
        return
      }

      setShowSuccess(true)
    } catch {
      setError('Unable to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const goToLogin = () => {
    router.push(withLocale('/login'))
  }

  return (
    <div className="min-h-screen w-full bg-[#F8F8F8] text-[#1A1A1A] flex items-center justify-center p-4">
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-6 text-center shadow-xl">
            <div className="w-14 h-14 rounded-full bg-[#22D67A]/20 flex items-center justify-center text-[#22D67A] text-2xl mx-auto mb-4">
              ✓
            </div>
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Registration Successful</h2>
            <p className="text-[#666666] text-sm mb-6">
              Your account has been created. Sign in to continue.
            </p>
            <button
              type="button"
              onClick={goToLogin}
              className="w-full bg-[#22D67A] hover:bg-[#1CBE6B] transition text-[#FFFFFF] font-semibold py-3 rounded-lg text-sm"
            >
              Go to Login
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mb-4">
            <Image src={Logo} alt="Bit90 Logo" width={150} height={50} className="h-12 w-auto mx-auto object-contain" priority />
          </div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">Create Account</h1>
          <p className="text-[#666666] text-sm">Sign up to get started</p>
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
              placeholder="Create a password"
              className="w-full bg-[#F9F9F9] border border-[#E5E5E5] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#22D67A]/50 placeholder:text-[#999999] text-[#1A1A1A]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#666666] mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
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
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-[#666666] text-sm mt-6">
          Already have an account?{' '}
          <Link href={withLocale('/login')} className="text-[#22D67A] hover:text-[#1CBE6B] font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
