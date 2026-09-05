"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useAuth } from "@/components/AuthProvider";
import { getToken } from "@/lib/auth";
import { API_URL } from "@/lib/api";
import { withLocale } from "@/lib/locale";


// ─── Toast ────────────────────────────────────────────────────────────────────
interface ToastProps {
  message: string;
  balance?: number;
  isPolling?: boolean;
  onDone: () => void;
}

function SuccessToast({ message, balance, isPolling, onDone }: ToastProps) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const DURATION = 2500;

  useEffect(() => {
    // Trigger enter animation next tick
    const t = setTimeout(() => setVisible(true), 10);

    // Countdown progress bar - only if not polling
    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;
      const pct = Math.max(0, 100 - (elapsed / DURATION) * 100);
      setProgress(pct);
      if (elapsed < DURATION) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    
    if (!isPolling) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      setProgress(100); // Keep progress bar full while polling
    }

    // After DURATION, trigger exit then call onDone (only if not polling)
    timerRef.current = setTimeout(() => {
      if (!isPolling) {
        setVisible(false);
        setTimeout(onDone, 350);
      }
    }, isPolling ? 1000 : DURATION); // Reset timer while polling

    return () => {
      clearTimeout(t);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [onDone, isPolling]);

  return (
    <div
      className="fixed top-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]"
      style={{
        transform: visible ? "translateY(0)" : "translateY(-110%)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.35s cubic-bezier(.22,1,.36,1), opacity 0.35s ease",
      }}
    >
      <div className="relative overflow-hidden bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl shadow-2xl shadow-black/5">
        {/* Top accent line */}
        <div className="h-0.5 w-full bg-gradient-to-r from-[#22D67A] to-[#1CBE6B]" />

        <div className="p-4 flex items-start gap-3">
          {/* Check icon */}
          <div className="w-9 h-9 rounded-xl bg-[#22D67A]/15 border border-[#22D67A]/30 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-[#22D67A]" viewBox="0 0 20 20" fill="none">
              <path
                d="M4 10.5l4.5 4.5 7.5-8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#1A1A1A] leading-snug">
              {isPolling ? "Waiting for M-Pesa..." : "Deposit Successful"}
            </p>
            <p className="text-xs text-[#666666] mt-0.5 leading-relaxed">{message}</p>
            {balance !== undefined && (
              <p className="text-xs font-semibold text-[#22D67A] mt-1">
                New Balance: KSh {balance.toLocaleString()}
              </p>
            )}
          </div>

          {/* Plane icon */}
          <span className="text-lg leading-none">✈️</span>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-[#F5F5F5]">
          <div
            className="h-full bg-[#22D67A]/60 transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Progress label */}
        <div className="px-4 py-2 flex items-center gap-1.5 text-[11px] text-[#666666]">
          {isPolling ? (
            <>
              <svg className="w-3 h-3 animate-spin text-[#22D67A]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Waiting for payment confirmation...
            </>
          ) : (
            <>
              <svg className="w-3 h-3 animate-spin text-[#22D67A]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Redirecting to Aviator...
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DepositPage() {
  const { user, token, updateUser, refreshBalance, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState<number | "">(50);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | ""; message: string }>({
    type: "",
    message: "",
  });
  const [toast, setToast] = useState<{ message: string; balance?: number } | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  // Page-level auth guard — runs as soon as the session has finished loading.
  // Unauthenticated visitors are immediately sent to login.
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(withLocale("/login?from=/deposit"));
    }
  }, [authLoading, user, router]);

  // Pre-fill the phone field from the logged-in user's profile.
  useEffect(() => {
    if (user?.phone) {
      const rawDigits = user.phone.replace(/\D/g, "");
      const cleanLocal = rawDigits.startsWith("254") ? rawDigits.slice(3) : rawDigits;
      setPhone(cleanLocal);
    }
  }, [user]);

  // Poll until M-Pesa reports a final SUCCESS or FAIL. Do not treat "still processing" as failed.
  useEffect(() => {
    if (!transactionId || !isPolling) {
      return;
    }

    let cancelled = false;
    let pollCount = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const applyLiveBalance = (balance: unknown) => {
      const next = Number(balance);
      if (!Number.isFinite(next)) return;
      updateUser({ balance: next });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("bit90:balance-updated"));
      }
    };

    const authHeaders = () => {
      const activeToken = token || getToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (activeToken) headers["Authorization"] = `Bearer ${activeToken}`;
      return headers;
    };

    const tick = async () => {
      if (cancelled) return;
      pollCount += 1;
      const headers = authHeaders();

      try {
        // Query Safaricom only after ~12s, then about every 12s.
        if (pollCount >= 4 && pollCount % 4 === 0) {
          try {
            const verifyRes = await fetch(`${API_URL}users/mpesa/verify`, {
              method: "POST",
              headers,
              body: JSON.stringify({ transactionId }),
            });
            if (verifyRes.ok) {
              const verifyData = await verifyRes.json();
              const tx = verifyData.transaction;
              if (tx?.status === "completed") {
                applyLiveBalance(verifyData.balance ?? tx.balanceAfter);
                await refreshBalance();
                if (cancelled) return;
                setIsPolling(false);
                setStatus({ type: "", message: "" });
                setToast({
                  message: "Deposit completed successfully!",
                  balance: Number(verifyData.balance ?? tx.balanceAfter),
                });
                return;
              }
              // Ignore verify "failed" — STK Query often reports 1037/4999 while PIN is still pending.
            }
          } catch (verifyErr) {
            console.warn("Active verify check error:", verifyErr);
          }
        }

        const statusRes = await fetch(`${API_URL}users/deposits/${transactionId}/status`, {
          method: "GET",
          headers,
          cache: "no-store",
        });

        if (statusRes.ok) {
          const data = await statusRes.json();
          if (data.status === "completed" || data.credited) {
            applyLiveBalance(data.balance);
            await refreshBalance();
            if (cancelled) return;
            setIsPolling(false);
            setStatus({ type: "", message: "" });
            setToast({
              message: "Deposit completed successfully!",
              balance: Number(data.balance),
            });
            return;
          }
          if (data.status === "failed" && data.final === true) {
            if (cancelled) return;
            setIsPolling(false);
            setToast(null);
            setStatus({
              type: "error",
              message: data.resultDesc || "Transaction failed or was cancelled.",
            });
            return;
          }
          // pending / early "failed" while PIN is still being processed — keep waiting
        }
      } catch (err) {
        console.error("Polling error:", err);
      }

      if (!cancelled) {
        timer = setTimeout(tick, 3000);
      }
    };

    void tick();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [transactionId, isPolling, token, updateUser, refreshBalance]);

  // While auth is hydrating, show a full-screen spinner so the page
  // content never flashes to an unauthenticated visitor.
  if (authLoading || !user) {
    return (
      <div className="min-h-screen w-full bg-[#F8F8F8] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#22D67A] border-t-transparent animate-spin" />
      </div>
    );
  }

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !amount || Number(amount) <= 0) return;

    setIsLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const activeToken = token || getToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (activeToken) {
        headers["Authorization"] = `Bearer ${activeToken}`;
      }

      const formattedPhone = phone.startsWith("+")
        ? phone
        : phone.startsWith("254")
          ? `+${phone}`
          : `+254${phone.replace(/^0/, "")}`;

      const res = await fetch(`${API_URL}users/deposit`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          phone: formattedPhone,
          amount: Number(amount),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to send M-Pesa prompt");
      }

      // Store transaction ID for polling
      if (data.transaction?.id) {
        setTransactionId(data.transaction.id);
        setIsPolling(true);
      }

      // Show toast — redirect happens when transaction completes
      setToast({
        message: "M-Pesa prompt sent. Check your phone to enter your PIN and complete the transaction.",
      });
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Deposit failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-[#F8F8F8] text-[#1A1A1A]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Success toast — mounts when deposit succeeds */}
      {toast && (
        <SuccessToast
          message={toast.message}
          balance={toast.balance}
          isPolling={isPolling}
          onDone={() => router.push(withLocale("/aviator"))}
        />
      )}

      <Header query={query} setQuery={setQuery} />

      <main className="max-w-xl mx-auto p-3 sm:p-6 rise">
        {/* Title Section */}
        <div className="mb-6 text-center sm:text-left">
          <h1
            className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Deposit Funds
          </h1>
          <p className="text-sm text-[#666666] mt-1">
            Instant automatic top-up via M-PESA Express (STK Push)
          </p>
        </div>

        {/* Deposit Card */}
        <div className="bg-[#FFFFFF] rounded-2xl p-4 sm:p-6 border border-[#E5E5E5] shadow-sm">
          <form onSubmit={handleDeposit} className="space-y-5">
            {/* Phone Number Field */}
            <div>
              <label className="block text-xs uppercase tracking-wide text-[#666666] font-semibold mb-2">
                M-PESA Phone Number
              </label>
              <div className="relative flex items-center bg-[#F9F9F9] rounded-xl border border-[#E5E5E5] focus-within:border-[#22D67A] transition-colors overflow-hidden">
                <span className="pl-4 pr-2 text-sm font-semibold text-[#666666] select-none">
                  +254
                </span>
                <input
                  type="tel"
                  placeholder="712 345 678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-transparent py-3.5 pr-4 text-[#1A1A1A] text-base outline-none font-medium placeholder-[#999999]"
                  required
                />
              </div>
            </div>

            {/* Amount Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs uppercase tracking-wide text-[#666666] font-semibold">
                  Deposit Amount (KSh)
                </label>
                <span className="text-xs text-[#666666]">Min: KSh 1</span>
              </div>
              <div className="relative flex items-center bg-[#F9F9F9] rounded-xl border border-[#E5E5E5] focus-within:border-[#22D67A] transition-colors">
                <span className="pl-4 text-base font-bold text-[#22D67A] select-none">
                  KSh
                </span>
                <input
                  type="number"
                  placeholder="0.00"
                  min="1"
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value ? Number(e.target.value) : "")
                  }
                  className="w-full bg-transparent py-3.5 px-3 text-[#1A1A1A] text-xl font-bold outline-none tabular-nums"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  required
                />
              </div>

            </div>

            {/* M-PESA Info Banner */}
            <div className="flex items-start gap-3 bg-[#F9F9F9] p-3.5 rounded-xl border border-[#E5E5E5]">
              <div className="w-8 h-8 rounded-lg bg-[#22D67A]/10 border border-[#22D67A]/30 flex items-center justify-center shrink-0">
                <span className="text-[#22D67A] text-xs font-bold">M</span>
              </div>
              <div className="text-xs text-[#666666] leading-relaxed">
                You will receive an <span className="text-[#1A1A1A] font-medium">M-PESA prompt</span> on your phone asking to enter your PIN to authorize the payment.
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={authLoading || isLoading || isPolling || !phone || !amount}
              className="w-full bg-[#22D67A] hover:bg-[#1CBE6B] disabled:bg-[#D1D1D1] disabled:text-[#999999] text-[#FFFFFF] font-bold text-base py-4 rounded-xl transition duration-150 flex items-center justify-center gap-2 disabled:cursor-not-allowed shadow-lg shadow-[#22D67A]/10"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {isLoading || isPolling ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-[#FFFFFF]" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>{isPolling ? "Waiting for confirmation..." : "Sending Prompt..."}</span>
                </>
              ) : (
                <span>Complete Deposit · KSh {amount || 0}</span>
              )}
            </button>
          </form>

          {isPolling && (
            <div className="mt-4 p-3.5 rounded-xl text-center text-sm font-semibold border bg-[#22D67A]/10 border-[#22D67A]/30 text-[#1A1A1A]">
              Transaction is still processing. Enter your M-Pesa PIN and wait here until it succeeds or fails.
            </div>
          )}

          {/* Error Message */}
          {status.type === "error" && status.message && (
            <div className="mt-4 p-3.5 rounded-xl text-center text-sm font-semibold border rise bg-[#FF4757]/10 border-[#FF4757]/30 text-[#FF4757]">
              {status.message}
            </div>
          )}
        </div>

        {/* Security / Help Note */}
        <p className="text-center text-xs text-[#666666] mt-6">
          Encrypted &amp; direct integration with Safaricom M-PESA API.
        </p>
      </main>
    </div>
  );
}