"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { runtime, Plan, BillingStatus } from "@/lib/runtime";
import { Check, ExternalLink, Loader2, Zap } from "lucide-react";
import Link from "next/link";

const PRICES: Record<string, string> = {
  starter: "$49",
  growth: "$149",
  scale: "$349",
  enterprise: "$799",
};

const FEATURES: Record<string, string[]> = {
  starter: ["5 active agents", "All providers supported", "Full message chain log", "Email support"],
  growth: ["20 active agents", "All providers supported", "Full message chain log", "Priority support"],
  scale: ["50 active agents", "All providers supported", "Full message chain log", "Dedicated support"],
  enterprise: ["Unlimited agents", "All providers supported", "Full message chain log", "White-glove onboarding"],
};

export default function BillingPage() {
  const [orgId, setOrgId] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("corpai_org_id");
    setOrgId(id);
    Promise.all([
      runtime.getPlans().then((r) => setPlans(r.plans)),
      id ? runtime.getBillingStatus(id).then(setStatus).catch(() => {}) : Promise.resolve(),
    ]).finally(() => setLoading(false));
  }, []);

  async function subscribe(planId: string) {
    if (!orgId) return;
    setCheckingOut(planId);
    try {
      const { url } = await runtime.createCheckout(orgId, planId);
      window.location.href = url;
    } catch (e) {
      alert((e as Error).message);
      setCheckingOut(null);
    }
  }

  async function manageSubscription() {
    if (!orgId) return;
    try {
      const { url } = await runtime.openPortal(orgId);
      window.open(url, "_blank");
    } catch (e) {
      alert((e as Error).message);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-400" size={32} />
      </div>
    );
  }

  const isActive = status?.subscription_status === "active";

  return (
    <main className="min-h-screen bg-[#0a0a0b] text-white px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">
            <Zap size={14} /> Pricing
          </div>
          <h1 className="text-5xl font-bold mb-3">Hire your AI team</h1>
          <p className="text-white/40 mb-4 text-lg">
            Pay per agent seat. Switch providers anytime. Cancel anytime.
          </p>

          {isActive && (
            <div className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-emerald-400 font-bold">Active subscription</span>
                <span className="text-white/40 text-sm ml-3">{status?.active_agent_seats} agent seats</span>
              </div>
              <button
                onClick={manageSubscription}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm hover:bg-white/10 transition-all"
              >
                Manage <ExternalLink size={14} />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {(plans.length > 0
              ? plans
              : ["starter", "growth", "scale", "enterprise"].map((id) => ({ id, label: id, seats: 0 }))
            ).map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative p-6 rounded-3xl border flex flex-col ${
                  plan.id === "growth"
                    ? "border-blue-500 bg-blue-500/5"
                    : "border-white/10 bg-white/[0.02]"
                }`}
              >
                {plan.id === "growth" && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 rounded-full text-xs font-bold">
                    Most Popular
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="text-lg font-bold capitalize mb-1">{plan.id}</h3>
                  <div className="text-3xl font-bold">{PRICES[plan.id] ?? "—"}<span className="text-sm text-white/40">/mo</span></div>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {(FEATURES[plan.id] ?? []).map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                      <Check size={14} className="text-blue-400 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => subscribe(plan.id)}
                  disabled={!!checkingOut || isActive}
                  className={`w-full py-3 rounded-xl font-bold transition-all ${
                    plan.id === "growth"
                      ? "bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                      : "bg-white/5 border border-white/10 hover:bg-white/10"
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  {checkingOut === plan.id ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Subscribe"}
                </button>
              </motion.div>
            ))}
          </div>

          {!orgId && (
            <div className="text-center">
              <p className="text-white/40 mb-4">Don&apos;t have an org yet?</p>
              <Link href="/start" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all">
                Get Started
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
