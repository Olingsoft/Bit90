'use client'

import { useState } from 'react'
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
          <a className="text-[#ECEEF3] border-b-2 border-[#F5A623] pb-[18px] -mb-[18px]"></a>
          <a className="hover:text-[#ECEEF3] transition-colors">Sports</a>
          <a className="hover:text-[#ECEEF3] transition-colors">Live</a>
          <a className="hover:text-[#ECEEF3] transition-colors"></a>
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
                className="bg-[#12151C] border border-[#242832] hover:border-[#F5A623]/50 transition-colors text-[#ECEEF3] font-medium px-3.5 py-1.5 rounded-md text-[13px]"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-[#F5A623] hover:bg-[#E0961C] transition-colors text-[#0B0E14] font-semibold px-3.5 py-1.5 rounded-md text-[13px]"
            >
              Login
            </Link>
          )}
          {user && (
            <div className="bg-[#12151C] border border-[#242832] rounded-md px-3 py-1.5 text-[13px]">
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
          <button className="w-8 h-8 rounded-md bg-[#12151C] border border-[#242832] flex items-center justify-center text-sm">
            👤
          </button>
        </div>
      </div>
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
