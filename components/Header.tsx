'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'

import Logo from '@/public/bit90logo.png'
import Image from 'next/image'

interface HeaderProps {
  query: string
  setQuery: (value: string) => void
}

function formatBalance(balance?: number) {
  return new Intl.NumberFormat('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(balance ?? 0)
}

export default function Header({ query, setQuery }: HeaderProps) {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-20 bg-[#0B0E14]/95 backdrop-blur border-b border-[#242832]">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-5 h-14 flex items-center gap-4 justify-between">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-38 h-7 flex items-center justify-center text-[#F5A623] ">
            ♦ <Image src={Logo} alt="Logo" width={100} height={100} />
          </div>
          <span className="font-bold tracking-tight text-base hidden xs:block" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          ♦ <Image src={Logo} alt="Logo" width={100} height={100} />
          </span> 
        </div> 

        <nav className="hidden md:flex items-center gap-5 text-[13px] font-medium text-[#8890A3] shrink-0">
          <a className="hover:text-[#ECEEF3] transition-colors cursor-pointer">Sports</a>
          <a className="hover:text-[#ECEEF3] transition-colors cursor-pointer">Live</a>
        </nav>

        <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
          {user ? (
            <>
              <span className="text-[#8890A3] text-[13px] hidden md:inline">
                {user.phone}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="bg-[#12151C] border border-[#242832] hover:border-[#F5A623]/50 transition-colors text-[#ECEEF3] font-medium px-3 py-1.5 rounded-md text-[13px]"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-[#F5A623] hover:bg-[#E0961C] transition-colors text-[#0B0E14] font-semibold px-3 py-1.5 rounded-md text-[13px]"
            >
              Login
            </Link>
          )}
          {user && (
            <div className="bg-[#12151C] border border-[#242832] rounded-md px-2.5 sm:px-3 py-1.5 text-[13px]">
              <span className="text-[#6E7688] mr-1.5 hidden lg:inline">Balance</span>
              <span className="font-semibold tabular-nums" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Ksh.{formatBalance(user.balance)}
              </span>
            </div>
          )}
          <Link href="/deposit">
            <button className="bg-[#F5A623] hover:bg-[#E0961C] transition-colors text-[#0B0E14] font-semibold px-3.5 py-1.5 rounded-md text-[13px] hidden sm:block">
              Deposit
            </button>
          </Link>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            className="w-8 h-8 rounded-md bg-[#12151C] border border-[#242832] hover:border-[#F5A623]/50 transition-colors text-[#ECEEF3] flex items-center justify-center cursor-pointer"
          >
            {isFullscreen ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 9L4 4m0 0v5m0-5h5m6 0l5 5m0 0v-5m0 5h-5m-6 11l-5 5m0 0v-5m0 5h5m6 0l5-5m0 0v5m0-5h-5" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </button>

          {/* Menu Button for Small Screens (Replaces 👤 head icon) */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle Menu"
            className="w-8 h-8 rounded-md bg-[#12151C] border border-[#242832] hover:border-[#F5A623]/50 transition-colors flex items-center justify-center text-[#ECEEF3] md:hidden cursor-pointer"
          >
            {isMobileMenuOpen ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#242832] bg-[#0B0E14] px-4 py-3 space-y-3">
          <nav className="flex flex-col gap-2.5 text-sm font-medium text-[#8890A3]">
            <a className="text-[#ECEEF3] font-semibold hover:text-[#F5A623] transition-colors cursor-pointer">Sports</a>
            <a className="hover:text-[#ECEEF3] transition-colors cursor-pointer">Live</a>
          </nav>
          <div className="pt-2.5 border-t border-[#242832]/60 flex items-center justify-between">
            <Link href="/deposit" onClick={() => setIsMobileMenuOpen(false)}>
              <button className="bg-[#F5A623] hover:bg-[#E0961C] transition-colors text-[#0B0E14] font-semibold px-3.5 py-1.5 rounded-md text-[13px]">
                Deposit
              </button>
            </Link>
            {user && (
              <span className="text-[#8890A3] text-xs font-mono">{user.phone}</span>
            )}
          </div>
        </div>
      )}

      {/* mobile search */}
      <div className="sm:hidden px-3 pb-2.5">
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6E7688] text-xs">⌕</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search games..."
            className="w-full bg-[#12151C] border border-[#242832] rounded-md pl-7 pr-3 py-1.5 text-[13px] outline-none focus:border-[#F5A623]/50 placeholder:text-[#6E7688]"
          />
        </div>
      </div>
    </header>
  )
}
