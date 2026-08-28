'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { API_URL } from '@/lib/api'
import Logo from '@/public/bit90logo.jpg'

export default function AdminLogin() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!phoneNumber || !password) return

    setError(null)
    setIsLoading(true)

    try {
      const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL
      const res = await fetch(`${baseUrl}/admin/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, password }),
      })

      const json = await res.json()
      if (!res.ok) {
        setError(json.message || 'Admin login failed. Please check your credentials.')
        return
      }

      // Store token in localStorage for cross-origin requests
      if (json.token) {
        localStorage.setItem('admin_token', json.token)
      }

      router.push('/admin')
    } catch (err: any) {
      setError(err.message || 'Network error. Unable to reach authentication server.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen w-full bg-[#0A0F1E] text-[#E7ECF6] flex flex-col justify-between relative overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Background Decorative Glows */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(circle at 50% -10%, rgba(245, 166, 35, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(34, 214, 122, 0.06) 0%, transparent 45%)',
        }}
      />

      {/* Header Bar */}
      <header className="relative z-10 p-4 sm:p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2">
          <Image src={Logo} alt="Bit90 Logo" width={110} height={32} className="h-7 w-auto object-contain" priority />
        </Link>
        <Link
          href="/"
          className="text-xs font-semibold text-[#8890A3] hover:text-[#ECEEF3] transition-colors bg-[#12151C] border border-[#242832] px-3 py-1.5 rounded-lg flex items-center gap-1.5"
        >
          ← Back to Main Site
        </Link>
      </header>

      {/* Main Login Form Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#121A2E]/90 border border-[#22304A] backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl">
          {/* Header Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5A623]/10 border border-[#F5A623]/30 text-[#F5A623] text-xs font-bold uppercase tracking-widest mb-3">
              <span>Shield</span> Admin Portal
            </div>
            <h1
              className="text-2xl sm:text-3xl font-bold text-white tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Administrator Sign In
            </h1>
            <p className="text-xs sm:text-sm text-[#7C8AA8] mt-1.5">
              Access system management and monitoring dashboard
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-[#FF4757]/10 border border-[#FF4757]/30 text-[#FF4757] text-xs font-semibold flex items-start gap-2.5">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={submit} className="space-y-5">
            {/* Phone Number Field */}
            <div>
              <label className="block text-xs uppercase tracking-wide text-[#7C8AA8] font-bold mb-2">
                Admin Phone Number
              </label>
              <div className="relative flex items-center bg-[#0D1424] rounded-xl border border-[#22304A] focus-within:border-[#F5A623] transition-colors overflow-hidden">
                <span className="pl-3.5 pr-2 text-sm text-[#7C8AA8] select-none">📱</span>
                <input
                  type="text"
                  placeholder="0712345678 or +254712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-transparent py-3.5 pr-4 text-white text-sm outline-none font-medium placeholder-[#3A4A6B]"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs uppercase tracking-wide text-[#7C8AA8] font-bold">
                  Password
                </label>
              </div>
              <div className="relative flex items-center bg-[#0D1424] rounded-xl border border-[#22304A] focus-within:border-[#F5A623] transition-colors overflow-hidden">
                <span className="pl-3.5 pr-2 text-sm text-[#7C8AA8] select-none">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent py-3.5 pr-10 text-white text-sm outline-none font-medium placeholder-[#3A4A6B]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-[#7C8AA8] hover:text-white transition-colors text-xs"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !phoneNumber || !password}
              className="w-full mt-2 bg-[#F5A623] hover:bg-[#E0961C] disabled:bg-[#3A2D16] disabled:text-[#7C663D] text-[#0B0E14] font-bold text-sm py-3.5 rounded-xl transition duration-150 flex items-center justify-center gap-2 disabled:cursor-not-allowed shadow-lg shadow-[#F5A623]/10 cursor-pointer"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-[#0B0E14]" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign In to Dashboard →</span>
              )}
            </button>
          </form>

          {/* Footer Link to Admin Signup */}
          <div className="mt-6 pt-5 border-t border-[#22304A]/60 text-center">
            <p className="text-xs text-[#7C8AA8]">
              Need a new administrator account?{' '}
              <Link href="/admin/signup" className="text-[#F5A623] hover:underline font-semibold">
                Register Admin
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-4 text-center text-xs text-[#7C8AA8]">
        Bit90 Admin Portal &copy; {new Date().getFullYear()} · Encrypted Management Gateway
      </footer>
    </div>
  )
}