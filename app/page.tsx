'use client'

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";

const FONT_LINK_ID = "casino-fonts";
function useFonts() {
  useEffect(() => {
    if (document.getElementById(FONT_LINK_ID)) return;
    const link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, []);
}

function AviatorCard() {
  const [mult, setMult] = useState<number>(1.0);
  const [phase, setPhase] = useState<"flying" | "crashed">("flying");

  useEffect(() => {
    let raf: number | null = null;
    let start = performance.now();
    let cap = 2 + Math.random() * 6;

    const tick = (now: number) => {
      const t = (now - start) / 1000;
      const m = Math.pow(1 + 0.09 * t, 2);
      if (m >= cap) {
        setMult(cap);
        setPhase("crashed");
        setTimeout(() => {
          start = performance.now();
          cap = 2 + Math.random() * 6;
          setPhase("flying");
          setMult(1.0);
        }, 1400);
        return;
      }
      setMult(m);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="relative rounded-xl border border-[#242832] bg-[#12151C] hover:border-[#F5A623]/40 transition-colors overflow-hidden shadow-xl">
      <div className="relative grid md:grid-cols-[1fr_auto] items-center gap-6 p-5 sm:p-7">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex w-2 h-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#2FB67C] opacity-60 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2FB67C]" />
            </span>
            <span className="text-[11px] font-semibold tracking-widest uppercase text-[#8890A3]">
              Live now · Flagship Game
            </span>
          </div>

          <h2
            className="text-2xl sm:text-3xl font-bold mb-2 tracking-tight text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Aviator
          </h2>
          <p className="text-[#8890A3] text-sm mb-4 max-w-sm leading-relaxed">
            Cash out before the plane flies away. One curve, one decision, endless replay.
          </p>

          <div className="flex flex-wrap items-center gap-3 mb-5 text-xs text-[#6E7688] tabular-nums">
            <span>Provider <span className="text-[#C7CCDB] font-medium">Spribe</span></span>
            <span className="w-px h-3 bg-[#242832]" />
            <span>RTP <span className="text-[#C7CCDB] font-medium">97%</span></span>
            <span className="w-px h-3 bg-[#242832]" />
            <span>4,821 <span className="text-[#6E7688]">online</span></span>
          </div>

          <Link
            href="/aviator"
            className="inline-flex items-center justify-center gap-1.5 bg-[#F5A623] hover:bg-[#E0961C] transition-colors text-[#0B0E14] font-semibold px-5 py-2.5 rounded-lg text-sm shadow-md"
          >
            Play Aviator →
          </Link>
        </div>

        <div className="relative w-full md:w-64 h-32 sm:h-36 rounded-lg bg-[#0B0E14] border border-[#242832] flex items-center justify-center overflow-hidden">
          <svg viewBox="0 0 300 160" className="absolute inset-0 w-full h-full">
            <defs>
              <linearGradient id="heroTrail" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="#E5484D" stopOpacity="0" />
                <stop offset="100%" stopColor={phase === "crashed" ? "#E5484D" : "#F5A623"} stopOpacity="0.9" />
              </linearGradient>
            </defs>
            {(() => {
              const cap = 8;
              const t = Math.min(mult / cap, 1);
              const x = 20 + t * 250;
              const y = 140 - Math.pow(t, 0.85) * 110;
              return (
                <>
                  <path
                    d={`M20,140 Q${20 + t * 110},${140 - t * 40} ${x},${y}`}
                    fill="none"
                    stroke="url(#heroTrail)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <text x={x - 10} y={y + 6} fontSize="16" transform={`rotate(${-20 - t * 15} ${x} ${y})`}>
                    ✈️
                  </text>
                </>
              );
            })()}
          </svg>
          <span
            className={`text-3xl sm:text-4xl font-bold tabular-nums z-10 ${
              phase === "crashed" ? "text-[#E5484D]" : "text-[#F5A623]"
            }`}
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {mult.toFixed(2)}x
          </span>
        </div>
      </div>
    </div>
  );
}

function Bit90TradeCard() {
  const [rate, setRate] = useState<number>(124.5);
  const [trend, setTrend] = useState<"up" | "down">("up");

  useEffect(() => {
    const interval = setInterval(() => {
      setRate((prev) => {
        const delta = (Math.random() - 0.48) * 0.8;
        const next = Math.max(100, Math.min(150, prev + delta));
        setTrend(next >= prev ? "up" : "down");
        return next;
      });
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative rounded-xl border border-[#242832] bg-[#12151C] hover:border-[#22D67A]/40 transition-colors overflow-hidden shadow-xl">
      <div className="relative grid md:grid-cols-[1fr_auto] items-center gap-6 p-5 sm:p-7">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex w-2 h-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#22D67A] opacity-60 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22D67A]" />
            </span>
            <span className="text-[11px] font-semibold tracking-widest uppercase text-[#8890A3]">
              Live Trading · Pro Platform
            </span>
          </div>

          <h2
            className="text-2xl sm:text-3xl font-bold mb-2 tracking-tight text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Bit90 Trade
          </h2>
          <p className="text-[#8890A3] text-sm mb-4 max-w-sm leading-relaxed">
            Trade high-frequency markets with real-time price feeds, instant execution, and high returns.
          </p>

          <div className="flex flex-wrap items-center gap-3 mb-5 text-xs text-[#6E7688] tabular-nums">
            <span>Engine <span className="text-[#C7CCDB] font-medium">Bit90 Core</span></span>
            <span className="w-px h-3 bg-[#242832]" />
            <span>Payout <span className="text-[#C7CCDB] font-medium">Up to 99%</span></span>
            <span className="w-px h-3 bg-[#242832]" />
            <span>3,150 <span className="text-[#6E7688]">active traders</span></span>
          </div>

          <Link
            href="/aviator"
            className="inline-flex items-center justify-center gap-1.5 bg-[#22D67A] hover:bg-[#1CBE6B] transition-colors text-[#0A0F1E] font-semibold px-5 py-2.5 rounded-lg text-sm shadow-md"
          >
            Start Trading →
          </Link>
        </div>

        <div className="relative w-full md:w-64 h-32 sm:h-36 rounded-lg bg-[#0B0E14] border border-[#242832] flex items-center justify-center overflow-hidden">
          <svg viewBox="0 0 300 160" className="absolute inset-0 w-full h-full opacity-60">
            <polyline
              fill="none"
              stroke={trend === "up" ? "#22D67A" : "#FF4757"}
              strokeWidth="2.5"
              points="10,130 50,110 90,125 130,85 170,95 210,50 250,65 290,30"
            />
            <polygon
              fill={trend === "up" ? "rgba(34, 214, 122, 0.15)" : "rgba(255, 71, 87, 0.15)"}
              points="10,160 10,130 50,110 90,125 130,85 170,95 210,50 250,65 290,30 290,160"
            />
          </svg>
          <div className="z-10 text-center">
            <span
              className={`text-3xl sm:text-4xl font-bold tabular-nums ${
                trend === "up" ? "text-[#22D67A]" : "text-[#FF4757]"
              }`}
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {rate.toFixed(2)}
            </span>
            <p className="text-[11px] font-semibold text-[#8890A3] mt-1">
              {trend === "up" ? "▲ +2.4%" : "▼ -1.1%"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  useFonts();
  const [query, setQuery] = useState<string>("");

  return (
    <div className="min-h-screen w-full bg-[#0B0E14] text-[#ECEEF3]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        ::-webkit-scrollbar { height: 5px; width: 5px; }
        ::-webkit-scrollbar-thumb { background: #242832; border-radius: 4px; }
      `}</style>

      {/* Top bar */}
      <Header query={query} setQuery={setQuery} />

      <main className="max-w-[1400px] mx-auto px-3 sm:px-5 py-6 sm:py-8 space-y-6">
        {/* Main Products Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <AviatorCard />
          <Bit90TradeCard />
        </div>

        {/* Footer */}
        <footer className="pt-8 mt-6 border-t border-[#191D26]">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] text-[#6E7688] mb-3">
            <a className="hover:text-[#ECEEF3] transition-colors cursor-pointer">About</a>
            <a className="hover:text-[#ECEEF3] transition-colors cursor-pointer">Terms & Conditions</a>
            <a className="hover:text-[#ECEEF3] transition-colors cursor-pointer">Responsible Gaming</a>
            <a className="hover:text-[#ECEEF3] transition-colors cursor-pointer">Support</a>
          </div>
          <p className="text-[11px] text-[#4C5266] leading-relaxed max-w-2xl">
            18+. Play responsibly. Bit90 provides high-frequency gaming & trading interfaces.
            Financial products and games carry risk — trade and bet within your limits.
          </p>
        </footer>
      </main>
    </div>
  );
}