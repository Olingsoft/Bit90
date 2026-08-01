'use client'

import { useState, useEffect, useMemo } from "react";
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

const CATEGORIES = [
  { id: "all", label: "All Games", icon: "◆" },
  { id: "crash", label: "Crash", icon: "✈" },
  { id: "slots", label: "Slots", icon: "▤" },
  { id: "table", label: "Table", icon: "♠" },
  { id: "live", label: "Live Casino", icon: "●" },
];

const ACCENT = {
  crash: { text: "text-[#F5A623]", bg: "bg-[#F5A623]", grad: "from-[#3a2a0d] to-[#1a1408]" },
  slots: { text: "text-[#8477F2]", bg: "bg-[#8477F2]", grad: "from-[#241a3d] to-[#150f26]" },
  table: { text: "text-[#2FB67C]", bg: "bg-[#2FB67C]", grad: "from-[#0f2b1e] to-[#0a1a13]" },
  live: { text: "text-[#2EA8C9]", bg: "bg-[#2EA8C9]", grad: "from-[#0e2530] to-[#0a171e]" },
};

type GameCategory = "crash" | "slots" | "table" | "live";

interface Game {
  id: number;
  name: string;
  cat: GameCategory;
  icon: string;
  tag: string | null;
  provider: string;
  players: number;
  rtp: string;
}

const GAMES: Game[] = [
  { id: 1, name: "Aviator", cat: "crash", icon: "✈️", tag: "HOT", provider: "Spribe", players: 4821, rtp: "97%" },
  { id: 2, name: "JetX", cat: "crash", icon: "🚀", tag: "HOT", provider: "SmartSoft", players: 2140, rtp: "96.7%" },
  { id: 3, name: "Balloon Rush", cat: "crash", icon: "🎈", tag: null, provider: "Turbo", players: 980, rtp: "96%" },
  { id: 4, name: "Rocket Run", cat: "crash", icon: "🛸", tag: "NEW", provider: "Gamzix", players: 611, rtp: "97.2%" },

  { id: 5, name: "Gates of Fortune", cat: "slots", icon: "🏛️", tag: "HOT", provider: "PlayForge", players: 3320, rtp: "96.5%" },
  { id: 6, name: "Wild Sevens", cat: "slots", icon: "7️⃣", tag: null, provider: "ReelWorks", players: 1544, rtp: "95.8%" },
  { id: 7, name: "Fruit Blast", cat: "slots", icon: "🍒", tag: null, provider: "ReelWorks", players: 902, rtp: "96.1%" },
  { id: 8, name: "Dragon's Hoard", cat: "slots", icon: "🐉", tag: "NEW", provider: "PlayForge", players: 2088, rtp: "97.4%" },
  { id: 9, name: "Diamond Strike", cat: "slots", icon: "💎", tag: null, provider: "Nexus Slots", players: 1233, rtp: "96%" },

  { id: 10, name: "Blackjack Pro", cat: "table", icon: "🂡", tag: null, provider: "TableWorks", players: 1876, rtp: "99.5%" },
  { id: 11, name: "European Roulette", cat: "table", icon: "🎡", tag: null, provider: "TableWorks", players: 2410, rtp: "97.3%" },
  { id: 12, name: "Baccarat", cat: "table", icon: "🃏", tag: null, provider: "TableWorks", players: 754, rtp: "98.9%" },
  { id: 13, name: "Sic Bo", cat: "table", icon: "🎲", tag: "NEW", provider: "TableWorks", players: 402, rtp: "97.2%" },

  { id: 14, name: "Live Roulette", cat: "live", icon: "🎥", tag: "HOT", provider: "LiveDeal", players: 3012, rtp: "97.3%" },
  { id: 15, name: "Live Blackjack", cat: "live", icon: "🎥", tag: null, provider: "LiveDeal", players: 2266, rtp: "99.3%" },
  { id: 16, name: "Crazy Wheel", cat: "live", icon: "🎡", tag: "HOT", provider: "LiveDeal", players: 4103, rtp: "96.5%" },
  { id: 17, name: "Live Baccarat", cat: "live", icon: "🎥", tag: null, provider: "LiveDeal", players: 1188, rtp: "98.8%" },
];

