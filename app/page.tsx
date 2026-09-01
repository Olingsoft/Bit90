'use client'

import { useState, useEffect, useRef } from "react";
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
      "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, []);
}

const DISPLAY_FONT = "'Bebas Neue', sans-serif";
const BODY_FONT = "'IBM Plex Sans', sans-serif";

/* ---------- Live wins ticker ---------- */
function WinTicker() {
  const wins = [
    "j.mwangi_ won 4.8x on Aviator",
    "Bit90 trader closed +212 on EUR/JT",
    "kev_bets cashed out 2.1x",
    "Bit90 trader closed +64 on GLD/JT",
    "n.otieno won 9.4x on Aviator",
    "amina_k cashed out 1.6x",
    "Bit90 trader closed +138 on OIL/JT",
  ];
  const loop = [...wins, ...wins];
  return (
    <div className="relative border-y border-[#3A2818] bg-[#1B140C] overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-[#1B140C] to-transparent" />
      <div className="absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-[#1B140C] to-transparent" />
      <div className="flex whitespace-nowrap py-2 win-ticker-track">
        {loop.map((w, i) => (
          <span
            key={i}
            className="mx-6 text-[12px] text-[#9C8A73] flex items-center gap-2 shrink-0"
            style={{ fontFamily: BODY_FONT }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F]" />
            {w}
          </span>
        ))}
      </div>
      <style>{`
        .win-ticker-track { width: max-content; animation: ticker-scroll 32s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .win-ticker-track { animation: none; } }
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

/* ---------- Shared ticket-stub shell ---------- */
function TicketPanel({
  tag,
  tagColor,
  children,
}: {
  tag: string;
  tagColor: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative bg-[#1B140C] border border-[#3A2818]"
      style={{ clipPath: "polygon(0 0, calc(100% - 28px) 0, 100% 28px, 100% 100%, 0 100%)" }}
    >
      <div
        className="absolute top-0 right-0 text-[10px] font-semibold px-2 py-1"
        style={{ fontFamily: BODY_FONT, color: "#120D08", background: tagColor, transform: "translate(0,0)" }}
      >
        {tag}
      </div>
      {children}
    </div>
  );
}

function Perforation() {
  return (
    <div className="relative h-0 mx-5 sm:mx-7">
      <div className="absolute left-[-14px] right-[-14px] top-0 border-t border-dashed border-[#3A2818]" />
      <div className="absolute -left-[19px] -top-2 w-4 h-4 rounded-full bg-[#0B0704]" />
      <div className="absolute -right-[19px] -top-2 w-4 h-4 rounded-full bg-[#0B0704]" />
    </div>
  );
}

/* ---------- Aviator ---------- */
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
    <TicketPanel tag="Flagship" tagColor="#FF5A1F">
      <div className="p-5 sm:p-7">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h2
              className="text-4xl sm:text-5xl leading-none mb-1 text-[#F3E6D6]"
              style={{ fontFamily: DISPLAY_FONT, letterSpacing: "0.5px" }}
            >
              Aviator
            </h2>
            <p className="text-[#9C8A73] text-sm max-w-xs leading-relaxed" style={{ fontFamily: BODY_FONT }}>
              Cash out before the plane leaves. One curve, one call.
            </p>
          </div>

          <div className="relative w-32 h-20 sm:w-36 sm:h-24 rounded-none border border-[#3A2818] bg-[#120D08] flex items-center justify-center overflow-hidden shrink-0">
            <svg viewBox="0 0 300 160" className="absolute inset-0 w-full h-full">
              <defs>
                <linearGradient id="heroTrail" x1="0" y1="1" x2="1" y2="0">
                  <stop offset="0%" stopColor="#B8380F" stopOpacity="0" />
                  <stop offset="100%" stopColor={phase === "crashed" ? "#E5484D" : "#FF5A1F"} stopOpacity="0.9" />
                </linearGradient>
              </defs>
              {(() => {
                const cap = 8;
                const t = Math.min(mult / cap, 1);
                const x = 20 + t * 250;
                const y = 140 - Math.pow(t, 0.85) * 110;
                return (
                  <path
                    d={`M20,140 Q${20 + t * 110},${140 - t * 40} ${x},${y}`}
                    fill="none"
                    stroke="url(#heroTrail)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                );
              })()}
            </svg>
            <span
              className={`z-10 text-2xl sm:text-3xl tabular-nums ${
                phase === "crashed" ? "text-[#E5484D]" : "text-[#FF5A1F]"
              }`}
              style={{ fontFamily: DISPLAY_FONT }}
            >
              {mult.toFixed(2)}x
            </span>
          </div>
        </div>

        <Perforation />

        <div className="flex items-center justify-between pt-5">
          <div className="flex items-center gap-5 text-[12px] text-[#9C8A73]" style={{ fontFamily: BODY_FONT }}>
            <span>Spribe</span>
            <span>97% return</span>
            <span>4,821 playing now</span>
          </div>
          <Link
            href="/aviator"
            className="inline-flex items-center justify-center bg-[#FF5A1F] hover:bg-[#E64F17] transition-colors text-[#120D08] font-semibold px-5 py-2.5 text-sm"
            style={{ fontFamily: BODY_FONT }}
          >
            Play Aviator
          </Link>
        </div>
      </div>
    </TicketPanel>
  );
}

/* ---------- Bit90 Trade ---------- */
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
    <TicketPanel tag="Trade platform" tagColor="#E8A33D">
      <div className="p-5 sm:p-7">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h2
              className="text-4xl sm:text-5xl leading-none mb-1 text-[#F3E6D6]"
              style={{ fontFamily: DISPLAY_FONT, letterSpacing: "0.5px" }}
            >
              Bit90 Trade
            </h2>
            <p className="text-[#9C8A73] text-sm max-w-xs leading-relaxed" style={{ fontFamily: BODY_FONT }}>
              Real-time feeds, instant execution, fast markets.
            </p>
          </div>

          <div className="relative w-32 h-20 sm:w-36 sm:h-24 border border-[#3A2818] bg-[#120D08] flex items-center justify-center overflow-hidden shrink-0">
            <svg viewBox="0 0 300 160" className="absolute inset-0 w-full h-full opacity-70">
              <polyline
                fill="none"
                stroke={trend === "up" ? "#FF5A1F" : "#8A8FA3"}
                strokeWidth="3"
                points="10,130 50,110 90,125 130,85 170,95 210,50 250,65 290,30"
              />
            </svg>
            <div className="z-10 text-center">
              <span
                className={`text-2xl sm:text-3xl tabular-nums ${trend === "up" ? "text-[#FF5A1F]" : "text-[#C7CCDB]"}`}
                style={{ fontFamily: DISPLAY_FONT }}
              >
                {rate.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <Perforation />

        <div className="flex items-center justify-between pt-5">
          <div className="flex items-center gap-5 text-[12px] text-[#9C8A73]" style={{ fontFamily: BODY_FONT }}>
            <span>Bit90 core</span>
            <span>Up to 99% payout</span>
            <span>3,150 trading now</span>
          </div>
          <Link
            href="/trade"
            className="inline-flex items-center justify-center bg-[#E8A33D] hover:bg-[#D5922F] transition-colors text-[#120D08] font-semibold px-5 py-2.5 text-sm"
            style={{ fontFamily: BODY_FONT }}
          >
            Start trading
          </Link>
        </div>
      </div>
    </TicketPanel>
  );
}

export default function HomePage() {
  useFonts();
  const [query, setQuery] = useState<string>("");

  return (
    <div className="min-h-screen w-full bg-[#120D08] text-[#F3E6D6]" style={{ fontFamily: BODY_FONT }}>
      <style>{`
        ::-webkit-scrollbar { height: 5px; width: 5px; }
        ::-webkit-scrollbar-thumb { background: #3A2818; border-radius: 4px; }
        a:focus-visible, button:focus-visible { outline: 2px solid #FF5A1F; outline-offset: 2px; }
      `}</style>

      <Header query={query} setQuery={setQuery} />
      <WinTicker />

      <main className="max-w-[1400px] mx-auto px-3 sm:px-5 py-8 sm:py-10 space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <AviatorCard />
          <Bit90TradeCard />
        </div>

        <footer className="pt-8 mt-6 border-t border-[#3A2818]">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] text-[#9C8A73] mb-3">
            <a className="hover:text-[#F3E6D6] transition-colors cursor-pointer">About</a>
            <a className="hover:text-[#F3E6D6] transition-colors cursor-pointer">Terms & conditions</a>
            <a className="hover:text-[#F3E6D6] transition-colors cursor-pointer">Responsible gaming</a>
            <a className="hover:text-[#F3E6D6] transition-colors cursor-pointer">Support</a>
          </div>
          <p className="text-[11px] text-[#6E5C46] leading-relaxed max-w-2xl">
            18+. Play responsibly. Bit90 provides high-frequency gaming and trading interfaces.
            Financial products and games carry risk — trade and bet within your limits.
          </p>
        </footer>
      </main>
    </div>
  );
}