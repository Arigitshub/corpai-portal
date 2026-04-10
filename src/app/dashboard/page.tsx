"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { runtime, Org, RoleSummary, Task, BillingStatus } from "@/lib/runtime";
import {
  Building2, Users, Zap, ChevronRight, Loader2,
  AlertCircle, Settings, Plus, Clock
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [orgId, setOrgId] = useState<string | null>(null);
  const [org, setOrg] = useState<Org | null>(null);
  const [roles, setRoles] = useState<RoleSummary[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = localStorage.getItem("corpai_org_id");
    if (!id) { setLoading(false); return; }
    setOrgId(id);

    Promise.all([
      runtime.getOrg(id).then((r) => { setOrg(r.org); setRoles(r.roles); }).catch(() => {}),
      runtime.listTasks(id).then((r) => setTasks(r.tasks)).catch(() => {}),
      runtime.getBillingStatus(id).then(setBilling).catch(() => {}),
    ])
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-400" size={32} />
      </div>
    );
  }

  if (!orgId) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center gap-4 text-white">
        <Building2 size={48} className="text-white/20" />
        <h2 className="text-2xl font-bold">No org found</h2>
        <Link href="/start" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all">
          Create your AI company
        </Link>
      </div>
    );
  }

  const isActive = billing?.subscription_status === "active";
  const completedTasks = tasks.filter((t) => t.status === "complete").length;
  const runningTasks = tasks.filter((t) => t.status === "running" || t.status === "pending").length;

  return (
    <main className="min-h-screen bg-[#0a0a0b] text-white px-6 py-12">
      {/* Fixed background */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_0%,#1e1b4b_0%,transparent_50%)] opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-1">Dashboard</p>
            <h1 className="text-4xl font-bold">{org?.name ?? "Your Company"}</h1>
            <p className="text-white/40 text-sm mt-1">{org?.owner_email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/tasks"
              className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]"
            >
              <Plus size={16} /> New Task
            </Link>
            <Link href="/billing" className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
              <Settings size={18} />
            </Link>
          </div>
        </div>

        {/* Subscription warning */}
        {!isActive && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-amber-400" />
              <span className="text-amber-400 font-medium">
                No active subscription — tasks are paused.
              </span>
            </div>
            <Link href="/billing" className="px-4 py-2 bg-amber-500 hover:bg-amber-400 rounded-xl text-sm font-bold transition-all text-black">
              Subscribe →
            </Link>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Active Agents", value: billing?.active_agent_seats ?? 0, icon: <Users className="text-blue-400" size={20} />, },
            { label: "Departments", value: new Set(roles.map((r) => r.department)).size, icon: <Building2 className="text-purple-400" size={20} />, },
            { label: "Tasks Complete", value: completedTasks, icon: <Zap className="text-emerald-400" size={20} />, },
            { label: "Running Now", value: runningTasks, icon: <Clock className="text-amber-400" size={20} />, },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-5 bg-white/[0.03] border border-white/10 rounded-2xl"
            >
              <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center mb-4">{s.icon}</div>
              <p className="text-white/40 text-xs mb-1">{s.label}</p>
              <p className="text-3xl font-bold">{s.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agent roster */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-blue-500 rounded-full" /> Agent Roster
            </h3>
            <div className="space-y-2">
              {roles.slice(0, 12).map((role) => (
                <div
                  key={role.title}
                  className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/10 rounded-xl"
                >
                  <div>
                    <p className="text-sm font-medium">{role.title}</p>
                    <p className="text-xs text-white/30 capitalize">{role.department}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-md">
                    {role.rank}
                  </span>
                </div>
              ))}
              {roles.length > 12 && (
                <Link href="/map" className="block text-center text-sm text-white/30 hover:text-white py-2 transition-colors">
                  +{roles.length - 12} more agents →
                </Link>
              )}
            </div>
          </div>

          {/* Recent tasks */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-purple-500 rounded-full" /> Recent Tasks
            </h3>
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 bg-white/[0.02] border border-white/10 rounded-2xl gap-3">
                <Zap size={32} className="text-white/10" />
                <p className="text-white/30 text-sm">No tasks yet</p>
                <Link href="/tasks" className="text-blue-400 text-sm hover:text-blue-300">
                  Submit your first task →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.slice(0, 8).map((task) => (
                  <Link
                    key={task.id}
                    href={`/tasks?id=${task.id}`}
                    className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/10 rounded-xl hover:border-blue-500/30 transition-all group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.task_content}</p>
                      <p className="text-xs text-white/30 mt-0.5">→ {task.target_role}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-4 shrink-0">
                      <StatusBadge status={task.status} />
                      <ChevronRight size={14} className="text-white/20 group-hover:text-blue-400 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function StatusBadge({ status }: { status: Task["status"] }) {
  const map: Record<string, { label: string; color: string }> = {
    complete: { label: "Done", color: "bg-emerald-500/10 text-emerald-400" },
    running: { label: "Running", color: "bg-blue-500/10 text-blue-400" },
    pending: { label: "Pending", color: "bg-white/10 text-white/40" },
    failed: { label: "Failed", color: "bg-red-500/10 text-red-400" },
    escalated: { label: "Escalated", color: "bg-amber-500/10 text-amber-400" },
  };
  const s = map[status] ?? { label: status, color: "bg-white/10 text-white/40" };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${s.color}`}>{s.label}</span>
  );
}
