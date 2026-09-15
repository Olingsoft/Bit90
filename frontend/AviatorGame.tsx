"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Header from "@/components/Header";
import { getToken, type User } from "@/lib/auth";
import { getSocket } from "./socketClient";
import { useAuth } from "@/components/AuthProvider";
import { API_URL } from "@/lib/api";
import AviatorLiveBets, { type UserBetRecord, type LiveBetItem } from "./AviatorLiveBets";

const FONT_LINK_ID = "aviator-fonts";

function useFonts() {
  useEffect(() => {
    if (document.getElementById(FONT_LINK_ID)) return;
    const link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap";
    document.head.appendChild(link);
  }, []);
}

function colorForMultiplier(m: number) {
  if (m >= 10) return { bg: "bg-[#A855F7]", text: "text-[#C084FC]", stroke: "#A855F7" };
  if (m >= 2) return { bg: "bg-[#FF5A1F]", text: "text-[#FF5A1F]", stroke: "#FF5A1F" };
  return { bg: "bg-[#E8A33D]", text: "text-[#E8A33D]", stroke: "#E8A33D" };
}

function AviatorPlaneIcon({
  color = "#E52E2E",
  isCrashed = false,
  isWaiting = false,
}: {
  color?: string;
  isCrashed?: boolean;
  isWaiting?: boolean;
}) {
  const bodyColor = isCrashed ? "#FF4757" : color;

  return (
    <g
      transform="scale(0.82)"
      className={isCrashed ? "aviator-plane-crash" : ""}
    >
      {/* Jet Exhaust & Afterburner Flame (active when flying or crashed) */}
      {!isWaiting && (
        <g className="aviator-thruster-flame">
          {/* Outer heat distortion & flame aura */}
          <ellipse cx="-16" cy="0" rx="14" ry="5" fill="url(#aviatorThrusterGlow)" opacity="0.6" />

          {/* Outer supersonic shock diamond flame */}
          <path
            d="M 0 -3.5 Q -14 -4.5 -26 0 Q -14 4.5 0 3.5 Z"
            fill="url(#aviatorThrusterGlow)"
          />
          {/* Inner core white-hot plasma flame */}
          <path
            d="M 0 -2 Q -8 -2.5 -16 0 Q -8 2.5 0 2 Z"
            fill="#FFF5E0"
          />

          {/* Micro thrust sparks trailing backwards onto curve */}
          <circle cx="-28" cy="-1.5" r="1" fill="#FFE08A" opacity="0.8" />
          <circle cx="-33" cy="1" r="0.8" fill="#FF8A00" opacity="0.7" />
          <circle cx="-38" cy="-0.5" r="0.6" fill="#FF4757" opacity="0.6" />
        </g>
      )}

      {/* Titanium Thruster Exhaust Nozzle (anchor at local x = 0, y = 0) */}
      <path
        d="M -2 -4 L 2 -3.2 L 2 3.2 L -2 4 Z"
        fill="#23272F"
        stroke="#475569"
        strokeWidth="0.5"
      />
      <line x1="0" y1="-3.5" x2="0" y2="3.5" stroke="#FFE08A" strokeWidth="0.8" opacity="0.7" />

      {/* Main Fuselage Aerodynamic Body (extends forward x = 0 to 44) */}
      <path
        d="M 0 -3.5 C 6 -5.5, 20 -6, 36 -2.5 C 40 -1.8, 43 -0.8, 44 0 C 43 0.8, 40 1.8, 36 2.5 C 20 6, 6 5.5, 0 3.5 Z"
        fill="url(#aviatorBodyGrad)"
      />

      {/* Fuselage Top Highlight / Glass Sheen */}
      <path
        d="M 2 -2.5 C 10 -4.5, 26 -4.2, 38 -1.2 C 28 -2.8, 12 -3.2, 2 -2.5 Z"
        fill="#FFFFFF"
        opacity="0.4"
      />

      {/* Fuselage Bottom Aerodynamic Shadow */}
      <path
        d="M 1 2.2 C 12 4.6, 28 4.2, 38 1.2 C 28 2.8, 12 3.2, 1 2.2 Z"
        fill="#000000"
        opacity="0.3"
      />

      {/* Racing Gold Speed Stripe */}
      <path
        d="M 3 -0.5 L 36 -0.5 L 34 0.7 L 3 0.7 Z"
        fill="url(#aviatorGoldStripe)"
      />

      {/* Far / Bottom Wing */}
      <path
        d="M 12 3.2 L 17 18 L 24 16.5 L 21 3 Z"
        fill={bodyColor}
        filter="brightness(0.72)"
      />
      {/* Far Wingtip Strobe (Red) */}
      <circle cx="20.5" cy="17.2" r="1.2" fill="#FF4757" />

      {/* Near / Top Wing */}
      <path
        d="M 12 -3.2 L 18 -19 L 26 -17.5 L 22 -3 Z"
        fill="url(#aviatorBodyGrad)"
      />
      {/* Near Wing Gold Accent Stripe */}
      <path
        d="M 15 -4.5 L 19 -16 L 22 -15 L 18 -4 Z"
        fill="url(#aviatorGoldStripe)"
      />
      {/* Near Wingtip Navigation Light (Green/Cyan Strobe) */}
      <circle cx="22" cy="-18.2" r="1.3" fill="#22C55E" />
      <circle cx="22" cy="-18.2" r="2.2" fill="#22C55E" opacity="0.4" />

      {/* Vertical Stabilizer (Tail Fin) */}
      <path
        d="M 2 -3 L -3 -15 L 4 -14 L 8 -3 Z"
        fill={bodyColor}
      />
      {/* Tail Fin Gold Chevron */}
      <path
        d="M 2 -4 L -1 -12 L 2 -11.5 L 5 -4 Z"
        fill="url(#aviatorGoldStripe)"
      />

      {/* Cockpit Canopy */}
      <path
        d="M 17 -2.8 C 22 -6.5, 30 -6, 35 -1.5 C 30 -0.2, 23 -0.2, 17 -1.2 Z"
        fill="url(#aviatorCanopyGlow)"
        stroke="rgba(255,255,255,0.75)"
        strokeWidth="0.5"
      />
      {/* Canopy Glint */}
      <path
        d="M 21 -4 C 24 -5.5, 29 -5, 32 -2.5 C 28 -3.5, 24 -3.8, 21 -4 Z"
        fill="#FFFFFF"
        opacity="0.85"
      />

      {/* Gold Nose Cone */}
      <path
        d="M 42 2 C 44.5 1.2, 46 0.4, 46 0 C 46 -0.4, 44.5 -1.2, 42 -2 Z"
        fill="url(#aviatorGoldStripe)"
      />

      {/* High-speed Propeller / Turbofan Spinner */}
      {!isCrashed && (
        <g transform="translate(45.5, 0)" className="aviator-propeller">
          <ellipse cx="0" cy="0" rx="1.5" ry="14" fill="rgba(255, 255, 255, 0.85)" />
          <ellipse cx="0" cy="0" rx="14" ry="1.5" fill="rgba(255, 255, 255, 0.35)" />
          <circle cx="0" cy="0" r="2" fill="#FFE08A" />
        </g>
      )}

      {/* Landing Gear / Skids (visible resting in waiting state) */}
      {isWaiting && (
        <g opacity="0.9">
          <line x1="32" y1="2.5" x2="33" y2="7.5" stroke="#94A3B8" strokeWidth="1.2" />
          <line x1="29" y1="7.5" x2="36" y2="7.5" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="12" y1="3.5" x2="11" y2="7.5" stroke="#94A3B8" strokeWidth="1.2" />
          <line x1="7" y1="7.5" x2="15" y2="7.5" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      )}
    </g>
  );
}

