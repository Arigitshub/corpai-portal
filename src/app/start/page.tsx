"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { runtime, Provider } from "@/lib/runtime";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, ChevronRight, Zap } from "lucide-react";

const PROVIDER_LABELS: Record<string, string> = {
  "codex-cli": "OpenAI Codex CLI",
  "gemini-cli": "Google Gemini CLI",
  "claude-code": "Claude Code CLI",
  "opencode": "OpenCode CLI",
  "openrouter": "OpenRouter (100+ models)",
  "anthropic": "Anthropic API",
  "openai": "OpenAI API",
  "ollama": "Ollama (local)",
};

export default function StartPage() {
  const router = useRouter();
  const [step, setStep] = useState<"details" | "provider" | "creating">("details");
  const [providers, setProviders] = useState<Provider[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    provider: "openrouter",
    model: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    runtime.listProviders().then((r) => setProviders(r.providers)).catch(() => {});
  }, []);

  async function handleCreate() {
    setStep("creating");
    setError("");
    try {
      const org = await runtime.createOrg({
        name: form.name,
        ownerEmail: form.email,
        rolesSource: "https://github.com/Arigitshub/CorpAI", // default spec
        providerConfig: {
          provider: form.provider,
          ...(form.model ? { model: form.model } : {}),
        },
      });
      localStorage.setItem("corpai_org_id", org.id);
      localStorage.setItem("corpai_org_name", org.name);
      router.push("/billing");
    } catch (e) {
      setError((e as Error).message);
      setStep("provider");
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0b] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">
            <Zap size={14} /> Deploy Your AI Company
          </div>
          <h1 className="text-4xl font-bold mb-2">Get Started</h1>
          <p className="text-white/40 mb-10">
            Set up your CorpAI team in 2 steps. Pick a provider, subscribe, and your AI agents are live.
          </p>

          {/* Step 1: Details */}
          {(step === "details" || step === "provider") && (
            <div className="space-y-4 mb-8">
              <div>
                <label className="text-sm text-white/60 mb-1 block">Company name</label>
                <input
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-blue-500"
                  placeholder="Acme AI Inc."
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1 block">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-blue-500"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              {step === "provider" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <label className="text-sm text-white/60 mb-2 block">AI Provider</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(providers.length > 0
                      ? providers
                      : Object.keys(PROVIDER_LABELS).map((id) => ({ id, displayName: PROVIDER_LABELS[id], type: "api" as const }))
                    ).map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setForm({ ...form, provider: p.id })}
                        className={`p-3 rounded-xl border text-left text-sm transition-all ${
                          form.provider === p.id
                            ? "border-blue-500 bg-blue-500/10 text-white"
                            : "border-white/10 bg-white/5 text-white/60 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{PROVIDER_LABELS[p.id] ?? p.id}</span>
                          {form.provider === p.id && <Check size={14} className="text-blue-400" />}
                        </div>
                        <span className="text-[10px] uppercase tracking-wider text-white/30">{p.type}</span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-3">
                    <label className="text-sm text-white/60 mb-1 block">Model (optional override)</label>
                    <input
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-blue-500"
                      placeholder="e.g. o4-mini, gemini-2.5-pro, claude-sonnet-4-6"
                      value={form.model}
                      onChange={(e) => setForm({ ...form, model: e.target.value })}
                    />
                  </div>
                </motion.div>
              )}

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                onClick={() => {
                  if (!form.name || !form.email) {
                    setError("Name and email are required");
                    return;
                  }
                  setError("");
                  if (step === "details") setStep("provider");
                  else handleCreate();
                }}
                className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)]"
              >
                {step === "details" ? "Choose Provider" : "Create My AI Company"}
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          {step === "creating" && (
            <div className="flex flex-col items-center py-12 gap-4">
              <Loader2 className="animate-spin text-blue-400" size={32} />
              <p className="text-white/40">Setting up your AI company...</p>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
