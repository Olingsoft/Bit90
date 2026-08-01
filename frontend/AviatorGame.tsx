"use client";

import { useState, useEffect, useCallback } from "react";
import { onValue, ref, query as dbQuery, orderByChild, limitToLast } from "firebase/database";
import { rtdb } from "./firebaseClient";
import Header from "@/components/Header";
import { getToken } from "@/lib/auth";
import { API_URL } from "@/lib/api";

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
  if (m >= 10) return { bg: "bg-[#22D67A]", text: "text-[#22D67A]" };
  if (m >= 2) return { bg: "bg-[#FFB020]", text: "text-[#FFB020]" };
  return { bg: "bg-[#FF4757]", text: "text-[#FF4757]" };
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
    const liveRef = ref(rtdb, "aviator/live");
    const unsubscribe = onValue(liveRef, (snapshot) => {
      const value = snapshot.val() as LiveState | null;
      if (!value) return;

      const nextPhase = (value.phase || "waiting") as Phase;
      console.debug("[Aviator] live state", {
        phase: nextPhase,
        countdown: value.countdown ?? 5,
        multiplier: value.multiplier ?? 1,
        roundId: value.roundId ?? null,
        crashPoint: value.crashPoint ?? null,
        localStatus: {
          betPlaced,
          cashedOutAt,
          isBusy,
          feedback,
        },
      });
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
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const historyRef = dbQuery(ref(rtdb, "aviator/history"), orderByChild("endedAt"), limitToLast(50));
    const unsubscribe = onValue(historyRef, (snapshot) => {
      const value = snapshot.val() as Record<string, HistoryItem> | null;
      if (!value) {
        setHistory([]);
        return;
      }

      const items = Object.values(value)
        .filter((item) => typeof item?.crashPoint === "number")
        .sort((a, b) => (a.endedAt > b.endedAt ? -1 : a.endedAt < b.endedAt ? 1 : 0))
        .map((item) => Number(item.crashPoint.toFixed(2)));

      setHistory(items);
    });
    return () => unsubscribe();
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
        @media (prefers-reduced-motion: reduce) {
          .blink, .rise { animation: none; }
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
              style={{
                background:
                  "radial-gradient(circle at 30% 100%, rgba(255,176,32,0.08), transparent 55%), linear-gradient(180deg, #0A0F1E 0%, #101a30 100%)",
              }}
            >
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
