"use client";

import { useState, useEffect, useRef } from "react";
import { Users, Clock, Award, Flame, Zap, CheckCircle2, XCircle, TrendingUp } from "lucide-react";
import { getToken, type User } from "@/lib/auth";
import { API_URL } from "@/lib/api";

export interface LiveBetItem {
  id: string;
  username: string;
  avatarColor: string;
  amount: number;
  cashedOut: boolean;
  cashedOutAt?: number;
  payout?: number;
  targetMultiplier?: number;
  isUser?: boolean;
  justCashedOut?: boolean;
  crashed?: boolean;
  timestamp?: string;
  roundId?: string;
}

export interface UserBetRecord {
  id: string;
  roundId: string;
  panelIndex: number;
  amount: number;
  cashedOutAt: number | null;
  payout: number | null;
  status: "placed" | "cashed_out" | "crashed";
  createdAt: string;
}

export function formatMaskedPhone(phone?: string | null): string {
  if (!phone) return "0712***21";
  let digits = String(phone).replace(/\D/g, "");
  if (digits.startsWith("254") && digits.length === 12) {
    digits = "0" + digits.slice(3);
  }
  if (digits.length >= 9) {
    const start = digits.slice(0, 4);
    const end = digits.slice(-2);
    return `${start}***${end}`;
  }
  return `${digits.slice(0, 4)}***${digits.slice(-2)}`;
}

const AVATAR_COLORS = [
  "from-[#FF4757] to-[#FF6B81]",
  "from-[#22D67A] to-[#2ECC71]",
  "from-[#FFB020] to-[#F39C12]",
  "from-[#3B82F6] to-[#60A5FA]",
  "from-[#8B5CF6] to-[#A78BFA]",
  "from-[#EC4899] to-[#F472B6]",
  "from-[#14B8A6] to-[#2DD4BF]",
  "from-[#F97316] to-[#FB923C]",
];

interface AviatorLiveBetsProps {
  phase: "waiting" | "flying" | "crashed";
  multiplier: number;
  roundId: string | null;
  user: User | null;
  userBets: UserBetRecord[];
  onSocketBet?: LiveBetItem;
  onSocketCashout?: { roundId?: string; multiplier: number; payout: number; panelIndex: number; username?: string };
}

