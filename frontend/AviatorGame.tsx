"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import { getToken } from "@/lib/auth";
import { API_URL } from "@/lib/api";
import { getSocket } from "./socketClient";

const FONT_LINK_ID = "aviator-fonts";

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

function colorForMultiplier(m: number) {
  if (m >= 10) return { bg: "bg-[#22D67A]", text: "text-[#22D67A]", stroke: "#22D67A" };
  if (m >= 2) return { bg: "bg-[#FFB020]", text: "text-[#FFB020]", stroke: "#FFB020" };
  return { bg: "bg-[#FF4757]", text: "text-[#FF4757]", stroke: "#FF4757" };
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
      transform="scale(0.75)"
      className={isCrashed ? "aviator-plane-crash" : isWaiting ? "aviator-plane-idle" : "aviator-plane-live"}
    >
      {/* Thruster exhaust flame (live flight) */}
      {!isWaiting && !isCrashed && (
        <g className="aviator-thruster-flame">
          <path
            d="M-22 0 Q-32 -3 -40 0 Q-32 3 -22 0 Z"
            fill="url(#aviatorThrusterGlow)"
          />
          <path
            d="M-22 0 Q-28 -1.5 -34 0 Q-28 1.5 -22 0 Z"
            fill="#FFF3D6"
          />
        </g>
      )}

      {/* Main Fuselage Body */}
      <path
        d="M-22 2 C-18 6, -6 7, 10 5 C18 4, 24 2, 27 0 C24 -2, 18 -4, 10 -5 C-6 -7, -18 -6, -22 -2 Z"
        fill={bodyColor}
      />
      {/* Body Top Highlight */}
      <path
        d="M-18 -1 C-10 -4, 6 -3, 20 -1 C12 -2.5, -4 -3, -18 -1 Z"
        fill="#FFFFFF"
        opacity="0.35"
      />
      {/* Body Bottom Shadow */}
      <path
        d="M-20 2 C-10 5.5, 6 4.5, 22 1 C8 3.5, -8 4, -20 2 Z"
        fill="#000000"
        opacity="0.25"
      />

      {/* Cockpit Canopy */}
      <path
        d="M-2 -3 C3 -7, 10 -6, 13 -2.5 C8 -1, 3 -1, -2 -1 Z"
        fill="url(#aviatorCanopyGlow)"
        stroke="rgba(255,255,255,0.7)"
        strokeWidth="0.5"
      />
      {/* Canopy Glint */}
      <path
        d="M2 -4 C5 -6, 9 -5, 11 -3 C8 -3.5, 5 -4, 2 -4 Z"
        fill="#FFFFFF"
        opacity="0.8"
      />

      {/* Main Wing (Far / Bottom) */}
      <path
        d="M-3 2 L4 16 L12 15 L9 2 Z"
        fill={bodyColor}
        filter="brightness(0.75)"
      />

      {/* Main Wing (Near / Top) */}
      <path
        d="M-3 -2 L6 -18 L15 -16 L9 -2 Z"
        fill={bodyColor}
      />
      {/* Wing Highlight Stripe */}
      <path
        d="M1 -4 L6 -16 L11 -15 L8 -4 Z"
        fill="#FFD700"
        opacity="0.9"
      />

      {/* Tail Fin (Rudder) */}
      <path
        d="M-16 -2 L-25 -14 L-18 -13 L-12 -2 Z"
        fill={bodyColor}
      />
      {/* Tail Gold Stripe */}
      <path
        d="M-15 -3 L-21 -11 L-18 -11 L-13 -3 Z"
        fill="#FFD700"
        opacity="0.9"
      />

      {/* Nose Cone / Propeller Hub */}
      <path
        d="M26 2 C28.5 1.2, 30 0.5, 30 0 C30 -0.5, 28.5 -1.2, 26 -2 Z"
        fill="#FFD700"
      />

      {/* Spinning Propeller Blades */}
      {!isCrashed && (
        <g transform="translate(29, 0)" className="aviator-propeller">
          <ellipse cx="0" cy="0" rx="1.5" ry="13" fill="rgba(255, 255, 255, 0.85)" />
          <ellipse cx="0" cy="0" rx="13" ry="1.5" fill="rgba(255, 255, 255, 0.35)" />
          <circle cx="0" cy="0" r="2" fill="#FFD700" />
        </g>
      )}
    </g>
  );
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
  const accent = isCrashed ? "#FF4757" : colorForMultiplier(multiplier).stroke;

  // Fixed multiplier threshold for plane to reach top right of stage (e.g. 2.0x multiplier).
  // Flight trajectory is fixed so users cannot predict or notice crash points from curve speed.
  const CLIMB_TARGET_MULTIPLIER = 2.0;
  const progress = isWaiting
    ? 0
    : Math.min(Math.max((multiplier - 1) / (CLIMB_TARGET_MULTIPLIER - 1), 0), 1);

  const startX = 36;
  const startY = 248;
  const endX = startX + progress * 318;
  const endY = startY - Math.pow(progress, 0.82) * 198;
  const controlX = startX + progress * 150;
  const controlY = startY - progress * 62;
  const curvePath = `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
  const areaPath = `${curvePath} L ${endX} ${startY} L ${startX} ${startY} Z`;
  const planeAngle = -16 - progress * 32;

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
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id="aviatorCurveStroke" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={isCrashed ? "#FF4757" : "#FF4757"} stopOpacity="0.35" />
            <stop offset="55%" stopColor={accent} stopOpacity="0.95" />
            <stop offset="100%" stopColor={isCrashed ? "#FF4757" : "#FFE08A"} stopOpacity="1" />
          </linearGradient>
          <linearGradient id="aviatorCurveFill" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.08" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.28" />
          </linearGradient>
          <linearGradient id="aviatorCanopyGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#80E5FF" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#005580" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="aviatorThrusterGlow" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#FFB020" stopOpacity="0.9" />
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

        <line x1="0" y1="248" x2="400" y2="248" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

        {!isWaiting && (
          <>
            <path d={areaPath} fill="url(#aviatorCurveFill)" />
            <path
              d={curvePath}
              fill="none"
              stroke="url(#aviatorCurveStroke)"
              strokeWidth="4"
              strokeLinecap="round"
              filter="url(#aviatorGlow)"
              className={isCrashed ? "aviator-curve-crash" : "aviator-curve-live"}
            />
            <g transform={`translate(${endX} ${endY}) rotate(${planeAngle})`}>
              <AviatorPlaneIcon color={accent} isCrashed={isCrashed} isWaiting={false} />
            </g>
          </>
        )}

        {isWaiting && (
          <g transform="translate(72 228)">
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
  roundId: string;
  crashPoint: number;
  endedAt: string;
  serverSeed?: string;
  hash?: string;
}

export default function AviatorGame() {
  useFonts();
  const [query, setQuery] = useState("");
  const [phase, setPhase] = useState<Phase>("waiting");
  const [multiplier, setMultiplier] = useState<number>(1.0);
  const [crashPoint, setCrashPoint] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [countdown, setCountdown] = useState<number>(5);
  const [betAmount, setBetAmount] = useState<number>(100);
  const [betPlaced, setBetPlaced] = useState<boolean>(false);
  const [cashedOutAt, setCashedOutAt] = useState<number | null>(null);
  const [shake, setShake] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [roundId, setRoundId] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [feedback, setFeedback] = useState<string>("");

  useEffect(() => {
    const socket = getSocket();

    const handleState = (value: Partial<LiveState>) => {
      const nextPhase = (value.phase || "waiting") as Phase;
      setPhase(nextPhase);
      setCountdown(value.countdown ?? 5);
      setMultiplier(value.multiplier ?? 1);
      setCrashPoint(value.crashPoint ?? null);
      setRoundId(value.roundId ?? null);

      if (nextPhase === "waiting") {
        setBetPlaced(false);
        setCashedOutAt(null);
        setFeedback("");
      }

      if (nextPhase === "crashed") {
        setShake(true);
        setTimeout(() => setShake(false), 400);
      }
    };

    const handleCrashed = (value: Partial<LiveState>) => {
      setPhase("crashed");
      setMultiplier(value.crashPoint ?? 1);
      setCrashPoint(value.crashPoint ?? null);
      setRoundId(value.roundId ?? null);
      setShake(true);
      setTimeout(() => setShake(false), 400);
    };

    socket.on("aviator:state", handleState);
    socket.on("aviator:waiting", handleState);
    socket.on("aviator:started", handleState);
    socket.on("aviator:multiplier", handleState);
    socket.on("aviator:countdown", handleState);
    socket.on("aviator:crashed", handleCrashed);

    return () => {
      socket.off("aviator:state", handleState);
      socket.off("aviator:waiting", handleState);
      socket.off("aviator:started", handleState);
      socket.off("aviator:multiplier", handleState);
      socket.off("aviator:countdown", handleState);
      socket.off("aviator:crashed", handleCrashed);
    };
  }, []);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await fetch(`${API_URL}/aviator/history`);
        if (!response.ok) throw new Error(`History request failed: ${response.status}`);
        const rounds = (await response.json()) as HistoryItem[];
        const items = rounds
          .filter((item) => typeof item?.crashPoint === "number")
          .sort((a, b) => (a.endedAt > b.endedAt ? -1 : a.endedAt < b.endedAt ? 1 : 0))
          .map((item) => Number(item.crashPoint.toFixed(2)));
        setHistory(items);
      } catch (error) {
        console.error("Failed to load Aviator history", error);
        setHistory([]);
      }
    };

    loadHistory();
  }, []);

  useEffect(() => {
    const socket = getSocket();

    const handleHistoryEvent = (value: HistoryItem) => {
      if (typeof value.crashPoint !== "number") return;
      setHistory((prev) => [Number(value.crashPoint.toFixed(2)), ...prev].slice(0, 50));
    };

    socket.on("aviator:history", handleHistoryEvent);
    return () => {
      socket.off("aviator:history", handleHistoryEvent);
    };
  }, []);

  const handleBet = useCallback(async () => {
    if (phase !== "waiting" || betPlaced || isBusy) return;
    const token = getToken();
    if (!token) {
      setFeedback("Please log in to place a bet.");
      return;
    }

    console.debug("[Aviator] placing bet", {
      amount: betAmount,
      roundId,
      phase,
      currentStatus: { betPlaced, cashedOutAt, isBusy },
    });
    setIsBusy(true);
    setFeedback("");
    try {
      const response = await fetch(`${API_URL}/aviator/bet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: betAmount, roundId }),
      });
      const data = await response.json();
      console.debug("[Aviator] bet response", { status: response.status, data });
      if (!response.ok) throw new Error(data.message || "Unable to place bet");
      setBetPlaced(true);
      setFeedback(`Bet placed for KSh ${betAmount}.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to place bet.");
    } finally {
      setIsBusy(false);
    }
  }, [phase, betPlaced, isBusy, betAmount, roundId]);

  const handleCashOut = useCallback(async () => {
    if (phase !== "flying" || !betPlaced || cashedOutAt || isBusy) return;
    const token = getToken();
    if (!token) {
      setFeedback("Please log in to cash out.");
      return;
    }

    console.debug("[Aviator] cashing out", {
      roundId,
      phase,
      multiplier,
      currentStatus: { betPlaced, cashedOutAt, isBusy },
    });
    setIsBusy(true);
    try {
      const response = await fetch(`${API_URL}/aviator/cashout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roundId }),
      });
      const data = await response.json();
      console.debug("[Aviator] cashout response", { status: response.status, data });
      if (!response.ok) throw new Error(data.message || "Unable to cash out");
      setCashedOutAt(multiplier);
      setFeedback(`Cashed out at ${multiplier.toFixed(2)}x.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to cash out.");
    } finally {
      setIsBusy(false);
    }
  }, [phase, betPlaced, cashedOutAt, isBusy, multiplier, roundId]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (phase === "waiting") {
      setBetPlaced(false);
      setCashedOutAt(null);
      setFeedback("");
    }
  }, [phase]);

  const mColor = colorForMultiplier(multiplier);

  return (
    <div className="min-h-screen w-full bg-[#0A0F1E] text-[#E7ECF6]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
        .shake-anim { animation: shake 0.35s ease-in-out; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.65} }
        .blink { animation: blink 1s ease-in-out infinite; }
        @keyframes rise { from { transform: translateY(6px) } to { transform: translateY(0) } }
        .rise { animation: rise 0.25s ease-out; }
        @keyframes aviator-spin { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }
        @keyframes aviator-sun-pulse { 0%,100%{ opacity: 0.55; transform: translate(-50%, -50%) scale(1); } 50%{ opacity: 0.85; transform: translate(-50%, -50%) scale(1.08); } }
        @keyframes aviator-stars-drift { from { transform: translateY(0); } to { transform: translateY(-120px); } }
        @keyframes aviator-plane-idle { 0%,100%{ transform: translateY(0); } 50%{ transform: translateY(-4px); } }
        @keyframes aviator-plane-live { 0%,100%{ transform: translateY(0); } 50%{ transform: translateY(-2px); } }
        @keyframes aviator-plane-crash { 0%{ transform: translate(0, 0); opacity: 1; } 100%{ transform: translate(36px, -28px); opacity: 0.2; } }
        @keyframes aviator-crash-flash { 0%{ opacity: 0.45; } 100%{ opacity: 0; } }
        @keyframes aviator-propeller-spin { 0%{ transform: scaleY(1); opacity: 0.9; } 50%{ transform: scaleY(-0.35); opacity: 0.4; } 100%{ transform: scaleY(1); opacity: 0.9; } }
        .aviator-propeller { animation: aviator-propeller-spin 0.08s linear infinite; transform-origin: center; }
        @keyframes aviator-thruster-flicker { 0%,100%{ transform: scaleX(1); opacity: 0.95; } 50%{ transform: scaleX(1.3); opacity: 0.65; } }
        .aviator-thruster-flame { animation: aviator-thruster-flicker 0.1s ease-in-out infinite; transform-origin: -22px 0px; }
        @keyframes aviator-curve-draw { from { stroke-dashoffset: 420; } to { stroke-dashoffset: 0; } }
        .aviator-sun {
          position: absolute;
          left: 50%;
          top: 58%;
          width: min(72vw, 420px);
          height: min(72vw, 420px);
          transform: translate(-50%, -50%);
          border-radius: 9999px;
          background: radial-gradient(circle, rgba(255, 176, 32, 0.22) 0%, rgba(255, 80, 40, 0.12) 38%, transparent 72%);
          filter: blur(2px);
        }
        .aviator-sun-waiting { animation: aviator-sun-pulse 1.8s ease-in-out infinite; }
        .aviator-sun-crashed {
          background: radial-gradient(circle, rgba(255, 71, 87, 0.28) 0%, rgba(120, 20, 30, 0.12) 42%, transparent 72%);
        }
        .aviator-rays {
          position: absolute;
          left: 50%;
          top: 58%;
          width: min(95vw, 560px);
          height: min(95vw, 560px);
          transform: translate(-50%, -50%);
          animation: aviator-spin 24s linear infinite;
          opacity: 0.75;
        }
        .aviator-rays-fast { animation-duration: 10s; opacity: 0.9; }
        .aviator-rays-crashed { animation-duration: 6s; opacity: 0.55; }
        .aviator-stars {
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(circle at 12% 18%, rgba(255,255,255,0.35) 0 1px, transparent 1px),
            radial-gradient(circle at 28% 72%, rgba(255,255,255,0.18) 0 1px, transparent 1px),
            radial-gradient(circle at 44% 34%, rgba(255,255,255,0.22) 0 1px, transparent 1px),
            radial-gradient(circle at 63% 16%, rgba(255,255,255,0.16) 0 1px, transparent 1px),
            radial-gradient(circle at 78% 58%, rgba(255,255,255,0.24) 0 1px, transparent 1px),
            radial-gradient(circle at 88% 28%, rgba(255,255,255,0.14) 0 1px, transparent 1px);
          animation: aviator-stars-drift 18s linear infinite;
          opacity: 0.35;
        }
        .aviator-plane-idle { animation: aviator-plane-idle 1.4s ease-in-out infinite; transform-origin: center; }
        .aviator-plane-live { animation: aviator-plane-live 0.9s ease-in-out infinite; transform-origin: center; }
        .aviator-plane-crash { animation: aviator-plane-crash 0.55s ease-out forwards; transform-origin: center; }
        .aviator-curve-live { stroke-dasharray: 420; stroke-dashoffset: 0; transition: d 0.15s linear; }
        .aviator-curve-crash { stroke: #FF4757; filter: drop-shadow(0 0 8px rgba(255,71,87,0.65)); }
        .aviator-crash-flash {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 58% 62%, rgba(255,71,87,0.35), transparent 62%);
          animation: aviator-crash-flash 0.55s ease-out forwards;
          pointer-events: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .blink, .rise, .aviator-rays, .aviator-stars, .aviator-sun-waiting, .aviator-plane-idle, .aviator-plane-live, .aviator-plane-crash, .aviator-crash-flash { animation: none; }
        }
        ::-webkit-scrollbar { height: 5px; width: 5px; }
        ::-webkit-scrollbar-thumb { background: #22304A; border-radius: 4px; }
      `}</style>

      <Header query={query} setQuery={setQuery} />

      <main className="max-w-7xl mx-auto p-2 sm:p-4">
        <div className="bg-[#121A2E] rounded-2xl p-2 sm:p-2.5 mb-3 border border-[#22304A]">
          <div className="flex gap-1 sm:gap-1.5 overflow-x-auto pb-0.5">
            {history.map((item, index) => {
              const c = colorForMultiplier(item);
              return (
                <div
                  key={`${item}-${index}`}
                  className={`shrink-0 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full whitespace-nowrap text-[11px] sm:text-xs font-semibold border border-white/10 ${c.bg} bg-opacity-20 text-white`}
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {item.toFixed(2)}x
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-[320px_1fr] gap-2 sm:gap-3">
          <div className="order-1 lg:order-2 bg-[#121A2E] rounded-2xl border border-[#22304A] overflow-hidden">
            <div
              className={`relative h-[280px] xs:h-[320px] sm:h-[420px] lg:h-[520px] overflow-hidden ${shake ? "shake-anim" : ""}`}
            >
              <AviatorStageBackground phase={phase} multiplier={multiplier} crashPoint={crashPoint} />

              <div className="absolute inset-0 z-10 flex flex-col justify-center items-center pointer-events-none px-4">
                {phase === "waiting" ? (
                  <div className="text-center rise w-full">
                    <p className="text-[#7C8AA8] text-xs sm:text-sm tracking-widest uppercase mb-2">Next round in</p>
                    <h1
                      className="text-5xl sm:text-7xl font-bold text-[#FFB020] tabular-nums blink leading-none"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {countdown}s
                    </h1>
                  </div>
                ) : (
                  <div className="text-center rise">
                    <h1
                      className={`text-6xl sm:text-8xl font-bold tabular-nums ${phase === "crashed" ? "text-[#FF4757]" : mColor.text}`}
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {multiplier.toFixed(2)}x
                    </h1>
                    <p className="mt-3 text-xs sm:text-sm tracking-widest uppercase text-[#7C8AA8]">
                      {phase === "crashed" ? "Flew away" : "In flight"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="order-2 lg:order-1 space-y-2 sm:space-y-3">
            {phase === "waiting" && (
              <div className="lg:hidden bg-[#121A2E] rounded-2xl p-3 border border-[#22304A] text-center">
                <p className="text-[#7C8AA8] text-xs uppercase tracking-widest mb-1">Next round in</p>
                <p className="text-3xl font-bold text-[#FFB020] tabular-nums" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {countdown}s
                </p>
              </div>
            )}

            <div className="bg-[#121A2E] rounded-2xl p-3 sm:p-4 border border-[#22304A]">
              <label className="text-xs uppercase tracking-wide text-[#7C8AA8]">Bet Amount</label>
              <div className="flex items-center bg-[#0D1424] rounded-xl mt-2 p-1 sm:p-1.5 border border-[#22304A]">
                <button
                  onClick={() => setBetAmount((a) => Math.max(10, a - 10))}
                  disabled={betPlaced || phase !== "waiting"}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#1a2338] hover:bg-[#22304A] disabled:opacity-40 font-semibold text-base sm:text-lg"
                >
                  −
                </button>
                <input
                  className="bg-transparent flex-1 text-center outline-none text-lg sm:text-xl font-bold tabular-nums"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  value={betAmount}
                  readOnly
                />
                <button
                  onClick={() => setBetAmount((a) => a + 10)}
                  disabled={betPlaced || phase !== "waiting"}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#1a2338] hover:bg-[#22304A] disabled:opacity-40 font-semibold text-base sm:text-lg"
                >
                  +
                </button>
              </div>

              <div className="flex gap-1.5 sm:gap-2 mt-2">
                {[100, 500, 1000].map((v) => (
                  <button
                    key={v}
                    onClick={() => !betPlaced && phase === "waiting" && setBetAmount(v)}
                    disabled={betPlaced || phase !== "waiting"}
                    className="flex-1 text-xs py-1 sm:py-1.5 rounded-lg bg-[#0D1424] border border-[#22304A] text-[#7C8AA8] hover:text-white disabled:opacity-40"
                  >
                    {v}
                  </button>
                ))}
              </div>

              {phase === "flying" && betPlaced && !cashedOutAt ? (
                <button
                  onClick={handleCashOut}
                  className="mt-4 sm:mt-5 w-full bg-[#22D67A] hover:bg-[#1CBE6B] transition rounded-xl py-3 sm:py-4 font-bold text-base sm:text-lg text-[#0A0F1E]"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Cash Out @ {multiplier.toFixed(2)}x
                </button>
              ) : (
                <button
                  onClick={handleBet}
                  disabled={phase !== "waiting" || betPlaced || isBusy}
                  className="mt-4 sm:mt-5 w-full bg-[#FFB020] hover:bg-[#F0A415] disabled:bg-[#3a3220] disabled:text-[#7C8AA8] transition rounded-xl py-3 sm:py-4 font-bold text-base sm:text-lg text-[#0A0F1E] disabled:cursor-not-allowed"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {betPlaced ? "Bet Placed — Waiting" : `Place Bet · KSh ${betAmount}`}
                </button>
              )}

              {feedback ? <p className="mt-3 text-center text-sm text-[#C4CCE0]">{feedback}</p> : null}
              {cashedOutAt && (
                <p className="mt-3 text-center text-sm text-[#22D67A] font-semibold rise">
                  Cashed out at {cashedOutAt.toFixed(2)}x · won KSh {(betAmount * cashedOutAt).toFixed(2)}
                </p>
              )}
              {phase === "crashed" && betPlaced && !cashedOutAt && (
                <p className="mt-3 text-center text-sm text-[#FF4757] font-semibold rise">
                  Missed the exit — lost KSh {betAmount}
                </p>
              )}
            </div>

            <div className="bg-[#121A2E] rounded-2xl p-3 sm:p-4 border border-[#22304A]">
              <h3 className="font-semibold mb-2 sm:mb-3 text-sm text-[#C4CCE0]">Round Status</h3>
              <p className="text-sm text-[#7C8AA8]">Round: {roundId || "—"}</p>
              <p className="text-sm text-[#7C8AA8]">Crash point: {crashPoint ? `${crashPoint.toFixed(2)}x` : "—"}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
