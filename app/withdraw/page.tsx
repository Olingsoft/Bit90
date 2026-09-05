"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { useAuth } from "@/components/AuthProvider";
import { getToken } from "@/lib/auth";
import { API_URL } from "@/lib/api";
import { withLocale } from "@/lib/locale";

const QUICK_AMOUNTS = [100, 500, 1000, 2000, 5000];

// ─── Success Toast ────────────────────────────────────────────────────────────
interface ToastProps {
  message: string;
  newBalance: number;
  reference: string;
  onDone: () => void;
}

function SuccessToast({ message, newBalance, reference, onDone }: ToastProps) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const DURATION = 3000;

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);

    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;
      const pct = Math.max(0, 100 - (elapsed / DURATION) * 100);
      setProgress(pct);
      if (elapsed < DURATION) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    timerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 350);
    }, DURATION);

    return () => {
      clearTimeout(t);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [onDone]);

  function fmt(n: number) {
    return new Intl.NumberFormat("en-KE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  }

  return (
    <div
      className="fixed top-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]"
      style={{
        transform: visible ? "translateY(0)" : "translateY(-110%)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.35s cubic-bezier(.22,1,.36,1), opacity 0.35s ease",
      }}
    >
      <div className="relative overflow-hidden bg-[#0D1017] border border-[#22D67A]/40 rounded-2xl shadow-2xl shadow-[#22D67A]/10">
        <div className="h-0.5 w-full bg-gradient-to-r from-[#22D67A] to-[#1CBE6B]" />

        <div className="p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#22D67A]/15 border border-[#22D67A]/30 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-[#22D67A]" viewBox="0 0 20 20" fill="none">
              <path d="M4 10.5l4.5 4.5 7.5-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[#ECEEF3]">{message}</p>
            <p className="text-[11px] text-[#8890A3] mt-0.5">Ref: {reference}</p>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="text-[11px] text-[#7C8AA8]">New Balance</span>
              <span className="text-[13px] font-bold text-[#22D67A]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                KSh {fmt(newBalance)}
              </span>
            </div>
          </div>
        </div>

        {/* progress bar */}
        <div className="h-0.5 bg-[#22304A]">
          <div
            className="h-full bg-gradient-to-r from-[#22D67A] to-[#1CBE6B] transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Error Toast ─────────────────────────────────────────────────────────────
function ErrorToast({ message, onDone }: { message: string; onDone: () => void }) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    timerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 350);
    }, 4000);
    return () => {
      clearTimeout(t);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [onDone]);

  return (
    <div
      className="fixed top-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]"
      style={{
        transform: visible ? "translateY(0)" : "translateY(-110%)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.35s cubic-bezier(.22,1,.36,1), opacity 0.35s ease",
      }}
    >
      <div className="relative overflow-hidden bg-[#0D1017] border border-[#FF4757]/40 rounded-2xl shadow-2xl shadow-[#FF4757]/10">
        <div className="h-0.5 w-full bg-gradient-to-r from-[#FF4757] to-[#E63946]" />
        <div className="p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FF4757]/15 border border-[#FF4757]/30 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-[#FF4757]" viewBox="0 0 20 20" fill="none">
              <path d="M10 6v4m0 4h.01M4.93 4.93l10.14 10.14M10 2a8 8 0 100 16A8 8 0 0010 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[#ECEEF3]">Withdrawal Failed</p>
            <p className="text-[12px] text-[#8890A3] mt-0.5">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function WithdrawPage() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [query, setQuery] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{
    message: string;
    newBalance: number;
    reference: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (typeof window !== "undefined" && !getToken()) {
      router.push(withLocale("/login"));
    }
  }, [router]);

  function formatBalance(n?: number) {
    return new Intl.NumberFormat("en-KE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n ?? 0);
  }

  const numAmount = parseFloat(amount) || 0;
  const balance = user?.balance ?? 0;
  const isAmountValid = numAmount >= 50 && numAmount <= balance;
  const amountError =
    amount && !isAmountValid
      ? numAmount < 50
        ? "Minimum withdrawal is KSh 50"
        : `Amount exceeds your balance of KSh ${formatBalance(balance)}`
      : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isAmountValid || submitting) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const token = getToken();
      const res = await fetch(`${API_URL}users/withdraw`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ amount: numAmount }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Withdrawal failed");
      }

      // Update session balance so header reflects new balance
      if (user && data.user) {
        const storedToken = getToken();
        if (storedToken) {
          login(storedToken, { ...user, balance: data.user.balance });
        }
      }

      setSuccessData({
        message: "Withdrawal request submitted!",
        newBalance: data.user?.balance ?? 0,
        reference: data.transaction?.reference ?? "",
      });
      setAmount("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  }

  const handleSuccessDone = useCallback(() => {
    setSuccessData(null);
    router.push(withLocale("/"));
  }, [router]);

  const handleErrorDone = useCallback(() => {
    setErrorMsg(null);
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0E14] text-[#ECEEF3]">
      <Header query={query} setQuery={setQuery} />

      {/* Toast notifications */}
      {successData && (
        <SuccessToast
          message={successData.message}
          newBalance={successData.newBalance}
          reference={successData.reference}
          onDone={handleSuccessDone}
        />
      )}
      {errorMsg && <ErrorToast message={errorMsg} onDone={handleErrorDone} />}

      <main className="max-w-lg mx-auto px-4 py-10 sm:py-14">
        {/* Back link */}
        <Link href={withLocale("/")} className="inline-flex items-center gap-2 text-[13px] text-[#8890A3] hover:text-[#ECEEF3] transition-colors mb-8">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>

        {/* Card */}
        <div className="rounded-2xl border border-[#242832] bg-[#0D1017] overflow-hidden shadow-2xl shadow-black/40">
          {/* Card header */}
          <div className="relative p-6 pb-5 border-b border-[#242832] bg-gradient-to-br from-[#0D1017] to-[#12151C]">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#22D67A] via-[#22D67A]/60 to-transparent" />
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-[#22D67A]/10 border border-[#22D67A]/25 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#22D67A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#ECEEF3]">Withdraw Funds</h1>
                <p className="text-[12px] text-[#8890A3]">Request a payout to M-Pesa</p>
              </div>
            </div>
          </div>

          {/* Balance display */}
          <div className="mx-6 mt-5 rounded-xl bg-[#0B0E14] border border-[#22304A] px-4 py-3 flex items-center justify-between">
            <span className="text-[12px] text-[#7C8AA8] font-medium">Available Balance</span>
            <span
              className="text-[15px] font-bold tabular-nums text-[#22D67A]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              KSh {formatBalance(balance)}
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 pt-5 space-y-5">
            {/* Quick amounts */}
            <div>
              <p className="text-[11px] font-semibold text-[#8890A3] uppercase tracking-wider mb-2.5">Quick Select</p>
              <div className="grid grid-cols-5 gap-2">
                {QUICK_AMOUNTS.map((qa) => (
                  <button
                    key={qa}
                    type="button"
                    onClick={() => setAmount(String(qa))}
                    disabled={qa > balance}
                    className={`py-2 rounded-lg text-[12px] font-semibold border transition-all ${
                      numAmount === qa
                        ? "bg-[#22D67A]/15 border-[#22D67A]/60 text-[#22D67A] shadow-[0_0_12px_rgba(34,214,122,0.12)]"
                        : qa > balance
                        ? "bg-[#12151C]/40 border-[#242832]/50 text-[#444] cursor-not-allowed"
                        : "bg-[#12151C] border-[#242832] text-[#8890A3] hover:border-[#22D67A]/40 hover:text-[#ECEEF3]"
                    }`}
                  >
                    {qa >= 1000 ? `${qa / 1000}K` : qa}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount input */}
            <div>
              <label htmlFor="withdraw-amount" className="block text-[11px] font-semibold text-[#8890A3] uppercase tracking-wider mb-2">
                Amount (KSh)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7C8AA8] text-[13px] font-medium select-none">KSh</span>
                <input
                  id="withdraw-amount"
                  type="number"
                  inputMode="decimal"
                  min={50}
                  max={balance}
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className={`w-full bg-[#12151C] border rounded-xl pl-12 pr-4 py-3.5 text-[15px] font-semibold text-[#ECEEF3] outline-none placeholder:text-[#3A4055] transition-colors ${
                    amountError
                      ? "border-[#FF4757]/60 focus:border-[#FF4757]"
                      : "border-[#242832] focus:border-[#22D67A]/60"
                  }`}
                />
              </div>
              {amountError && (
                <p className="mt-1.5 text-[12px] text-[#FF4757] flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" />
                  </svg>
                  {amountError}
                </p>
              )}
            </div>

            {/* Phone (read-only) */}
            <div>
              <label className="block text-[11px] font-semibold text-[#8890A3] uppercase tracking-wider mb-2">
                M-Pesa Number
              </label>
              <div className="flex items-center gap-2.5 bg-[#12151C] border border-[#242832] rounded-xl px-3.5 py-3.5">
                <svg className="w-4 h-4 text-[#7C8AA8] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-[14px] font-medium text-[#ECEEF3]">{user?.phone ?? "—"}</span>
                <span className="ml-auto text-[11px] text-[#22D67A] bg-[#22D67A]/10 border border-[#22D67A]/20 px-2 py-0.5 rounded-full">Verified</span>
              </div>
            </div>

            {/* Info notice */}
            <div className="flex items-start gap-2.5 rounded-xl bg-[#F5A623]/5 border border-[#F5A623]/20 px-4 py-3">
              <svg className="w-4 h-4 text-[#F5A623] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" />
              </svg>
              <p className="text-[12px] text-[#8890A3] leading-relaxed">
                Withdrawal requests are processed by the admin team. Funds are typically sent within <span className="text-[#F5A623] font-medium">24 hours</span>. Minimum withdrawal is <span className="text-[#ECEEF3] font-medium">KSh 50</span>.
              </p>
            </div>

            {/* Summary row */}
            {numAmount >= 50 && numAmount <= balance && (
              <div className="rounded-xl border border-[#22D67A]/20 bg-[#22D67A]/5 px-4 py-3 space-y-1.5">
                <div className="flex justify-between text-[12px]">
                  <span className="text-[#8890A3]">You will receive</span>
                  <span className="font-bold text-[#22D67A]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    KSh {formatBalance(numAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-[#8890A3]">Balance after withdrawal</span>
                  <span className="font-semibold text-[#ECEEF3]">KSh {formatBalance(balance - numAmount)}</span>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              id="withdraw-submit-btn"
              type="submit"
              disabled={!isAmountValid || submitting}
              className={`w-full py-3.5 rounded-xl font-bold text-[14px] transition-all flex items-center justify-center gap-2 ${
                isAmountValid && !submitting
                  ? "bg-gradient-to-r from-[#22D67A] to-[#1CBE6B] hover:from-[#1CBE6B] hover:to-[#22D67A] text-[#0B0E14] shadow-lg shadow-[#22D67A]/20 hover:shadow-[#22D67A]/30 active:scale-[0.98]"
                  : "bg-[#1A1F2A] border border-[#242832] text-[#444] cursor-not-allowed"
              }`}
            >
              {submitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  Withdraw KSh {numAmount >= 50 ? formatBalance(numAmount) : "—"}
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
