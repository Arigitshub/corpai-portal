"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { runtime, Task, MessageHop } from "@/lib/runtime";
import { Loader2, Send, ArrowUpRight, ArrowDownRight, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

export default function TasksPage() {
  const [orgId] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem("corpai_org_id") : null
  );
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [chain, setChain] = useState<MessageHop[]>([]);
  const [loadingChain, setLoadingChain] = useState(false);
  const [form, setForm] = useState({ targetRole: "", task: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const loadTasks = useCallback(async () => {
    if (!orgId) return;
    const r = await runtime.listTasks(orgId).catch(() => ({ tasks: [] }));
    setTasks(r.tasks);
  }, [orgId]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  async function selectTask(task: Task) {
    setSelectedTask(task);
    if (task.status === "complete" || task.status === "failed") {
      setLoadingChain(true);
      const r = await runtime.getTask(task.id).catch(() => ({ task, chain: [] }));
      setChain(r.chain ?? []);
      setLoadingChain(false);
    }
  }

  async function submitTask() {
    if (!orgId || !form.targetRole || !form.task) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      await runtime.submitTask({ orgId, targetRole: form.targetRole, task: form.task });
      setForm({ targetRole: "", task: "" });
      await loadTasks();
    } catch (e) {
      setSubmitError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0b] text-white px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-1">Agent Tasks</p>
            <h1 className="text-4xl font-bold">Task Runner</h1>
          </div>
          <Link href="/dashboard" className="text-sm text-white/40 hover:text-white transition-colors">
            ← Dashboard
          </Link>
        </div>

        {!orgId ? (
          <div className="text-center py-20">
            <p className="text-white/40 mb-4">No org found.</p>
            <Link href="/start" className="px-6 py-3 bg-blue-600 rounded-xl font-bold">Get Started</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Submit form */}
            <div>
              <h2 className="text-lg font-semibold mb-4">New Task</h2>
              <div className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl space-y-4">
                <div>
                  <label className="text-sm text-white/60 mb-1 block">Target Agent Role</label>
                  <input
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-blue-500"
                    placeholder="e.g. Content Writer, Marketing Director"
                    value={form.targetRole}
                    onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-1 block">Task</label>
                  <textarea
                    rows={5}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-blue-500 resize-none"
                    placeholder="Write a blog post about the benefits of AI agent organizations..."
                    value={form.task}
                    onChange={(e) => setForm({ ...form, task: e.target.value })}
                  />
                </div>
                {submitError && <p className="text-red-400 text-sm">{submitError}</p>}
                <button
                  onClick={submitTask}
                  disabled={submitting || !form.targetRole || !form.task}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? <Loader2 className="animate-spin" size={18} /> : <><Send size={16} /> Dispatch Task</>}
                </button>
              </div>

              {/* Task list */}
              <h2 className="text-lg font-semibold mt-8 mb-4">Recent Tasks</h2>
              <div className="space-y-2">
                {tasks.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => selectTask(t)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      selectedTask?.id === t.id
                        ? "border-blue-500 bg-blue-500/5"
                        : "border-white/10 bg-white/[0.02] hover:border-white/20"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-medium truncate flex-1 mr-2">{t.task_content}</p>
                      <StatusDot status={t.status} />
                    </div>
                    <p className="text-xs text-white/30 mt-1">→ {t.target_role}</p>
                  </button>
                ))}
                {tasks.length === 0 && (
                  <p className="text-white/30 text-sm text-center py-8">No tasks yet</p>
                )}
              </div>
            </div>

            {/* Task result */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Result</h2>
              {!selectedTask ? (
                <div className="h-64 flex items-center justify-center border border-white/10 rounded-2xl">
                  <p className="text-white/20 text-sm">Select a task to see results</p>
                </div>
              ) : (
                <motion.div
                  key={selectedTask.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="p-5 bg-white/[0.03] border border-white/10 rounded-2xl">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-bold">{selectedTask.target_role}</span>
                      <StatusDot status={selectedTask.status} />
                    </div>
                    {selectedTask.final_output ? (
                      <p className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed">
                        {selectedTask.final_output}
                      </p>
                    ) : selectedTask.status === "running" || selectedTask.status === "pending" ? (
                      <div className="flex items-center gap-2 text-white/40">
                        <Loader2 className="animate-spin" size={16} /> Running...
                      </div>
                    ) : null}
                    {selectedTask.provider_used && (
                      <p className="text-xs text-white/20 mt-3">
                        via {selectedTask.provider_used} {selectedTask.model_used ? `· ${selectedTask.model_used}` : ""} · {selectedTask.duration_ms}ms
                      </p>
                    )}
                  </div>

                  {/* Message chain */}
                  {loadingChain && <div className="flex justify-center"><Loader2 className="animate-spin text-white/30" size={20} /></div>}
                  {chain.length > 0 && (
                    <div>
                      <p className="text-xs text-white/30 uppercase tracking-wider mb-2">Message Chain</p>
                      <div className="space-y-2">
                        {chain.map((hop) => (
                          <HopCard key={hop.id} hop={hop} />
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function HopCard({ hop }: { hop: MessageHop }) {
  const [open, setOpen] = useState(false);
  const isEscalation = hop.type === "ESCALATION";

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-all"
      >
        <div className="flex items-center gap-2 text-sm">
          {isEscalation
            ? <ArrowUpRight size={14} className="text-amber-400" />
            : <ArrowDownRight size={14} className="text-blue-400" />}
          <span className="text-white/40">Hop {hop.hop}:</span>
          <span>{hop.from_role}</span>
          <span className="text-white/30">→</span>
          <span>{hop.to_role}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${isEscalation ? "bg-amber-500/10 text-amber-400" : "bg-blue-500/10 text-blue-400"}`}>
            {hop.type}
          </span>
        </div>
        {open ? <ChevronUp size={14} className="text-white/20" /> : <ChevronDown size={14} className="text-white/20" />}
      </button>
      {open && hop.output && (
        <div className="px-4 pb-4 text-sm text-white/60 whitespace-pre-wrap border-t border-white/5 pt-3">
          {hop.output}
        </div>
      )}
    </div>
  );
}

function StatusDot({ status }: { status: Task["status"] }) {
  const colors: Record<string, string> = {
    complete: "bg-emerald-500",
    running: "bg-blue-500 animate-pulse",
    pending: "bg-white/30",
    failed: "bg-red-500",
    escalated: "bg-amber-500",
  };
  return <span className={`w-2 h-2 rounded-full shrink-0 ${colors[status] ?? "bg-white/20"}`} />;
}
