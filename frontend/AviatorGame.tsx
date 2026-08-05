"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Header from "@/components/Header";
import { getToken, type User } from "@/lib/auth";
import { getSocket } from "./socketClient";
import { useAuth } from "@/components/AuthProvider";
import { API_URL } from "@/lib/api";
import AviatorLiveBets, { type UserBetRecord } from "./AviatorLiveBets";

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
  if (m >= 2) return { bg: "bg-[#22D67A]", text: "text-[#22D67A]", stroke: "#22D67A" };
  return { bg: "bg-[#FFB020]", text: "text-[#FFB020]", stroke: "#FFB020" };
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
    const update = () => {
      if (!running) return;
      const target = targetRef.current;
      const diff = target - currentRef.current;

      if (Math.abs(diff) > 0.0005) {
        currentRef.current += diff * 0.18;
        setSmooth(currentRef.current);
      } else {
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
  const smoothMultiplier = useSmoothMultiplier(multiplier, phase);

  const isWaiting = phase === "waiting";
  const isCrashed = phase === "crashed";
  const activeMultiplier = isWaiting ? 1.0 : isCrashed ? (crashPoint ?? multiplier) : smoothMultiplier;
  const accent = isCrashed ? "#FF4757" : colorForMultiplier(activeMultiplier).stroke;

  const CLIMB_TARGET_MULTIPLIER = 2.0;
  const progress = isWaiting
    ? 0
    : Math.min(Math.max((activeMultiplier - 1) / (CLIMB_TARGET_MULTIPLIER - 1), 0), 1);

  const startX = 45;
  const startY = 238;
  const endX = startX + progress * 290;
  const endY = startY - Math.pow(progress, 0.88) * 123;
  const controlX = startX + progress * 150;
  const controlY = startY - progress * 35;
  const curvePath = `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
  const areaPath = `${curvePath} L ${endX} ${startY} L ${startX} ${startY} Z`;
  const planeAngle = -8 - progress * 22;

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

        <line x1="0" y1="238" x2="400" y2="238" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />

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
          <g transform="translate(72 218)">
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
  const { user, token, login } = useAuth();
  const [query, setQuery] = useState("");
  const [phase, setPhase] = useState<Phase>("waiting");
  const [multiplier, setMultiplier] = useState<number>(1.0);
  const [crashPoint, setCrashPoint] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [countdown, setCountdown] = useState<number>(5);
  const [shake, setShake] = useState<boolean>(false);
  const [roundId, setRoundId] = useState<string | null>(null);
  const [userBets, setUserBets] = useState<UserBetRecord[]>([]);

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

    socket.on("aviator:state", handleState);
    socket.on("aviator:waiting", handleWaiting);
    socket.on("aviator:countdown", handleCountdown);
    socket.on("aviator:started", handleStarted);
    socket.on("aviator:multiplier", handleMultiplier);
    socket.on("aviator:crashed", handleCrashed);

    return () => {
      socket.off("aviator:state", handleState);
      socket.off("aviator:waiting", handleWaiting);
      socket.off("aviator:countdown", handleCountdown);
      socket.off("aviator:started", handleStarted);
      socket.off("aviator:multiplier", handleMultiplier);
      socket.off("aviator:crashed", handleCrashed);
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
        const response = await fetch(`${API_URL}aviator/history`);
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
        @keyframes aviator-propeller-spin { 0%{ transform: scaleY(1); opacity: 0.9; } 50%{ transform: scaleY(-0.35); opacity: 0.4; } 100%{ transform: scaleY(1); opacity: 0.9; } }
        .aviator-propeller { animation: aviator-propeller-spin 0.08s linear infinite; transform-origin: center; }
        @keyframes aviator-thruster-flicker { 0%,100%{ transform: scaleX(1); opacity: 0.95; } 50%{ transform: scaleX(1.3); opacity: 0.65; } }
        .aviator-thruster-flame { animation: aviator-thruster-flicker 0.12s ease-in-out infinite; transform-origin: right center; }
        .aviator-sun { position: absolute; bottom: -80px; left: 50%; width: 360px; height: 360px; transform: translateX(-50%); border-radius: 50%; background: radial-gradient(circle, rgba(255,176,32,0.25) 0%, rgba(255,71,87,0.12) 45%, transparent 70%); pointer-events: none; }
        .aviator-sun-waiting { background: radial-gradient(circle, rgba(255,176,32,0.35) 0%, rgba(255,176,32,0.15) 50%, transparent 70%); }
        .aviator-sun-crashed { background: radial-gradient(circle, rgba(255,71,87,0.45) 0%, rgba(255,71,87,0.2) 50%, transparent 70%); }
        .aviator-rays { position: absolute; top: 50%; left: 50%; width: 600px; height: 600px; transform: translate(-50%, -50%); pointer-events: none; animation: aviator-spin 60s linear infinite; }
        .aviator-rays-fast { animation-duration: 20s; }
        .aviator-rays-crashed { opacity: 0.4; }
        .aviator-crash-flash { position: absolute; inset: 0; background: rgba(255,71,87,0.25); pointer-events: none; animation: blink 0.4s ease-out 2; }
      `}</style>

      <Header query={query} setQuery={setQuery} />

      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-4 space-y-3">
        {/* TOP MULTIPLIER HISTORY BAR */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1.5 sm:py-2 px-3 bg-[#121A2E] rounded-xl border border-[#22304A] scrollbar-none text-xs shadow-md">
          <span className="text-[#7C8AA8] font-bold text-[10px] sm:text-xs uppercase tracking-wider pr-1 shrink-0 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22D67A]" />
            History
          </span>
          {history.map((h, i) => {
            const color = colorForMultiplier(h);
            return (
              <span
                key={i}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-extrabold whitespace-nowrap bg-[#0D1424] border border-[#22304A] shadow-sm ${color.text}`}
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {h.toFixed(2)}x
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
              multiplier={multiplier}
              roundId={roundId}
              user={user}
              userBets={userBets}
            />
          </div>

          {/* RIGHT CENTER: GAME STAGE & DUAL CONTROL PANELS */}
          <div className="lg:col-span-8 xl:col-span-8 order-1 lg:order-2 space-y-3">
            {/* STAGE CONTAINER */}
            <div className="relative bg-[#070B15] border border-[#22304A] rounded-2xl overflow-hidden shadow-2xl min-h-[320px] sm:min-h-[400px] lg:min-h-[440px] flex flex-col justify-between p-3 sm:p-5">
              <div className="flex justify-between items-center z-10">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF4757] animate-pulse" />
                  <span
                    className="text-xs sm:text-sm font-bold tracking-wider text-white uppercase"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Aviator Live
                  </span>
                </div>
              </div>

              {/* STAGE ANIMATION CANVAS */}
              <div className={`absolute inset-0 overflow-hidden ${shake ? "shake-anim" : ""}`}>
                <AviatorStageBackground phase={phase} multiplier={multiplier} crashPoint={crashPoint} />
              </div>

              {/* MULTIPLIER / COUNTDOWN OVERLAY */}
              <div className="relative z-10 flex-1 flex items-center justify-center pointer-events-none">
                {phase === "waiting" ? (
                  <div className="text-center rise w-full">
                    <p className="text-[#7C8AA8] text-xs sm:text-sm tracking-widest uppercase mb-2 font-semibold">
                      Next round in
                    </p>
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
                      className={`text-6xl sm:text-8xl font-bold tabular-nums ${
                        phase === "crashed" ? "text-[#FF4757]" : mColor.text
                      }`}
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {multiplier.toFixed(2)}x
                    </h1>
                    <p className="mt-3 text-xs sm:text-sm tracking-widest uppercase text-[#7C8AA8] font-bold">
                      {phase === "crashed" ? "Flew away" : "In flight"}
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
                multiplier={multiplier}
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
                multiplier={multiplier}
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
    <div className="bg-[#121A2E] rounded-2xl p-3 sm:p-4 border border-[#22304A] shadow-lg">
      <div className="flex justify-between items-center mb-2">
        <label className="text-xs uppercase tracking-wide text-[#7C8AA8] font-bold">
          Bet Panel {panelIndex}
        </label>
        {isBetPlaced && (
          <span className="text-xs font-semibold text-[#22D67A] bg-[#22D67A]/10 px-2.5 py-0.5 rounded-full border border-[#22D67A]/30">
            Active Bet
          </span>
        )}
      </div>

      <div className="flex items-center bg-[#0D1424] rounded-xl p-1 sm:p-1.5 border border-[#22304A]">
        <button
          onClick={() => setBetAmount((a) => Math.max(10, (a || 0) - 10))}
          disabled={isBetPlaced || phase !== "waiting"}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#1a2338] hover:bg-[#22304A] disabled:opacity-40 font-semibold text-base sm:text-lg cursor-pointer"
        >
          −
        </button>
        <input
          type="number"
          min={10}
          disabled={isBetPlaced || phase !== "waiting"}
          className="bg-transparent flex-1 text-center outline-none text-lg sm:text-xl font-bold tabular-nums text-white disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#1a2338] hover:bg-[#22304A] disabled:opacity-40 font-semibold text-base sm:text-lg cursor-pointer"
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
            className="flex-1 text-xs py-1 sm:py-1.5 rounded-lg bg-[#0D1424] border border-[#22304A] text-[#7C8AA8] hover:text-white disabled:opacity-40 font-semibold"
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
              ? "bg-[#22D67A]/20 border border-[#22D67A] text-[#22D67A] cursor-not-allowed"
              : "bg-[#FFB020] hover:bg-[#F0A415] text-[#0A0F1E] disabled:opacity-50 shadow-lg shadow-[#FFB020]/20"
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
            className="mt-3.5 sm:mt-4 w-full bg-[#22D67A] hover:bg-[#1CBE6B] transition rounded-xl py-3.5 sm:py-4 font-extrabold text-base sm:text-lg text-[#0A0F1E] shadow-xl shadow-[#22D67A]/30 flex items-center justify-center gap-2 cursor-pointer"
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
