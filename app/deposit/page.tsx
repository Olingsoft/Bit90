"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useAuth } from "@/components/AuthProvider";
import { getToken } from "@/lib/auth";
import { API_URL } from "@/lib/api";

const QUICK_AMOUNTS = [100, 500, 1000, 2000, 5000];

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
      <div className="relative overflow-hidden bg-[#121A2E] border border-[#22D67A]/40 rounded-2xl shadow-2xl shadow-[#22D67A]/10">
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
            <p className="text-sm font-semibold text-white leading-snug">Deposit Initiated 🎉</p>
            <p className="text-xs text-[#7C8AA8] mt-0.5 leading-relaxed">{message}</p>
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
        <div className="h-0.5 bg-[#0D1424]">
          <div
            className="h-full bg-[#22D67A]/60 transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Progress label */}
        <div className="px-4 py-2 flex items-center gap-1.5 text-[11px] text-[#7C8AA8]">
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
  const { user, token, login, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState<number | "">(500);
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
      router.replace("/login?from=/deposit");
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

  // Poll transaction status
  useEffect(() => {
    if (!transactionId || !isPolling) {
      console.log("Polling skipped - transactionId:", transactionId, "isPolling:", isPolling);
      return;
    }

    console.log("Starting transaction polling for:", transactionId);

    const pollInterval = setInterval(async () => {
      try {
        console.log("Polling transaction status...");
        const activeToken = token || getToken();
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (activeToken) {
          headers["Authorization"] = `Bearer ${activeToken}`;
        }

        const res = await fetch(`${API_URL}users/transactions`, {
          method: "GET",
          headers,
        });

        console.log("Transactions API response status:", res.status);

        if (res.ok) {
          const transactions = await res.json();
          console.log("Fetched transactions:", transactions.length);
          const transaction = transactions.find((t: any) => t._id === transactionId || t.id === transactionId);

          console.log("Found transaction:", transaction ? transaction.status : "not found");

          if (transaction) {
            if (transaction.status === 'completed') {
              console.log("Transaction completed successfully!");
              setIsPolling(false);
              setToast({
                message: "Deposit completed successfully!",
                balance: transaction.balanceAfter,
              });
            } else if (transaction.status === 'failed') {
              console.log("Transaction failed");
              setIsPolling(false);
              setStatus({
                type: "error",
                message: "Transaction failed. Please try again.",
              });
              setToast(null);
            } else {
              console.log("Transaction still pending:", transaction.status);
            }
          }
        } else {
          console.error("Failed to fetch transactions:", res.status);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000); // Poll every 3 seconds

    return () => {
      console.log("Clearing polling interval");
      clearInterval(pollInterval);
    };
  }, [transactionId, isPolling, token]);

  // While auth is hydrating, show a full-screen spinner so the page
  // content never flashes to an unauthenticated visitor.
  if (authLoading || !user) {
    return (
      <div className="min-h-screen w-full bg-[#0A0F1E] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#22D67A] border-t-transparent animate-spin" />
      </div>
    );
  }

  const handleQuickAmount = (val: number) => {
    setAmount(val);
  };

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
      className="min-h-screen w-full bg-[#0A0F1E] text-[#E7ECF6]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Success toast — mounts when deposit succeeds */}
      {toast && (
        <SuccessToast
          message={toast.message}
          balance={toast.balance}
          isPolling={isPolling}
          onDone={() => router.push("/aviator")}
        />
      )}

      <Header query={query} setQuery={setQuery} />

      <main className="max-w-xl mx-auto p-3 sm:p-6 rise">
        {/* Title Section */}
        <div className="mb-6 text-center sm:text-left">
          <h1
            className="text-2xl sm:text-3xl font-bold text-white tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Deposit Funds
          </h1>
          <p className="text-sm text-[#7C8AA8] mt-1">
            Instant automatic top-up via M-PESA Express (STK Push)
          </p>
        </div>

        {/* Deposit Card */}
        <div className="bg-[#121A2E] rounded-2xl p-4 sm:p-6 border border-[#22304A] shadow-xl">
          <form onSubmit={handleDeposit} className="space-y-5">
            {/* Phone Number Field */}
            <div>
              <label className="block text-xs uppercase tracking-wide text-[#7C8AA8] font-semibold mb-2">
                M-PESA Phone Number
              </label>
              <div className="relative flex items-center bg-[#0D1424] rounded-xl border border-[#22304A] focus-within:border-[#22D67A] transition-colors overflow-hidden">
                <span className="pl-4 pr-2 text-sm font-semibold text-[#7C8AA8] select-none">
                  +254
                </span>
                <input
                  type="tel"
                  placeholder="712 345 678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-transparent py-3.5 pr-4 text-white text-base outline-none font-medium placeholder-[#3A4A6B]"
                  required
                />
              </div>
            </div>

            {/* Amount Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs uppercase tracking-wide text-[#7C8AA8] font-semibold">
                  Deposit Amount (KSh)
                </label>
                <span className="text-xs text-[#7C8AA8]">Min: KSh 10</span>
              </div>
              <div className="relative flex items-center bg-[#0D1424] rounded-xl border border-[#22304A] focus-within:border-[#22D67A] transition-colors">
                <span className="pl-4 text-base font-bold text-[#22D67A] select-none">
                  KSh
                </span>
                <input
                  type="number"
                  placeholder="0.00"
                  min="10"
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value ? Number(e.target.value) : "")
                  }
                  className="w-full bg-transparent py-3.5 px-3 text-white text-xl font-bold outline-none tabular-nums"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  required
                />
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2 mt-3">
                {QUICK_AMOUNTS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleQuickAmount(val)}
                    className={`py-2 rounded-lg text-xs font-semibold border transition-all ${amount === val
                        ? "bg-[#22D67A]/20 border-[#22D67A] text-[#22D67A]"
                        : "bg-[#0D1424] border-[#22304A] text-[#7C8AA8] hover:text-white hover:border-[#3A4A6B]"
                      }`}
                  >
                    +{val}
                  </button>
                ))}
              </div>
            </div>

            {/* M-PESA Info Banner */}
            <div className="flex items-start gap-3 bg-[#0D1424] p-3.5 rounded-xl border border-[#22304A]">
              <div className="w-8 h-8 rounded-lg bg-[#22D67A]/10 border border-[#22D67A]/30 flex items-center justify-center shrink-0">
                <span className="text-[#22D67A] text-xs font-bold">M</span>
              </div>
              <div className="text-xs text-[#7C8AA8] leading-relaxed">
                You will receive an <span className="text-white font-medium">M-PESA prompt</span> on your phone asking to enter your PIN to authorize the payment.
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={authLoading || isLoading || !phone || !amount}
              className="w-full bg-[#22D67A] hover:bg-[#1CBE6B] disabled:bg-[#1a382b] disabled:text-[#4A7A64] text-[#0A0F1E] font-bold text-base py-4 rounded-xl transition duration-150 flex items-center justify-center gap-2 disabled:cursor-not-allowed shadow-lg shadow-[#22D67A]/10"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-[#0A0F1E]" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Sending Prompt...</span>
                </>
              ) : (
                <span>Complete Deposit · KSh {amount || 0}</span>
              )}
            </button>
          </form>

          {/* Error Message */}
          {status.type === "error" && status.message && (
            <div className="mt-4 p-3.5 rounded-xl text-center text-sm font-semibold border rise bg-[#FF4757]/10 border-[#FF4757]/30 text-[#FF4757]">
              {status.message}
            </div>
          )}
        </div>

        {/* Security / Help Note */}
        <p className="text-center text-xs text-[#7C8AA8] mt-6">
          Encrypted &amp; direct integration with Safaricom M-PESA API.
        </p>
      </main>
    </div>
  );
}