export default function AviatorLiveBets({
  phase,
  multiplier,
  roundId,
  user,
  userBets,
  onSocketBet,
  onSocketCashout,
}: AviatorLiveBetsProps) {
  const [activeTab, setActiveTab] = useState<"all" | "my" | "top">("all");
  const [topSubFilter, setTopSubFilter] = useState<"wins" | "mults">("wins");
  const [liveBets, setLiveBets] = useState<LiveBetItem[]>([]);
  const [dbUserBets, setDbUserBets] = useState<UserBetRecord[]>([]);
  const [topWins, setTopWins] = useState<any[]>([]);
  const prevPhaseRef = useRef<"waiting" | "flying" | "crashed">(phase);

  // Fetch real DB user bets
  useEffect(() => {
    const fetchMyBets = async () => {
      const activeToken = getToken();
      if (!activeToken) return;
      try {
        const response = await fetch(`${API_URL}aviator/my-bets`, {
          headers: { Authorization: `Bearer ${activeToken}` },
        });
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setDbUserBets(data);
          }
        }
      } catch (err) {
        console.error("Error fetching user bets from DB:", err);
      }
    };

    if (activeTab === "my" || user) {
      fetchMyBets();
    }
  }, [activeTab, user]);

  // Fetch real DB top bets
  useEffect(() => {
    const fetchTopBets = async () => {
      try {
        const response = await fetch(`${API_URL}aviator/top-bets`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setTopWins(data);
          }
        }
      } catch (err) {
        console.error("Error fetching top bets from DB:", err);
      }
    };

    if (activeTab === "top") {
      fetchTopBets();
    }
  }, [activeTab]);

  // Fetch real round bets from DB
  useEffect(() => {
    if (!roundId) return;
    const fetchRoundBets = async () => {
      try {
        const response = await fetch(`${API_URL}aviator/round-bets/${roundId}`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            const dbFormatted: LiveBetItem[] = data.map((b: any, i: number) => ({
              id: b.id || `db-bet-${i}`,
              username: b.username || formatMaskedPhone(),
              avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
              amount: b.amount,
              cashedOut: b.cashedOut || b.status === "cashed_out",
              cashedOutAt: b.cashedOutAt,
              payout: b.payout,
              targetMultiplier: b.cashedOutAt || undefined,
              isUser: false,
            }));
            setLiveBets((prev) => {
              const combined = [...dbFormatted, ...prev];
              return Array.from(new Map(combined.map((item) => [item.id, item])).values());
            });
          }
        }
      } catch (err) {
        console.error("Error fetching round bets from DB:", err);
      }
    };

    fetchRoundBets();
  }, [roundId]);

  // Handle Socket Bet Event
  useEffect(() => {
    if (!onSocketBet) return;
    setLiveBets((prev) => [onSocketBet, ...prev]);
  }, [onSocketBet]);

  // Handle Socket Cashout Event
  useEffect(() => {
    if (!onSocketCashout) return;
    setLiveBets((prev) =>
      prev.map((b) =>
        b.roundId === onSocketCashout.roundId && !b.cashedOut
          ? {
            ...b,
            cashedOut: true,
            cashedOutAt: onSocketCashout.multiplier,
            payout: onSocketCashout.payout,
            justCashedOut: true,
          }
          : b
      )
    );
  }, [onSocketCashout]);

  // Update live bets state on round phase changes
  useEffect(() => {
    if (phase === "waiting" && prevPhaseRef.current !== "waiting") {
      // Clean slate for new round - strictly real DB & socket bets
      setLiveBets([]);
    } else if (phase === "crashed" && prevPhaseRef.current === "flying") {
      setLiveBets((prev) =>
        prev.map((bet) => (!bet.cashedOut ? { ...bet, crashed: true } : bet))
      );
    }

    prevPhaseRef.current = phase;
  }, [phase]);

  // Clear flash effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setLiveBets((prev) =>
        prev.map((b) => (b.justCashedOut ? { ...b, justCashedOut: false } : b))
      );
    }, 1200);
    return () => clearTimeout(timer);
  }, [multiplier]);

  // Merge local user bets into live bets list
  useEffect(() => {
    if (!userBets || userBets.length === 0) return;

    userBets.forEach((ub) => {
      setLiveBets((prev) => {
        const existingIdx = prev.findIndex((b) => b.id === ub.id || (b.isUser && b.roundId === ub.roundId));
        const username = user?.phone ? formatMaskedPhone(user.phone) : "0712***21";
        const cashedOut = ub.status === "cashed_out";
        const cashedOutAt = ub.cashedOutAt ?? undefined;
        const payout = ub.payout ?? undefined;

        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            cashedOut,
            cashedOutAt,
            payout,
            crashed: ub.status === "crashed",
            justCashedOut: cashedOut && !updated[existingIdx].cashedOut,
          };
          return updated;
        } else {
          return [
            {
              id: ub.id,
              username: `${username} (Panel ${ub.panelIndex})`,
              avatarColor: "from-[#22D67A] to-[#1CBE6B]",
              amount: ub.amount,
              cashedOut,
              cashedOutAt,
              payout,
              isUser: true,
              crashed: ub.status === "crashed",
              roundId: ub.roundId,
            },
            ...prev,
          ];
        }
      });
    });
  }, [userBets, user]);

  const allUserBetsCombined = [...userBets, ...dbUserBets];
  const uniqueUserBets = Array.from(new Map(allUserBetsCombined.map((b) => [b.id, b])).values());

  // Stats calculation
  const totalBetsCount = liveBets.length;
  const totalCashedOutCount = liveBets.filter((b) => b.cashedOut).length;
  const totalPayoutSum = liveBets
    .filter((b) => b.cashedOut && b.payout)
    .reduce((sum, b) => sum + (b.payout || 0), 0);

  return (
    <div className="bg-[#121A2E] rounded-2xl border border-[#22304A] flex flex-col h-full overflow-hidden shadow-xl">
      {/* HEADER NAVIGATION TABS */}
      <div className="flex items-center bg-[#0D1424] p-1 sm:p-1.5 border-b border-[#22304A] gap-1">
        <button
          onClick={() => setActiveTab("all")}
          className={`flex-1 py-2 sm:py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === "all"
            ? "bg-[#1C2842] text-white shadow-md border border-[#2B3C5E]"
            : "text-[#7C8AA8] hover:text-white hover:bg-[#151E33]"
            }`}
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <Users className="w-3.5 h-3.5 text-[#22D67A]" />
          <span>All Bets</span>
          <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-[#22D67A]/20 text-[#22D67A] border border-[#22D67A]/30">
            {totalBetsCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("my")}
          className={`flex-1 py-2 sm:py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === "my"
            ? "bg-[#1C2842] text-white shadow-md border border-[#2B3C5E]"
            : "text-[#7C8AA8] hover:text-white hover:bg-[#151E33]"
            }`}
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <Clock className="w-3.5 h-3.5 text-[#FFB020]" />
          <span>My Bets</span>
          {uniqueUserBets.length > 0 && (
            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-[#FFB020]/20 text-[#FFB020]">
              {uniqueUserBets.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("top")}
          className={`flex-1 py-2 sm:py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === "top"
            ? "bg-[#1C2842] text-white shadow-md border border-[#2B3C5E]"
            : "text-[#7C8AA8] hover:text-white hover:bg-[#151E33]"
            }`}
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <Flame className="w-3.5 h-3.5 text-[#FF4757]" />
          <span>Top</span>
        </button>
      </div>

      {/* ALL BETS TAB CONTENT */}
      {activeTab === "all" && (
        <div className="flex-1 flex flex-col min-h-[300px] max-h-[520px]">
          {/* STATS OVERVIEW BAR */}
          <div className="px-3.5 py-2 bg-[#0A0F1E]/80 border-b border-[#22304A]/60 flex items-center justify-between text-[11px] font-semibold text-[#7C8AA8]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#22D67A] animate-ping" />
              <span className="text-white font-bold">{totalCashedOutCount}/{totalBetsCount}</span> Cashed Out
            </div>
            <div className="flex items-center gap-1 text-[#22D67A]">
              <span>Total Won:</span>
              <span className="font-bold text-white tabular-nums">KSh {totalPayoutSum.toLocaleString()}</span>
            </div>
          </div>

          {/* TABLE HEADERS */}
          <div className="grid grid-cols-12 px-3 sm:px-4 py-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#64748B] border-b border-[#22304A]/50 bg-[#0E1526]">
            <div className="col-span-5">User Phone</div>
            <div className="col-span-3 text-right">Bet (KSh)</div>
            <div className="col-span-2 text-center">Mult</div>
            <div className="col-span-2 text-right">Cash Out</div>
          </div>

          {/* SCROLLABLE BETS LIST */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#1A253D] scrollbar-thin scrollbar-thumb-[#22304A]">
            {liveBets.length === 0 ? (
              <div className="p-8 text-center text-[#64748B] flex flex-col items-center gap-2">
                <Users className="w-8 h-8 text-[#22304A]" />
                <p className="text-xs">No bets placed in this round yet.</p>
                <p className="text-[11px] text-[#475569]">Bets placed by players in database will appear here live!</p>
              </div>
            ) : (
              liveBets.map((bet) => {
                const isHighMult = bet.cashedOutAt && bet.cashedOutAt >= 10;
                const isMidMult = bet.cashedOutAt && bet.cashedOutAt >= 2.0;

                return (
                  <div
                    key={bet.id}
                    className={`grid grid-cols-12 px-3 sm:px-4 py-2.5 items-center text-xs transition-all duration-300 ${bet.isUser
                      ? "bg-[#22D67A]/10 border-l-4 border-l-[#22D67A]"
                      : bet.justCashedOut
                        ? "bg-[#22D67A]/20 shadow-[0_0_15px_rgba(34,214,122,0.3)]"
                        : "hover:bg-[#162035]"
                      }`}
                  >
                    {/* USER COLUMN */}
                    <div className="col-span-5 flex items-center gap-2 overflow-hidden pr-1">
                      <div
                        className={`w-6 h-6 rounded-full bg-gradient-to-tr ${bet.avatarColor} flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm`}
                      >
                        {bet.username.charAt(0)}
                      </div>
                      <div className="truncate font-semibold text-white flex items-center gap-1 text-[11px] sm:text-xs">
                        <span>{bet.username}</span>
                        {bet.isUser && (
                          <span className="text-[9px] px-1 py-0.2 bg-[#22D67A] text-[#0A0F1E] font-extrabold rounded">
                            YOU
                          </span>
                        )}
                      </div>
                    </div>

                    {/* BET AMOUNT */}
                    <div className="col-span-3 text-right font-bold text-[#E2E8F0] tabular-nums text-[11px] sm:text-xs">
                      {bet.amount.toLocaleString()}
                    </div>

                    {/* MULTIPLIER BADGE */}
                    <div className="col-span-2 flex justify-center">
                      {bet.cashedOut && bet.cashedOutAt ? (
                        <span
                          className={`px-1.5 py-0.5 rounded-md text-[10px] sm:text-[11px] font-extrabold tabular-nums border ${isHighMult
                            ? "bg-[#A855F7]/20 text-[#C084FC] border-[#A855F7]/50 shadow-[0_0_8px_rgba(168,85,247,0.4)]"
                            : isMidMult
                              ? "bg-[#22D67A]/20 text-[#22D67A] border-[#22D67A]/50 shadow-[0_0_8px_rgba(34,214,122,0.3)]"
                              : "bg-[#FFB020]/20 text-[#FFB020] border-[#FFB020]/40"
                            }`}
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          {bet.cashedOutAt.toFixed(2)}x
                        </span>
                      ) : bet.crashed ? (
                        <span className="text-[10px] text-[#EF4444] font-semibold">Crashed</span>
                      ) : (
                        <span className="text-[10px] text-[#64748B] font-mono">---</span>
                      )}
                    </div>

                    {/* CASHOUT AMOUNT */}
                    <div className="col-span-2 text-right font-extrabold tabular-nums text-[11px] sm:text-xs">
                      {bet.cashedOut && bet.payout ? (
                        <span className="text-[#22D67A]">
                          +{(bet.payout).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-[#475569]">-</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* MY BETS TAB CONTENT */}
      {activeTab === "my" && (
        <div className="flex-1 flex flex-col min-h-[300px] max-h-[520px]">
          <div className="grid grid-cols-12 px-3 sm:px-4 py-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#64748B] border-b border-[#22304A]/50 bg-[#0E1526]">
            <div className="col-span-4">Round / Time</div>
            <div className="col-span-3 text-right">Bet</div>
            <div className="col-span-2 text-center">Mult</div>
            <div className="col-span-3 text-right">Payout</div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#1A253D] scrollbar-thin scrollbar-thumb-[#22304A]">
            {uniqueUserBets.length === 0 ? (
              <div className="p-8 text-center text-[#64748B] flex flex-col items-center gap-2">
                <Clock className="w-8 h-8 text-[#22304A]" />
                <p className="text-xs">No bets placed in database yet.</p>
                <p className="text-[11px] text-[#475569]">Place a bet on the control panel to see your live DB history!</p>
              </div>
            ) : (
              uniqueUserBets.map((b) => {
                const isWin = b.status === "cashed_out" && b.payout;
                return (
                  <div key={b.id} className="grid grid-cols-12 px-3 sm:px-4 py-3 items-center text-xs hover:bg-[#162035]">
                    <div className="col-span-4">
                      <p className="font-bold text-white text-[11px]">Panel {b.panelIndex}</p>
                      <p className="text-[10px] text-[#64748B]">{b.createdAt}</p>
                    </div>

                    <div className="col-span-3 text-right font-bold text-white tabular-nums">
                      KSh {b.amount.toLocaleString()}
                    </div>

                    <div className="col-span-2 flex justify-center">
                      {b.status === "cashed_out" && b.cashedOutAt ? (
                        <span className="px-1.5 py-0.5 rounded bg-[#22D67A]/20 text-[#22D67A] font-extrabold text-[11px] border border-[#22D67A]/40">
                          {b.cashedOutAt.toFixed(2)}x
                        </span>
                      ) : b.status === "crashed" ? (
                        <span className="px-1.5 py-0.5 rounded bg-[#FF4757]/20 text-[#FF4757] font-bold text-[10px]">
                          Flew Away
                        </span>
                      ) : (
                        <span className="text-[#FFB020] text-[10px] font-bold animate-pulse">In Flight</span>
                      )}
                    </div>

                    <div className="col-span-3 text-right font-extrabold tabular-nums">
                      {isWin ? (
                        <span className="text-[#22D67A]">+KSh {(b.payout!).toLocaleString()}</span>
                      ) : b.status === "crashed" ? (
                        <span className="text-[#FF4757]">-KSh {b.amount.toLocaleString()}</span>
                      ) : (
                        <span className="text-[#64748B]">-</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TOP BETS TAB CONTENT */}
      {activeTab === "top" && (
        <div className="flex-1 flex flex-col min-h-[300px] max-h-[520px]">
          {/* SUB FILTER HEADER */}
          <div className="p-2 bg-[#0A0F1E] border-b border-[#22304A]/60 flex justify-between items-center gap-2">
            <div className="flex bg-[#141D30] p-1 rounded-lg border border-[#22304A]">
              <button
                onClick={() => setTopSubFilter("wins")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${topSubFilter === "wins" ? "bg-[#22D67A] text-[#0A0F1E]" : "text-[#7C8AA8] hover:text-white"
                  }`}
              >
                Huge Wins
              </button>
              <button
                onClick={() => setTopSubFilter("mults")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${topSubFilter === "mults" ? "bg-[#22D67A] text-[#0A0F1E]" : "text-[#7C8AA8] hover:text-white"
                  }`}
              >
                Multiplier
              </button>
            </div>
            <span className="text-[10px] text-[#64748B] font-semibold pr-2">DB Leaderboard</span>
          </div>

          <div className="grid grid-cols-12 px-3 sm:px-4 py-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#64748B] border-b border-[#22304A]/50 bg-[#0E1526]">
            <div className="col-span-5">Player Phone</div>
            <div className="col-span-3 text-right">Bet</div>
            <div className="col-span-2 text-center">Mult</div>
            <div className="col-span-2 text-right">Win</div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#1A253D] scrollbar-thin scrollbar-thumb-[#22304A]">
            {topWins.length === 0 ? (
              <div className="p-8 text-center text-[#64748B] flex flex-col items-center gap-2">
                <Flame className="w-8 h-8 text-[#22304A]" />
                <p className="text-xs">No top bets recorded in database yet.</p>
                <p className="text-[11px] text-[#475569]">High multiplier cashouts recorded in database will appear here!</p>
              </div>
            ) : (
              topWins.map((row: any) => (
                <div key={row.rank || row.user} className="grid grid-cols-12 px-3 sm:px-4 py-2.5 items-center text-xs hover:bg-[#162035]">
                  <div className="col-span-5 flex items-center gap-2">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${row.rank === 1
                        ? "bg-[#FFB020] text-[#0A0F1E] shadow-md shadow-[#FFB020]/30"
                        : row.rank === 2
                          ? "bg-[#94A3B8] text-[#0A0F1E]"
                          : row.rank === 3
                            ? "bg-[#B45309] text-white"
                            : "bg-[#1E293B] text-[#64748B]"
                        }`}
                    >
                      {row.rank}
                    </span>
                    <div>
                      <p className="font-bold text-white text-[11px]">{row.user}</p>
                      <p className="text-[9px] text-[#64748B]">{row.date}</p>
                    </div>
                  </div>

                  <div className="col-span-3 text-right font-bold text-[#CBD5E1] tabular-nums">
                    {row.bet.toLocaleString()}
                  </div>

                  <div className="col-span-2 flex justify-center">
                    <span className="px-1.5 py-0.5 rounded bg-[#A855F7]/20 text-[#C084FC] border border-[#A855F7]/40 font-extrabold text-[11px] tabular-nums">
                      {row.mult.toFixed(2)}x
                    </span>
                  </div>

                  <div className="col-span-2 text-right font-extrabold text-[#22D67A] tabular-nums text-[11px]">
                    +{(row.payout).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