function useSmoothMultiplier(multiplier: number, phase: Phase) {
  const [smooth, setSmooth] = useState(multiplier);
  const targetRef = useRef(multiplier);
  const currentRef = useRef(multiplier);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    targetRef.current = multiplier;
  }, [multiplier]);

  useEffect(() => {
    if (phase === "waiting") {
      currentRef.current = 1.0;
      targetRef.current = 1.0;
      setSmooth(1.0);
    } else if (phase === "crashed") {
      currentRef.current = multiplier;
      targetRef.current = multiplier;
      setSmooth(multiplier);
    }
  }, [phase, multiplier]);

  useEffect(() => {
    if (phase !== "flying") return;

    let running = true;
    let lastTime = performance.now();

    const update = (now: number) => {
      if (!running) return;
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const target = targetRef.current;
      const current = currentRef.current;
      const diff = target - current;

      if (diff > 0.0005) {
        // Continuous smooth 60fps acceleration towards target
        const step = Math.max(diff * 14 * dt, 0.003);
        currentRef.current = Math.min(current + step, target);
        setSmooth(currentRef.current);
      } else if (diff < -0.0005) {
        currentRef.current = target;
        setSmooth(target);
      }

      animFrameRef.current = requestAnimationFrame(update);
    };

    animFrameRef.current = requestAnimationFrame(update);
    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [phase]);

  return phase === "flying" ? smooth : multiplier;
}