function GameCard({ game }: { game: typeof GAMES[0] }) {
  const a = ACCENT[game.cat];
  return (
    <button
      className="group relative flex flex-col text-left rounded-lg border border-[#242832] bg-[#12151C] hover:border-[#3A4054] hover:bg-[#151920] transition-colors overflow-hidden"
    >
      {/* accent edge, visible on hover only — quiet by default */}
      <span
        className={`absolute left-0 top-0 bottom-0 w-[3px] ${a.bg} opacity-0 group-hover:opacity-100 transition-opacity`}
      />

      <div className="flex items-start gap-2.5 p-3">
        <div
          className={`w-10 h-10 rounded-md flex items-center justify-center text-lg shrink-0 bg-gradient-to-br ${a.grad} border border-white/5`}
        >
          {game.icon}
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="font-semibold text-[13.5px] leading-tight truncate" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {game.name}
          </p>
          <p className="text-[11px] text-[#6E7688] truncate mt-0.5">{game.provider}</p>
        </div>
        {game.tag && (
          <span
            className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded ${a.text} bg-white/5 tracking-wide`}
          >
            {game.tag}
          </span>
        )}
      </div>

      <div className="mt-auto border-t border-[#1D212B] px-3 py-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[11px] text-[#6E7688] tabular-nums">
          <span className="relative flex w-1.5 h-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#2FB67C] opacity-60 animate-ping" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#2FB67C]" />
          </span>
          {game.players.toLocaleString()}
        </span>
        <span className={`text-[11px] font-medium tabular-nums ${a.text}`}>{game.rtp} RTP</span>
      </div>
    </button>
  );
}

function AviatorHero() {
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
    <div className="relative rounded-lg border border-[#242832] bg-[#12151C] overflow-hidden">
      <div className="relative grid md:grid-cols-[1fr_auto] items-center gap-6 p-5 sm:p-7">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex w-1.5 h-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#2FB67C] opacity-60 animate-ping" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#2FB67C]" />
            </span>
            <span className="text-[11px] font-semibold tracking-widest uppercase text-[#8890A3]">
              Live now · Flagship
            </span>
          </div>

          <h1
            className="text-2xl sm:text-4xl font-bold mb-2 tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Aviator
          </h1>
          <p className="text-[#8890A3] text-sm mb-4 max-w-sm leading-relaxed">
            Cash out before the plane flies away. One curve, one decision, endless replay.
          </p>

          <div className="flex items-center gap-4 mb-5 text-xs text-[#6E7688] tabular-nums">
            <span>Provider <span className="text-[#C7CCDB] font-medium">Spribe</span></span>
            <span className="w-px h-3 bg-[#242832]" />
            <span>RTP <span className="text-[#C7CCDB] font-medium">97%</span></span>
            <span className="w-px h-3 bg-[#242832]" />
            <span>4,821 <span className="text-[#6E7688]">online</span></span>
          </div>

          <Link
            href="/aviator"
            className="inline-flex items-center gap-1.5 bg-[#F5A623] hover:bg-[#E0961C] transition-colors text-[#0B0E14] font-semibold px-5 py-2.5 rounded-md text-sm"
          >
            Play Aviator
          </Link>
        </div>

        <div className="relative w-full md:w-64 h-32 sm:h-36 rounded-md bg-[#0B0E14] border border-[#242832] flex items-center justify-center overflow-hidden">
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

export default function CasinoLobby() {
  useFonts();
  const [activeCat, setActiveCat] = useState<string>("all");
  const [query, setQuery] = useState<string>("");

  const filtered = useMemo(() => {
    return GAMES.filter((g) => {
      const matchCat = activeCat === "all" || g.cat === activeCat;
      const matchQuery = g.name.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [activeCat, query]);

  const countFor = (id: string) =>
    id === "all" ? GAMES.length : GAMES.filter((g) => g.cat === id).length;

  return (
    <div className="min-h-screen w-full bg-[#0B0E14] text-[#ECEEF3]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        ::-webkit-scrollbar { height: 5px; width: 5px; }
        ::-webkit-scrollbar-thumb { background: #242832; border-radius: 4px; }
      `}</style>

      {/* Top bar */}
      <Header query={query} setQuery={setQuery} />

      <div className="max-w-[1400px] mx-auto px-3 sm:px-5 py-4 sm:py-6 grid lg:grid-cols-[210px_1fr] gap-5">

        {/* Sidebar — desktop only */}
        <aside className="hidden lg:block">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-[#4C5266] px-3 mb-2">
            Browse
          </p>
          <nav className="space-y-0.5">
            {CATEGORIES.map((c) => {
              const active = activeCat === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveCat(c.id)}
                  className={`w-full flex items-center justify-between gap-2 pl-2.5 pr-3 py-2 rounded-md text-[13px] border-l-2 transition-colors ${
                    active
                      ? "bg-[#151920] text-[#ECEEF3] border-[#F5A623]"
                      : "text-[#8890A3] border-transparent hover:text-[#ECEEF3] hover:bg-[#12151C]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-[13px] w-4 text-center">{c.icon}</span>
                    {c.label}
                  </span>
                  <span className="text-[11px] text-[#4C5266] tabular-nums">{countFor(c.id)}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="space-y-5 min-w-0">
          <AviatorHero />

          {/* Category tabs — mobile / tablet */}
          <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCat(c.id)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium border transition-colors ${
                  activeCat === c.id
                    ? "bg-[#F5A623] text-[#0B0E14] border-[#F5A623]"
                    : "bg-[#12151C] text-[#8890A3] border-[#242832] hover:border-[#3A4054]"
                }`}
              >
                <span>{c.icon}</span>
                {c.label}
              </button>
            ))}
          </div>

          {/* Game grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-[13px] tracking-wide uppercase text-[#8890A3]">
                {CATEGORIES.find((c) => c.id === activeCat)?.label}
              </h2>
              <span className="text-[12px] text-[#4C5266] tabular-nums">{filtered.length} games</span>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16 text-[#6E7688] text-sm border border-dashed border-[#242832] rounded-lg">
                No games match &ldquo;{query}&rdquo;.
              </div>
            ) : (
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
                {filtered.map((g) => (
                  <GameCard key={g.id} game={g} />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="pt-6 mt-4 border-t border-[#191D26]">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-[#6E7688] mb-3">
              <a className="hover:text-[#ECEEF3] transition-colors">About</a>
              <a className="hover:text-[#ECEEF3] transition-colors">Terms</a>
              <a className="hover:text-[#ECEEF3] transition-colors">Responsible Gambling</a>
              <a className="hover:text-[#ECEEF3] transition-colors">Support</a>
            </div>
            <p className="text-[11px] text-[#4C5266] leading-relaxed max-w-2xl">
              18+. Play responsibly. LUXBET is a demo interface and does not process real-money wagers.
              Gambling involves risk — set limits and seek help if it stops being fun.
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}