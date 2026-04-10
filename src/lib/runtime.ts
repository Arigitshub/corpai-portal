/**
 * Client for the corpai-runtime API.
 * Set NEXT_PUBLIC_RUNTIME_URL in .env to point to your deployed runtime.
 */

const BASE = process.env.NEXT_PUBLIC_RUNTIME_URL || "http://localhost:3001";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? `API error ${res.status}`);
  }
  return res.json();
}

export const runtime = {
  // Providers
  listProviders: () => req<{ providers: Provider[] }>("/api/providers"),
  pingProvider: (config: ProviderConfig) =>
    req<{ ok: boolean; message?: string }>("/api/providers/ping", {
      method: "POST",
      body: JSON.stringify(config),
    }),

  // Orgs
  createOrg: (body: CreateOrgBody) =>
    req<{ id: string; name: string }>("/api/orgs", { method: "POST", body: JSON.stringify(body) }),
  getOrg: (id: string) =>
    req<{ org: Org; roles: RoleSummary[] }>(`/api/orgs/${id}`),
  switchProvider: (id: string, providerConfig: ProviderConfig) =>
    req<{ ok: boolean }>(`/api/orgs/${id}/provider`, {
      method: "PATCH",
      body: JSON.stringify({ providerConfig }),
    }),

  // Tasks
  submitTask: (body: SubmitTaskBody) =>
    req<{ taskId: string; status: string }>("/api/tasks", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getTask: (id: string) => req<{ task: Task; chain: MessageHop[] | null }>(`/api/tasks/${id}`),
  listTasks: (orgId: string) => req<{ tasks: Task[] }>(`/api/tasks?orgId=${orgId}`),

  // Billing
  getPlans: () => req<{ plans: Plan[] }>("/api/billing/plans"),
  createCheckout: (orgId: string, plan: string) =>
    req<{ url: string }>("/api/billing/checkout", {
      method: "POST",
      body: JSON.stringify({ orgId, plan }),
    }),
  openPortal: (orgId: string) =>
    req<{ url: string }>("/api/billing/portal", {
      method: "POST",
      body: JSON.stringify({ orgId }),
    }),
  getBillingStatus: (orgId: string) =>
    req<BillingStatus>(`/api/billing/status/${orgId}`),
};

// ── Types ──────────────────────────────────────────────────────────────────

export interface Provider {
  id: string;
  displayName: string;
  type: "cli" | "api";
}

export interface ProviderConfig {
  provider: string;
  model?: string;
  apiKey?: string;
  [key: string]: unknown;
}

export interface CreateOrgBody {
  name: string;
  rolesSource: string;
  providerConfig: ProviderConfig;
  ownerEmail: string;
}

export interface Org {
  id: string;
  name: string;
  owner_email: string;
  provider_config: ProviderConfig;
  roles_source: string;
  subscription_status: "inactive" | "active" | "past_due" | "canceled";
  active_agent_seats: number;
  created_at: string;
}

export interface RoleSummary {
  title: string;
  rank: string;
  department: string;
}

export interface SubmitTaskBody {
  orgId: string;
  targetRole: string;
  task: string;
  providerOverride?: ProviderConfig;
}

export interface Task {
  id: string;
  org_id: string;
  target_role: string;
  task_content: string;
  status: "pending" | "running" | "complete" | "failed" | "escalated";
  final_output: string | null;
  final_role: string | null;
  escalated: boolean;
  provider_used: string | null;
  model_used: string | null;
  duration_ms: number | null;
  created_at: string;
  completed_at: string | null;
}

export interface MessageHop {
  id: number;
  task_id: string;
  hop: number;
  from_role: string;
  to_role: string;
  type: "TASK" | "ESCALATION" | "REPORT";
  content: string;
  output: string | null;
  provider: string | null;
  model: string | null;
}

export interface Plan {
  id: string;
  label: string;
  seats: number;
}

export interface BillingStatus {
  subscription_status: string;
  active_agent_seats: number;
  stripe_subscription_id: string | null;
}