function AviatorStageBackground({
  phase,
  multiplier,
  crashPoint,
}: {
  phase: Phase;
  multiplier: number;
  crashPoint: number | null;
}) {
  const isWaiting = phase === "waiting";
  const isCrashed = phase === "crashed";
  const activeMultiplier = isWaiting ? 1.0 : isCrashed ? (crashPoint ?? multiplier) : multiplier;
  const accent = isCrashed ? "#FF4757" : colorForMultiplier(activeMultiplier).stroke;

  // Gentle aerodynamic cruising bob for authentic flight feel
  const [cruiseOffset, setCruiseOffset] = useState({ y: 0, tilt: 0 });

  useEffect(() => {
    if (phase !== "flying") {
      setCruiseOffset({ y: 0, tilt: 0 });
      return;
    }

    let animId: number;
    const updateBob = () => {
      const t = Date.now() / 320;
      setCruiseOffset({
        y: Math.sin(t) * 3.5,
        tilt: Math.sin(t * 0.85) * 1.8,
      });
      animId = requestAnimationFrame(updateBob);
    };
    animId = requestAnimationFrame(updateBob);
    return () => cancelAnimationFrame(animId);
  }, [phase]);

  // Smooth logarithmic progression that scales nicely from 1.00x through 100x+
  // At 1.00x: progress = 0
  // At 2.00x: progress ≈ 0.35
  // At 5.00x: progress ≈ 0.56
  // At 10.00x: progress ≈ 0.65
  // At 50.00x: progress ≈ 0.75
  // At 100.00x+: progress approaches ~0.84 gracefully without freezing or jumping off screen
  const logVal = Math.max(Math.log(Math.max(activeMultiplier, 1.0)), 0);
  const progress = isWaiting ? 0 : logVal / (logVal + 1.25);

  const startX = 42;
  const startY = 234;
  const endX = startX + progress * 280;
  const endY = isWaiting
    ? startY
    : startY - Math.pow(progress, 0.86) * 155 + cruiseOffset.y;

  // Control point for sweeping aerodynamic ascent curve
  const controlX = startX + (endX - startX) * 0.52;
  const controlY = startY - (startY - endY) * 0.16;

  // Exact curve tangent vector and pitch angle
  const dx = Math.max(endX - controlX, 1);
  const dy = endY - controlY;
  const rawTangent = (Math.atan2(dy, dx) * 180) / Math.PI;

  // In waiting mode: level on the runway (-1 deg). In flight: exact curve tangent + gentle aerodynamic bob
  const planeAngle = isWaiting ? -1 : rawTangent + cruiseOffset.tilt;

  const curvePath = `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
  const areaPath = `${curvePath} L ${endX} ${startY} L ${startX} ${startY} Z`;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 115%, rgba(180, 40, 20, 0.45) 0%, rgba(40, 8, 8, 0.35) 35%, transparent 68%), radial-gradient(circle at 50% 50%, rgba(255, 120, 40, 0.08) 0%, transparent 55%), linear-gradient(180deg, #070b14 0%, #0c1220 45%, #140a0a 100%)",
        }}
      />

      <div
        className={`aviator-sun ${isWaiting ? "aviator-sun-waiting" : isCrashed ? "aviator-sun-crashed" : ""}`}
      />

      <svg
        className={`aviator-rays ${isWaiting ? "aviator-rays-fast" : isCrashed ? "aviator-rays-crashed" : ""}`}
        viewBox="0 0 400 400"
        aria-hidden
      >
        {Array.from({ length: 24 }).map((_, index) => {
          const angle = (index / 24) * 360;
          return (
            <line
              key={angle}
              x1="200"
              y1="200"
              x2="200"
              y2="28"
              stroke={isCrashed ? "rgba(255,71,87,0.18)" : "rgba(255,176,32,0.14)"}
              strokeWidth="1.5"
              transform={`rotate(${angle} 200 200)`}
            />
          );
        })}
      </svg>

      <div className="aviator-stars" aria-hidden />

      <svg
        viewBox="0 0 400 280"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id="aviatorBodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={isCrashed ? "#FF4757" : accent} stopOpacity="1" />
            <stop offset="65%" stopColor={isCrashed ? "#E52E2E" : accent} stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFE08A" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="aviatorGoldStripe" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFB800" />
            <stop offset="50%" stopColor="#FFE580" />
            <stop offset="100%" stopColor="#FF9900" />
          </linearGradient>
          <linearGradient id="aviatorCurveStroke" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF4757" stopOpacity="0.25" />
            <stop offset="45%" stopColor={accent} stopOpacity="0.85" />
            <stop offset="100%" stopColor="#FFE08A" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="aviatorCurveFill" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.04" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.25" />
          </linearGradient>
          <linearGradient id="aviatorCanopyGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A5F3FC" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#0891B2" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="aviatorThrusterGlow" x1="100%" y1="50%" x2="0%" y2="50%">
            <stop offset="0%" stopColor="#FFF3D6" stopOpacity="1" />
            <stop offset="35%" stopColor="#FFB020" stopOpacity="0.95" />
            <stop offset="75%" stopColor="#FF4757" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FF4757" stopOpacity="0" />
          </linearGradient>
          <filter id="aviatorGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <line x1="0" y1="238" x2="400" y2="238" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
        {/* Runway launch pad marking */}
        <line x1="30" y1="238" x2="70" y2="238" stroke="rgba(255,176,32,0.3)" strokeWidth="2" />

        {!isWaiting && (
          <>
            <path
              d={areaPath}
              fill="url(#aviatorCurveFill)"
              className={isCrashed ? "aviator-curve-crash" : ""}
            />
            <path
              d={curvePath}
              fill="none"
              stroke="url(#aviatorCurveStroke)"
              strokeWidth="4"
              strokeLinecap="round"
              filter="url(#aviatorGlow)"
              className={isCrashed ? "aviator-curve-crash" : "aviator-curve-live"}
            />
            {/* Plane positioned at the leading tip of the curve, rotated tangent to the flight path */}
            <g transform={`translate(${endX}, ${endY}) rotate(${planeAngle})`}>
              <AviatorPlaneIcon color={accent} isCrashed={isCrashed} isWaiting={false} />
            </g>
          </>
        )}

        {isWaiting && (
          /* Waiting craft rests cleanly on the launch pad at the start of the runway */
          <g transform={`translate(${startX}, ${startY - 2}) rotate(-1)`}>
            <AviatorPlaneIcon color="#FFB020" isCrashed={false} isWaiting={true} />
          </g>
        )}
      </svg>

      {isCrashed && <div className="aviator-crash-flash" aria-hidden />}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#070b14] to-transparent" />
    </div>
  );
}

type Phase = "waiting" | "flying" | "crashed";

interface LiveState {
  phase: Phase;
  countdown: number;
  multiplier: number;
  roundId: string | null;
  crashPoint: number | null;
  hash: string | null;
  startedAt: string | null;
  crashedAt: string | null;
}

interface HistoryItem {
  roundId?: string
  id?: string
  crashPoint: number
  endedAt?: string
  crashedAt?: string
  createdAt?: string
  serverSeed?: string
  hash?: string
}

const HISTORY_CACHE_KEY = "bit90:aviator-crash-history"
const HISTORY_LIMIT = 50

function historyTime(item: HistoryItem) {
  return item.endedAt || item.crashedAt || item.createdAt || ""
}

function mapHistoryItems(rounds: HistoryItem[]) {
  return rounds
    .filter((item) => Number.isFinite(Number(item?.crashPoint)) && Number(item.crashPoint) > 0)
    .sort((a, b) => {
      const aTime = historyTime(a)
      const bTime = historyTime(b)
      if (aTime && bTime) return aTime > bTime ? -1 : aTime < bTime ? 1 : 0
      return 0
    })
    .slice(0, HISTORY_LIMIT)
    .map((item) => ({
      crashPoint: Number(Number(item.crashPoint).toFixed(2)),
      roundId: String(item.roundId || item.id || `${item.crashPoint}-${historyTime(item)}`),
    }))
}

function readCachedHistory() {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(HISTORY_CACHE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as { crashPoint: number; roundId: string }[]
    return Array.isArray(parsed) ? parsed.filter((item) => Number.isFinite(item.crashPoint)) : []
  } catch {
    return []
  }
}

function writeCachedHistory(items: { crashPoint: number; roundId: string }[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(HISTORY_CACHE_KEY, JSON.stringify(items.slice(0, HISTORY_LIMIT)))
  } catch {
    // ignore quota / private mode
  }
}

export default function AviatorGame() {
  useFonts();
  const { user, token, login } = useAuth();
  const [query, setQuery] = useState("");
  const [phase, setPhase] = useState<Phase>("waiting");
  const [multiplier, setMultiplier] = useState<number>(1.0);
  const [crashPoint, setCrashPoint] = useState<number | null>(null);
  const [history, setHistory] = useState<{ crashPoint: number; roundId: string }[]>(() => readCachedHistory());
  const [countdown, setCountdown] = useState<number>(5);
  const [shake, setShake] = useState<boolean>(false);
  const [roundId, setRoundId] = useState<string | null>(null);
  const [userBets, setUserBets] = useState<UserBetRecord[]>([]);
  const [socketBet, setSocketBet] = useState<LiveBetItem | undefined>();
  const [socketCashout, setSocketCashout] = useState<{ roundId?: string; multiplier: number; payout: number; panelIndex: number; username?: string } | undefined>();

  useEffect(() => {
    const socket = getSocket();

    const handleWaiting = (value: Partial<LiveState>) => {
      setPhase("waiting");
      if (typeof value.countdown === "number") setCountdown(value.countdown);
      setMultiplier(1.0);
      setCrashPoint(null);
      if (value.roundId) setRoundId(value.roundId);
    };

    const handleCountdown = (value: { roundId?: string; countdown: number }) => {
      setPhase("waiting");
      setCountdown(value.countdown);
      if (value.roundId) setRoundId(value.roundId);
    };

    const handleStarted = (value: Partial<LiveState>) => {
      setPhase("flying");
      setMultiplier(value.multiplier ?? 1.0);
      if (value.crashPoint) setCrashPoint(value.crashPoint);
      if (value.roundId) setRoundId(value.roundId);
    };

    const handleMultiplier = (value: Partial<LiveState>) => {
      setPhase("flying");
      setMultiplier(value.multiplier ?? 1.0);
      if (value.roundId) setRoundId(value.roundId);
    };

    const handleCrashed = (value: Partial<LiveState>) => {
      setPhase("crashed");
      setMultiplier(value.crashPoint ?? 1.0);
      setCrashPoint(value.crashPoint ?? null);
      if (value.roundId) setRoundId(value.roundId);
      setShake(true);
      setTimeout(() => setShake(false), 400);
    };

    const handleState = (value: Partial<LiveState>) => {
      if (value.phase) setPhase(value.phase as Phase);
      if (typeof value.countdown === "number") setCountdown(value.countdown);
      if (typeof value.multiplier === "number") setMultiplier(value.multiplier);
      if (typeof value.crashPoint === "number") setCrashPoint(value.crashPoint);
      if (value.roundId) setRoundId(value.roundId);
    };

    const handleBet = (data: any) => {
      setSocketBet({
        id: `socket-bet-${Date.now()}-${Math.random()}`,
        username: data.username || "0712***21",
        avatarColor: "from-[#3B82F6] to-[#60A5FA]",
        amount: data.amount,
        cashedOut: false,
        isUser: false,
        roundId: data.roundId,
      });
    };

    const handleCashout = (data: any) => {
      setSocketCashout(data);
    };

    socket.on("aviator:state", handleState);
    socket.on("aviator:waiting", handleWaiting);
    socket.on("aviator:countdown", handleCountdown);
    socket.on("aviator:started", handleStarted);
    socket.on("aviator:multiplier", handleMultiplier);
    socket.on("aviator:crashed", handleCrashed);
    socket.on("aviator:bet", handleBet);
    socket.on("aviator:cashout", handleCashout);

    return () => {
      socket.off("aviator:state", handleState);
      socket.off("aviator:waiting", handleWaiting);
      socket.off("aviator:countdown", handleCountdown);
      socket.off("aviator:started", handleStarted);
      socket.off("aviator:multiplier", handleMultiplier);
      socket.off("aviator:crashed", handleCrashed);
      socket.off("aviator:bet", handleBet);
      socket.off("aviator:cashout", handleCashout);
    };
  }, []);

  useEffect(() => {
    if (phase === "crashed") {
      setUserBets((prev) =>
        prev.map((b) =>
          b.status === "placed" ? { ...b, status: "crashed" } : b
        )
      );
    }
  }, [phase]);

  const handleUserBetPlaced = useCallback((record: UserBetRecord) => {
    setUserBets((prev) => [record, ...prev]);
  }, []);

  const handleUserCashedOut = useCallback(
    (targetRoundId: string, panelIndex: number, exitMultiplier: number, payoutAmount: number) => {
      setUserBets((prev) =>
        prev.map((b) =>
          b.panelIndex === panelIndex && (b.roundId === targetRoundId || !targetRoundId || b.status === "placed")
            ? { ...b, cashedOutAt: exitMultiplier, payout: payoutAmount, status: "cashed_out" }
            : b
        )
      );
    },
    []
  );

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await fetch(`${API_URL}aviator/history`, { cache: "no-store" });
        if (!response.ok) throw new Error(`History request failed: ${response.status}`);
        const rounds = (await response.json()) as HistoryItem[];
        const items = mapHistoryItems(Array.isArray(rounds) ? rounds : []);
        if (items.length > 0) {
          setHistory(items);
          writeCachedHistory(items);
        }
      } catch (error) {
        console.error("Failed to load Aviator history", error);
      }
    };

    loadHistory();
  }, []);

  useEffect(() => {
    const socket = getSocket();

    const handleHistoryEvent = (value: HistoryItem) => {
      if (typeof value.crashPoint !== "number") return;
      const nextItem = {
        crashPoint: Number(value.crashPoint.toFixed(2)),
        roundId: String(value.roundId || value.id || `${value.crashPoint}-${historyTime(value)}-${Date.now()}`),
      };
      setHistory((prev) => {
        const withoutDup = prev.filter((item) => item.roundId !== nextItem.roundId);
        const next = [nextItem, ...withoutDup].slice(0, HISTORY_LIMIT);
        writeCachedHistory(next);
        return next;
      });
    };

    socket.on("aviator:history", handleHistoryEvent);
    return () => {
      socket.off("aviator:history", handleHistoryEvent);
    };
  }, []);

  const smoothMultiplier = useSmoothMultiplier(multiplier, phase);
  const mColor = colorForMultiplier(phase === "crashed" ? (crashPoint ?? multiplier) : smoothMultiplier);

  return (
    <div className="min-h-screen w-full bg-[#120D08] text-[#F3E6D6]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
        .shake-anim { animation: shake 0.35s ease-in-out; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.65} }
        .blink { animation: blink 1s ease-in-out infinite; }
        @keyframes rise { from { transform: translateY(6px) } to { transform: translateY(0) } }
        .rise { animation: rise 0.25s ease-out; }
        @keyframes aviator-spin { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }
        @keyframes aviator-propeller-spin { 0%{ transform: scaleY(1); opacity: 0.9; } 50%{ transform: scaleY(-0.35); opacity: 0.4; } 100%{ transform: scaleY(1); opacity: 0.9; } }
        .aviator-propeller { animation: aviator-propeller-spin 0.08s linear infinite; transform-origin: center; }
        @keyframes aviator-thruster-flicker { 0%,100%{ transform: scaleX(1) scaleY(1); opacity: 0.95; } 50%{ transform: scaleX(1.3) scaleY(0.85); opacity: 0.7; } }
        .aviator-thruster-flame { animation: aviator-thruster-flicker 0.1s ease-in-out infinite; transform-origin: 0px 0px; }
        .aviator-sun { position: absolute; bottom: -80px; left: 50%; width: 360px; height: 360px; transform: translateX(-50%); border-radius: 50%; background: radial-gradient(circle, rgba(255,176,32,0.25) 0%, rgba(255,71,87,0.12) 45%, transparent 70%); pointer-events: none; }
        .aviator-sun-waiting { background: radial-gradient(circle, rgba(255,176,32,0.35) 0%, rgba(255,176,32,0.15) 50%, transparent 70%); }
        .aviator-sun-crashed { background: radial-gradient(circle, rgba(255,71,87,0.45) 0%, rgba(255,71,87,0.2) 50%, transparent 70%); }
        .aviator-rays { position: absolute; top: 50%; left: 50%; width: 600px; height: 600px; transform: translate(-50%, -50%); pointer-events: none; animation: aviator-spin 60s linear infinite; }
        .aviator-rays-fast { animation-duration: 20s; }
        .aviator-rays-crashed { opacity: 0.4; }
        .aviator-crash-flash { position: absolute; inset: 0; background: rgba(255,71,87,0.28); pointer-events: none; animation: blink 0.4s ease-out 2; }

        /* Authentic Spribe Flew-Away Rocket Animation */
        @keyframes aviator-plane-flew-away {
          0% {
            transform: translate(0, 0) scale(1) rotate(0deg);
            opacity: 1;
          }
          20% {
            transform: translate(50px, -18px) scale(1.05) rotate(-6deg);
            opacity: 0.95;
          }
          100% {
            transform: translate(450px, -190px) scale(0.3) rotate(-25deg);
            opacity: 0;
          }
        }
        .aviator-plane-crash {
          animation: aviator-plane-flew-away 0.75s cubic-bezier(0.2, 0.85, 0.25, 1) forwards;
          transform-origin: 22px 0px;
        }
        .aviator-plane-idle {
          animation: rise 0.5s ease-out;
        }

        /* Curve crash dissolve */
        @keyframes aviator-curve-dissolve {
          0% { opacity: 1; filter: drop-shadow(0 0 12px #FF4757); }
          40% { opacity: 0.6; }
          100% { opacity: 0; }
        }
        .aviator-curve-crash {
          animation: aviator-curve-dissolve 0.8s ease-out forwards;
        }
        .aviator-curve-live {
          transition: stroke 0.2s ease;
        }

        /* Flew away bold banner badge */
        @keyframes aviator-flew-away-badge {
          0% { transform: scale(0.75); opacity: 0; }
          50% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .aviator-flew-away-badge {
          animation: aviator-flew-away-badge 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>

      <Header query={query} setQuery={setQuery} />

      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-4 space-y-3">
        {/* TOP MULTIPLIER HISTORY BAR */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1.5 sm:py-2 px-3 bg-[#1B140C] rounded-xl border border-[#3A2818] scrollbar-none text-xs shadow-md">
          <span className="text-[#9C8A73] font-bold text-[10px] sm:text-xs uppercase tracking-wider pr-1 shrink-0 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F]" />
            History
          </span>
          {history.map((h) => {
            const color = colorForMultiplier(h.crashPoint);
            return (
              <span
                key={h.roundId}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-extrabold whitespace-nowrap bg-[#120D08] border border-[#3A2818] shadow-sm ${color.text}`}
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {h.crashPoint.toFixed(2)}x
              </span>
            );
          })}
        </div>

        {/* MAIN GAME LAYOUT (SPRIBE AVIATOR STYLE) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-start">
          {/* LEFT SIDEBAR: LIVE BETS / MY BETS / TOP BETS */}
          <div className="lg:col-span-4 xl:col-span-4 order-2 lg:order-1 h-[480px] sm:h-[560px] lg:h-[620px]">
            <AviatorLiveBets
              phase={phase}
              multiplier={smoothMultiplier}
              roundId={roundId}
              user={user}
              userBets={userBets}
              onSocketBet={socketBet}
              onSocketCashout={socketCashout}
            />
          </div>

          {/* RIGHT CENTER: GAME STAGE & DUAL CONTROL PANELS */}
          <div className="lg:col-span-8 xl:col-span-8 order-1 lg:order-2 space-y-3">
            {/* STAGE CONTAINER */}
            <div className="relative bg-[#120D08] border border-[#3A2818] rounded-2xl overflow-hidden shadow-2xl min-h-[320px] sm:min-h-[400px] lg:min-h-[440px] flex flex-col justify-between p-3 sm:p-5">
              <div className="flex justify-between items-center z-10">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#E5484D] animate-pulse" />
                  <span
                    className="text-xs sm:text-sm font-bold tracking-wider text-[#F3E6D6] uppercase"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Aviator Live
                  </span>
                </div>
              </div>

              {/* STAGE ANIMATION CANVAS */}
              <div className={`absolute inset-0 overflow-hidden ${shake ? "shake-anim" : ""}`}>
                <AviatorStageBackground phase={phase} multiplier={smoothMultiplier} crashPoint={crashPoint} />
              </div>

              {/* MULTIPLIER / COUNTDOWN OVERLAY */}
              <div className="relative z-10 flex-1 flex items-center justify-center pointer-events-none">
                {phase === "waiting" ? (
                  <div className="text-center rise w-full">
                    <p className="text-[#9C8A73] text-xs sm:text-sm tracking-widest uppercase mb-2 font-semibold">
                      Next round in
                    </p>
                    <h1
                      className="text-5xl sm:text-7xl font-bold text-[#E8A33D] tabular-nums blink leading-none"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {countdown}s
                    </h1>
                  </div>
                ) : phase === "crashed" ? (
                  <div className="text-center rise aviator-flew-away-badge">
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#E5484D]/25 border border-[#E5484D]/50 text-[#FF4757] font-extrabold text-xs sm:text-sm uppercase tracking-wider mb-2 shadow-lg shadow-[#E5484D]/25">
                      <span className="w-2 h-2 rounded-full bg-[#FF4757] animate-ping" />
                      Flew Away!
                    </div>
                    <h1
                      className="text-6xl sm:text-8xl font-black tabular-nums text-[#FF4757] drop-shadow-[0_0_30px_rgba(255,71,87,0.7)]"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {(crashPoint ?? multiplier).toFixed(2)}x
                    </h1>
                  </div>
                ) : (
                  <div className="text-center rise">
                    <h1
                      className={`text-6xl sm:text-8xl font-black tabular-nums ${mColor.text} drop-shadow-[0_0_20px_rgba(255,90,31,0.35)]`}
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {smoothMultiplier.toFixed(2)}x
                    </h1>
                    <p className="mt-2 text-xs sm:text-sm tracking-widest uppercase text-[#9C8A73] font-bold flex items-center justify-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                      In flight
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* DUAL BET CONTROL PANELS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
              <AviatorBetControlPanel
                panelIndex={1}
                phase={phase}
                roundId={roundId}
                multiplier={smoothMultiplier}
                user={user}
                token={token}
                login={login}
                defaultAmount={100}
                onBetPlaced={handleUserBetPlaced}
                onCashedOut={handleUserCashedOut}
              />
              <AviatorBetControlPanel
                panelIndex={2}
                phase={phase}
                roundId={roundId}
                multiplier={smoothMultiplier}
                user={user}
                token={token}
                login={login}
                defaultAmount={200}
                onBetPlaced={handleUserBetPlaced}
                onCashedOut={handleUserCashedOut}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

interface BetPanelProps {
  panelIndex: number;
  phase: Phase;
  roundId: string | null;
  multiplier: number;
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  defaultAmount?: number;
  onBetPlaced?: (record: UserBetRecord) => void;
  onCashedOut?: (roundId: string, panelIndex: number, exitMultiplier: number, payoutAmount: number) => void;
}

function AviatorBetControlPanel({
  panelIndex,
  phase,
  roundId,
  multiplier,
  user,
  token,
  login,
  defaultAmount = 100,
  onBetPlaced,
  onCashedOut,
}: BetPanelProps) {
  const [betAmount, setBetAmount] = useState<number>(defaultAmount);
  const [placedRoundId, setPlacedRoundId] = useState<string | null>(null);
  const [cashedOutAt, setCashedOutAt] = useState<number | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [feedback, setFeedback] = useState<string>("");

  const isBetPlaced = Boolean(
    placedRoundId && roundId && placedRoundId === roundId
  );

  useEffect(() => {
    if (phase === "waiting" && roundId && roundId !== placedRoundId) {
      setCashedOutAt(null);
      setFeedback("");
    }
  }, [phase, roundId, placedRoundId]);

  const handleBet = useCallback(async () => {
    if (phase !== "waiting" || isBetPlaced || isBusy) return;
    const activeToken = token || getToken();
    if (!activeToken) {
      setFeedback("Please log in to place a bet.");
      return;
    }

    if (user && typeof user.balance === "number" && user.balance < betAmount) {
      setFeedback(`Insufficient balance. You need KSh ${betAmount}.`);
      return;
    }

    setIsBusy(true);
    setFeedback("");
    try {
      const response = await fetch(`${API_URL}aviator/bet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify({ amount: betAmount, roundId, panelIndex }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to place bet");

      const targetRoundId = data.roundId || roundId || `round-${Date.now()}`;
      setPlacedRoundId(targetRoundId);

      const nextBalance =
        typeof data.newBalance === "number"
          ? data.newBalance
          : Math.max(0, (user?.balance || 0) - betAmount);

      if (user) {
        login(activeToken, { ...user, balance: nextBalance });
      }

      const newRecord: UserBetRecord = {
        id: `user-bet-${panelIndex}-${Date.now()}`,
        roundId: targetRoundId,
        panelIndex,
        amount: betAmount,
        cashedOutAt: null,
        payout: null,
        status: "placed",
        createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      onBetPlaced?.(newRecord);

      setFeedback(`Bet #${panelIndex} placed for KSh ${betAmount}.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to place bet.");
    } finally {
      setIsBusy(false);
    }
  }, [phase, isBetPlaced, isBusy, token, user, betAmount, roundId, panelIndex, login, onBetPlaced]);

  const handleCashOut = useCallback(async () => {
    if (phase !== "flying" || !isBetPlaced || cashedOutAt || isBusy) return;
    const activeToken = token || getToken();
    if (!activeToken) {
      setFeedback("Please log in to cash out.");
      return;
    }

    setIsBusy(true);
    try {
      const targetRoundId = roundId || placedRoundId || "";
      const response = await fetch(`${API_URL}aviator/cashout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify({ roundId: targetRoundId, panelIndex }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to cash out");

      const exitMultiplier = data.multiplier || multiplier;
      const payoutAmount = data.payout || Number((betAmount * exitMultiplier).toFixed(2));

      const nextBalance =
        typeof data.newBalance === "number"
          ? data.newBalance
          : (user?.balance || 0) + payoutAmount;

      if (user) {
        login(activeToken, { ...user, balance: nextBalance });
      }

      onCashedOut?.(targetRoundId, panelIndex, exitMultiplier, payoutAmount);

      setCashedOutAt(exitMultiplier);
      setFeedback(`Cashed out #${panelIndex} at ${exitMultiplier.toFixed(2)}x · Won KSh ${payoutAmount.toLocaleString()}`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to cash out.");
    } finally {
      setIsBusy(false);
    }
  }, [phase, isBetPlaced, cashedOutAt, isBusy, token, user, roundId, placedRoundId, panelIndex, multiplier, betAmount, login, onCashedOut]);

  return (
    <div className="bg-[#1B140C] rounded-2xl p-3 sm:p-4 border border-[#3A2818] shadow-lg">
      <div className="flex justify-between items-center mb-2">
        <label className="text-xs uppercase tracking-wide text-[#9C8A73] font-bold">
          Bet Panel {panelIndex}
        </label>
        {isBetPlaced && (
          <span className="text-xs font-semibold text-[#FF5A1F] bg-[#FF5A1F]/10 px-2.5 py-0.5 rounded-full border border-[#FF5A1F]/30">
            Active Bet
          </span>
        )}
      </div>

      <div className="flex items-center bg-[#120D08] rounded-xl p-1 sm:p-1.5 border border-[#3A2818]">
        <button
          onClick={() => setBetAmount((a) => Math.max(10, (a || 0) - 10))}
          disabled={isBetPlaced || phase !== "waiting"}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#3A2818] hover:bg-[#FF5A1F]/20 disabled:opacity-40 font-semibold text-base sm:text-lg cursor-pointer"
        >
          −
        </button>
        <input
          type="number"
          min={10}
          disabled={isBetPlaced || phase !== "waiting"}
          className="bg-transparent flex-1 text-center outline-none text-lg sm:text-xl font-bold tabular-nums text-[#F3E6D6] disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance:none [&::-webkit-inner-spin-button]:appearance:none"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          value={betAmount === 0 ? "" : betAmount}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            setBetAmount(isNaN(val) ? 0 : val);
          }}
          onBlur={() => {
            if (!betAmount || betAmount < 1) setBetAmount(10);
          }}
        />
        <button
          onClick={() => setBetAmount((a) => (a || 0) + 10)}
          disabled={isBetPlaced || phase !== "waiting"}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#3A2818] hover:bg-[#FF5A1F]/20 disabled:opacity-40 font-semibold text-base sm:text-lg cursor-pointer"
        >
          +
        </button>
      </div>

      <div className="flex gap-1.5 sm:gap-2 mt-2">
        {[100, 200, 500, 1000].map((v) => (
          <button
            key={v}
            onClick={() => !isBetPlaced && phase === "waiting" && setBetAmount(v)}
            disabled={isBetPlaced || phase !== "waiting"}
            className="flex-1 text-xs py-1 sm:py-1.5 rounded-lg bg-[#120D08] border border-[#3A2818] text-[#9C8A73] hover:text-[#F3E6D6] disabled:opacity-40 font-semibold"
          >
            {v}
          </button>
        ))}
      </div>

      {phase === "waiting" ? (
        <button
          onClick={handleBet}
          disabled={isBetPlaced || isBusy}
          className={`mt-3.5 sm:mt-4 w-full transition rounded-xl py-3.5 sm:py-4 font-extrabold text-base sm:text-lg flex items-center justify-center gap-2 cursor-pointer ${
            isBetPlaced
              ? "bg-[#FF5A1F]/20 border border-[#FF5A1F] text-[#FF5A1F] cursor-not-allowed"
              : "bg-[#FF5A1F] hover:bg-[#E64F17] text-[#120D08] disabled:opacity-50 shadow-lg shadow-[#FF5A1F]/20"
          }`}
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {isBusy ? (
            <span>Placing Bet...</span>
          ) : isBetPlaced ? (
            <span>✓ Bet Placed (KSh {betAmount})</span>
          ) : (
            <span>Place Bet · KSh {betAmount}</span>
          )}
        </button>
      ) : phase === "flying" ? (
        isBetPlaced && !cashedOutAt ? (
          <button
            onClick={handleCashOut}
            disabled={isBusy}
            className="mt-3.5 sm:mt-4 w-full bg-[#FF5A1F] hover:bg-[#E64F17] transition rounded-xl py-3.5 sm:py-4 font-extrabold text-base sm:text-lg text-[#120D08] shadow-xl shadow-[#FF5A1F]/30 flex items-center justify-center gap-2 cursor-pointer"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {isBusy ? (
              <span>Cashing Out...</span>
            ) : (
              <span>Cash Out KSh {(betAmount * multiplier).toFixed(2)}</span>
            )}
          </button>
        ) : cashedOutAt ? (
          <button
            disabled
            className="mt-3.5 sm:mt-4 w-full bg-[#22D67A]/20 border border-[#22D67A] text-[#22D67A] rounded-xl py-3.5 sm:py-4 font-bold text-base sm:text-lg cursor-not-allowed text-center"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            ✓ Cashed Out @ {cashedOutAt.toFixed(2)}x
          </button>
        ) : (
          <button
            disabled
            className="mt-3.5 sm:mt-4 w-full bg-[#1A2338] text-[#7C8AA8] border border-[#22304A] rounded-xl py-3.5 sm:py-4 font-bold text-base sm:text-lg cursor-not-allowed text-center"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            In Flight
          </button>
        )
      ) : (
        <button
          disabled
          className="mt-3.5 sm:mt-4 w-full bg-[#1A2338] text-[#FF4757] border border-[#FF4757]/30 rounded-xl py-3.5 sm:py-4 font-bold text-base sm:text-lg cursor-not-allowed text-center"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Flew Away @ {multiplier.toFixed(2)}x
        </button>
      )}

      {feedback ? <p className="mt-2 text-center text-xs text-[#C4CCE0]">{feedback}</p> : null}
      {cashedOutAt && (
        <p className="mt-2 text-center text-xs text-[#22D67A] font-semibold rise">
          Won KSh {(betAmount * cashedOutAt).toFixed(2)}
        </p>
      )}
      {phase === "crashed" && isBetPlaced && !cashedOutAt && (
        <p className="mt-2 text-center text-xs text-[#FF4757] font-semibold rise">
          Lost KSh {betAmount}
        </p>
      )}
    </div>
  );
}
