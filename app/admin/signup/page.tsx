'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { API_URL } from '@/lib/api'
import Logo from '@/public/bit90logo.jpg'

export default function AdminSignup() {
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [secret, setSecret] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showSecret, setShowSecret] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName || !username || !phoneNumber || !email || !password || !secret) return

    setError(null)
    setIsLoading(true)

    try {
      const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL
      const res = await fetch(`${baseUrl}/admin/signup`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, username, phone: phoneNumber, email, password, secret }),
      })

      const json = await res.json()
      if (!res.ok) {
        setError(json.message || 'Admin account creation failed. Check parameters and secret key.')
        return
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
            'radial-gradient(circle at 50% -10%, rgba(34, 214, 122, 0.12) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(245, 166, 35, 0.08) 0%, transparent 45%)',
        }}
      />

      {/* Header Bar */}
      <header className="relative z-10 p-4 sm:p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2">
          <Image src={Logo} alt="Bit90 Logo" width={110} height={32} className="h-7 w-auto object-contain" priority />
        </Link>
        <Link
          href="/admin/login"
          className="text-xs font-semibold text-[#8890A3] hover:text-[#ECEEF3] transition-colors bg-[#12151C] border border-[#242832] px-3 py-1.5 rounded-lg flex items-center gap-1.5"
        >
          ← Back to Admin Login
        </Link>
      </header>

      {/* Main Form Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#121A2E]/90 border border-[#22304A] backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl">
          {/* Header Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#22D67A]/10 border border-[#22D67A]/30 text-[#22D67A] text-xs font-bold uppercase tracking-widest mb-3">
              <span>Key</span> Admin Registration
            </div>
            <h1
              className="text-2xl sm:text-3xl font-bold text-white tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Create Admin Account
            </h1>
            <p className="text-xs sm:text-sm text-[#7C8AA8] mt-1.5">
              Requires valid server administrator secret key
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
          <form onSubmit={submit} className="space-y-4">
            {/* Full Name Field */}
            <div>
              <label className="block text-xs uppercase tracking-wide text-[#7C8AA8] font-bold mb-2">
                Full Name
              </label>
              <div className="relative flex items-center bg-[#0D1424] rounded-xl border border-[#22304A] focus-within:border-[#22D67A] transition-colors overflow-hidden">
                <span className="pl-3.5 pr-2 text-sm text-[#7C8AA8] select-none">👤</span>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-transparent py-3.5 pr-4 text-white text-sm outline-none font-medium placeholder-[#3A4A6B]"
                  required
                />
              </div>
            </div>

            {/* Username Field */}
            <div>
              <label className="block text-xs uppercase tracking-wide text-[#7C8AA8] font-bold mb-2">
                Username
              </label>
              <div className="relative flex items-center bg-[#0D1424] rounded-xl border border-[#22304A] focus-within:border-[#22D67A] transition-colors overflow-hidden">
                <span className="pl-3.5 pr-2 text-sm text-[#7C8AA8] select-none">@</span>
                <input
                  type="text"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-transparent py-3.5 pr-4 text-white text-sm outline-none font-medium placeholder-[#3A4A6B]"
                  required
                />
              </div>
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-xs uppercase tracking-wide text-[#7C8AA8] font-bold mb-2">
                Admin Phone Number
              </label>
              <div className="relative flex items-center bg-[#0D1424] rounded-xl border border-[#22304A] focus-within:border-[#22D67A] transition-colors overflow-hidden">
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

            {/* Email Field */}
            <div>
              <label className="block text-xs uppercase tracking-wide text-[#7C8AA8] font-bold mb-2">
                Email Address
              </label>
              <div className="relative flex items-center bg-[#0D1424] rounded-xl border border-[#22304A] focus-within:border-[#22D67A] transition-colors overflow-hidden">
                <span className="pl-3.5 pr-2 text-sm text-[#7C8AA8] select-none">✉️</span>
                <input
                  type="email"
                  placeholder="admin@bit90.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent py-3.5 pr-4 text-white text-sm outline-none font-medium placeholder-[#3A4A6B]"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs uppercase tracking-wide text-[#7C8AA8] font-bold mb-2">
                Password
              </label>
              <div className="relative flex items-center bg-[#0D1424] rounded-xl border border-[#22304A] focus-within:border-[#22D67A] transition-colors overflow-hidden">
                <span className="pl-3.5 pr-2 text-sm text-[#7C8AA8] select-none">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create strong password"
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

            {/* Admin Signup Secret Key Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs uppercase tracking-wide text-[#7C8AA8] font-bold">
                  Admin Master Secret Key
                </label>
                <span className="text-[10px] text-[#22D67A] font-semibold">Required</span>
              </div>
              <div className="relative flex items-center bg-[#0D1424] rounded-xl border border-[#22304A] focus-within:border-[#22D67A] transition-colors overflow-hidden">
                <span className="pl-3.5 pr-2 text-sm text-[#7C8AA8] select-none">🔑</span>
                <input
                  type={showSecret ? 'text' : 'password'}
                  placeholder="Master secret key"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  className="w-full bg-transparent py-3.5 pr-10 text-white text-sm outline-none font-medium placeholder-[#3A4A6B]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 text-[#7C8AA8] hover:text-white transition-colors text-xs"
                >
                  {showSecret ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="text-[11px] text-[#6E7688] mt-1.5">
                Secret key set in server environment (`ADMIN_SIGNUP_SECRET`).
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !fullName || !username || !phoneNumber || !email || !password || !secret}
              className="w-full mt-2 bg-[#22D67A] hover:bg-[#1CBE6B] disabled:bg-[#1C3A2B] disabled:text-[#4A7A64] text-[#0A0F1E] font-bold text-sm py-3.5 rounded-xl transition duration-150 flex items-center justify-center gap-2 disabled:cursor-not-allowed shadow-lg shadow-[#22D67A]/10 cursor-pointer"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-[#0A0F1E]" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Registering Admin...</span>
                </>
              ) : (
                <span>Register & Open Dashboard →</span>
              )}
            </button>
          </form>

          {/* Footer Link to Admin Login */}
          <div className="mt-6 pt-5 border-t border-[#22304A]/60 text-center">
            <p className="text-xs text-[#7C8AA8]">
              Already registered as an administrator?{' '}
              <Link href="/admin/login" className="text-[#22D67A] hover:underline font-semibold">
                Sign In Here
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
