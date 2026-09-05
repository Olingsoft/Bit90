"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { useAuth } from "@/components/AuthProvider";
import { getToken } from "@/lib/auth";
import { API_URL } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Transaction {
  _id: string;
  type: "deposit" | "withdrawal" | string;
  amount: number;
  status: "completed" | "pending" | "rejected" | "on_hold" | string;
  balanceBefore: number;
  balanceAfter: number;
  reference: string | null;
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtMoney(n: number) {
  return new Intl.NumberFormat("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function fmtDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-KE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) + " · " + d.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  completed: { label: "Completed", color: "text-[#22D67A]", bg: "bg-[#22D67A]/10 border-[#22D67A]/25" },
  pending:   { label: "Pending",   color: "text-[#F5A623]", bg: "bg-[#F5A623]/10 border-[#F5A623]/25" },
  rejected:  { label: "Rejected",  color: "text-[#FF4757]", bg: "bg-[#FF4757]/10 border-[#FF4757]/25" },
  on_hold:   { label: "On Hold",   color: "text-[#8890A3]", bg: "bg-[#8890A3]/10 border-[#8890A3]/25" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status] ?? { label: status, color: "text-[#8890A3]", bg: "bg-[#8890A3]/10 border-[#8890A3]/25" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.color} ${cfg.bg}`}>
      {cfg.label}
    </span>
  );
}

// ─── Transaction Row ──────────────────────────────────────────────────────────
function TxRow({ tx }: { tx: Transaction }) {
  const isDeposit = tx.type === "deposit";
  const sign = isDeposit ? "+" : "−";
  const amountColor = isDeposit ? "text-[#22D67A]" : "text-[#FF4757]";

  return (
    <div className="flex items-center gap-3 px-4 py-3.5 hover:bg-[#F9F9F9] transition-colors border-b border-[#E5E5E5] last:border-0 group">
      {/* Icon */}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
        isDeposit
          ? "bg-[#22D67A]/10 border border-[#22D67A]/20"
          : "bg-[#FF4757]/10 border border-[#FF4757]/20"
      }`}>
        {isDeposit ? (
          <svg className="w-4 h-4 text-[#22D67A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-[#FF4757]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-[#1A1A1A] capitalize">{tx.type}</span>
          <StatusBadge status={tx.status} />
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {tx.reference && (
            <span className="text-[11px] font-mono text-[#666666]">{tx.reference}</span>
          )}
          <span className="text-[11px] text-[#666666]">{fmtDate(tx.createdAt)}</span>
        </div>
      </div>

      {/* Amount + Balance change */}
      <div className="text-right shrink-0">
        <p className={`text-[14px] font-bold tabular-nums ${amountColor}`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {sign} KSh {fmtMoney(tx.amount)}
        </p>
        <p className="text-[11px] text-[#666666] mt-0.5 tabular-nums">
          → KSh {fmtMoney(tx.balanceAfter)}
        </p>
      </div>
    </div>
  );
}

// ─── Skeleton loader row ──────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#E5E5E5] animate-pulse">
      <div className="w-9 h-9 rounded-xl bg-[#E5E5E5] shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-[#E5E5E5] rounded w-1/3" />
        <div className="h-2.5 bg-[#E5E5E5] rounded w-1/2" />
      </div>
      <div className="text-right space-y-2">
        <div className="h-3.5 bg-[#E5E5E5] rounded w-24" />
        <div className="h-2.5 bg-[#E5E5E5] rounded w-16 ml-auto" />
      </div>
    </div>
  );
}

// ─── Filter Tab ───────────────────────────────────────────────────────────────
type Filter = "all" | "deposit" | "withdrawal";

function FilterTab({ active, label, count, onClick }: {
  active: boolean; label: string; count?: number; onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
        active
          ? "bg-[#F5A623]/15 border border-[#F5A623]/40 text-[#F5A623]"
          : "bg-transparent border border-transparent text-[#666666] hover:text-[#1A1A1A] hover:bg-[#F9F9F9]"
      }`}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${active ? "bg-[#F5A623]/20 text-[#F5A623]" : "bg-[#E5E5E5] text-[#666666]"}`}>
          {count}
        </span>
      )}
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AccountPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  // Auth guard
  useEffect(() => {
    if (typeof window !== "undefined" && !getToken()) {
      router.push("/login");
    }
  }, [router]);

  const loadTransactions = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}users/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data: Transaction[] = await res.json();
      setTransactions(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Derived stats
  const totalDeposits = transactions.filter((t) => t.type === "deposit" && t.status === "completed").reduce((s, t) => s + t.amount, 0);
  const totalWithdrawals = transactions.filter((t) => t.type === "withdrawal").reduce((s, t) => s + t.amount, 0);
  const pendingWithdrawals = transactions.filter((t) => t.type === "withdrawal" && t.status === "pending").length;

  // Filtered list
  const filtered = transactions.filter((t) => {
    if (filter === "deposit") return t.type === "deposit";
    if (filter === "withdrawal") return t.type === "withdrawal";
    return true;
  });

  // Initials from phone
  const initials = user?.phone ? user.phone.slice(-2) : "?";

  return (
    <div className="min-h-screen bg-[#F8F8F8] text-[#1A1A1A]">
      <Header query={query} setQuery={setQuery} />

      <main className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-[12px] text-[#666666] hover:text-[#1A1A1A] transition-colors mb-7">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>

        {/* ── Profile Card ─────────────────────────────────────────── */}
        <div className="rounded-2xl border border-[#E5E5E5] bg-[#FFFFFF] overflow-hidden mb-5 shadow-lg">
          {/* Banner gradient */}
          <div className="h-20 bg-gradient-to-br from-[#F5A623]/20 via-[#F5F5F5] to-[#FFFFFF] relative">
            <div className="absolute inset-0 opacity-30"
              style={{ backgroundImage: "radial-gradient(ellipse at 30% 50%, #F5A623 0%, transparent 60%)" }}
            />
          </div>

          <div className="px-5 pb-5">
            {/* Avatar — offset over banner */}
            <div className="flex items-end justify-between -mt-8 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F5A623] to-[#C8850F] border-4 border-[#FFFFFF] flex items-center justify-center shadow-lg shadow-[#F5A623]/20">
                <span className="text-[#FFFFFF] font-black text-lg tracking-tight">{initials}</span>
              </div>
              <div className="flex gap-2 mb-1">
                <Link
                  href="/deposit"
                  className="px-3.5 py-1.5 rounded-lg bg-[#F5A623] hover:bg-[#E0961C] transition-colors text-[#FFFFFF] text-[12px] font-bold"
                >
                  Deposit
                </Link>
                <Link
                  href="/withdraw"
                  className="px-3.5 py-1.5 rounded-lg bg-[#22D67A]/10 hover:bg-[#22D67A]/20 border border-[#22D67A]/30 transition-colors text-[#22D67A] text-[12px] font-bold"
                >
                  Withdraw
                </Link>
              </div>
            </div>

            <h1 className="text-[15px] font-bold text-[#1A1A1A]">{user?.phone ?? "—"}</h1>
            <p className="text-[12px] text-[#666666] mt-0.5">Standard Account</p>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { label: "Balance", value: `KSh ${fmtMoney(user?.balance ?? 0)}`, color: "text-[#22D67A]" },
                { label: "Total Deposits", value: `KSh ${fmtMoney(totalDeposits)}`, color: "text-[#1A1A1A]" },
                { label: "Total Withdrawn", value: `KSh ${fmtMoney(totalWithdrawals)}`, color: "text-[#1A1A1A]" },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-xl bg-[#F9F9F9] border border-[#E5E5E5] px-3 py-2.5 text-center">
                  <p className="text-[10px] text-[#666666] uppercase tracking-wider font-semibold">{label}</p>
                  <p className={`text-[13px] font-bold mt-1 tabular-nums ${color}`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Transactions Card ─────────────────────────────────────── */}
        <div className="rounded-2xl border border-[#E5E5E5] bg-[#FFFFFF] overflow-hidden shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[#E5E5E5]">
            <div>
              <h2 className="text-[14px] font-bold text-[#1A1A1A]">Transaction History</h2>
              {!loading && (
                <p className="text-[11px] text-[#666666] mt-0.5">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => { setLoading(true); loadTransactions(); }}
              title="Refresh"
              className="w-7 h-7 rounded-lg bg-[#F9F9F9] border border-[#E5E5E5] flex items-center justify-center text-[#666666] hover:text-[#1A1A1A] hover:border-[#F5A623]/40 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 px-4 py-2.5 border-b border-[#E5E5E5]">
            <FilterTab active={filter === "all"} label="All" count={transactions.length} onClick={() => setFilter("all")} />
            <FilterTab active={filter === "deposit"} label="Deposits" count={transactions.filter((t) => t.type === "deposit").length} onClick={() => setFilter("deposit")} />
            <FilterTab
              active={filter === "withdrawal"}
              label="Withdrawals"
              count={transactions.filter((t) => t.type === "withdrawal").length}
              onClick={() => setFilter("withdrawal")}
            />
            {pendingWithdrawals > 0 && (
              <span className="ml-auto self-center text-[11px] text-[#F5A623] bg-[#F5A623]/10 border border-[#F5A623]/20 px-2 py-0.5 rounded-full font-medium">
                {pendingWithdrawals} pending
              </span>
            )}
          </div>

          {/* Content */}
          {loading ? (
            <div className="divide-y divide-[#E5E5E5]">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 py-14 text-center px-6">
              <div className="w-12 h-12 rounded-2xl bg-[#FF4757]/10 border border-[#FF4757]/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-[#FF4757]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-[13px] font-semibold text-[#1A1A1A]">Failed to load transactions</p>
              <p className="text-[12px] text-[#666666]">{error}</p>
              <button
                onClick={() => { setLoading(true); setError(null); loadTransactions(); }}
                className="mt-2 px-4 py-1.5 rounded-lg bg-[#F9F9F9] border border-[#E5E5E5] hover:border-[#F5A623]/40 text-[12px] text-[#1A1A1A] transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-14 text-center px-6">
              <div className="w-12 h-12 rounded-2xl bg-[#F9F9F9] border border-[#E5E5E5] flex items-center justify-center">
                <svg className="w-6 h-6 text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-[13px] font-semibold text-[#1A1A1A]">No transactions yet</p>
              <p className="text-[12px] text-[#666666]">Your deposits and withdrawals will appear here.</p>
              <Link
                href="/deposit"
                className="mt-2 px-4 py-1.5 rounded-lg bg-[#F5A623] hover:bg-[#E0961C] text-[12px] font-semibold text-[#FFFFFF] transition-colors"
              >
                Make a Deposit
              </Link>
            </div>
          ) : (
            <div>
              {filtered.map((tx) => <TxRow key={tx._id} tx={tx} />)}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
