'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { API_URL } from '@/lib/api'
import Image from 'next/image'
import Logo from '@/public/bit90logo.jpg'

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
      router.replace('/')
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
    router.push('/login')
  }

  return (
    <div className="min-h-screen w-full bg-[#0A0F1E] text-gray-100 flex items-center justify-center p-4">
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm bg-[#12151C] border border-gray-700 rounded-xl p-6 text-center shadow-xl">
            <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-2xl mx-auto mb-4">
              ✓
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Registration Successful</h2>
            <p className="text-gray-400 text-sm mb-6">
              Your account has been created. Sign in to continue.
            </p>
            <button
              type="button"
              onClick={goToLogin}
              className="w-full bg-orange-500 hover:bg-orange-600 transition text-gray-900 font-semibold py-3 rounded-lg text-sm"
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
          <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-400 text-sm">Sign up to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-sm outline-none focus:border-orange-500/50 placeholder:text-gray-500 text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-sm outline-none focus:border-orange-500/50 placeholder:text-gray-500 text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-sm outline-none focus:border-orange-500/50 placeholder:text-gray-500 text-gray-100"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed transition text-gray-900 font-semibold py-3 rounded-lg text-sm"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-orange-500 hover:text-orange-400 font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
