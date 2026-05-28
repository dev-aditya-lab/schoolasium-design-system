"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Activity, Shield, Plus, Search, MoreVertical,
  Check, X, Trash2, RotateCcw, Lock, Unlock, LogIn,
  LogOut, Download, Eye, AlertTriangle, ChevronDown,
  Loader2, Globe, Copy,
} from "lucide-react";
import { useAuthStore }     from "@/lib/store/authStore";
import { useAdminStore }    from "@/lib/store/adminStore";
import { useActivityStore } from "@/lib/store/activityStore";
import { ROLE_LABELS, ROLE_HIERARCHY, canManageRole } from "@/lib/rbac";
import type { Role } from "@/lib/rbac";
import type { Employee } from "@/lib/store/adminStore";
import { cn } from "@/lib/utils";

const DEPT_OPTIONS = ["Engineering", "Design", "Product", "Marketing", "Operations", "Sales"];

const ROLE_COLORS: Record<Role, string> = {
  super_admin: "text-[var(--color-primary-400)]   bg-[var(--color-primary-500)]/15  border-[var(--color-primary-500)]/30",
  admin:       "text-[var(--color-secondary-400)] bg-[var(--color-secondary-500)]/15 border-[var(--color-secondary-500)]/30",
  employee:    "text-[var(--color-success-dark)]  bg-[var(--color-success)]/15       border-[var(--color-success)]/30",
  viewer:      "text-[var(--text-secondary)]      bg-[var(--elevated)]               border-[var(--border)]",
};

function timeAgo(iso: string | null): string {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000)     return "just now";
  if (diff < 3_600_000)  return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

// ─── Stats bar ────────────────────────────────────────────────────────────────

function StatsBar() {
  const { employees, total } = useAdminStore();
  const active   = employees.filter((e) => e.status === "active").length;
  const disabled = employees.filter((e) => e.status === "disabled").length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      {[
        { label: "Total employees", value: total || employees.length, icon: Users,    color: "text-[var(--color-primary-500)]  bg-[var(--color-primary-500)]/10"   },
        { label: "Active",          value: active,                    icon: Check,    color: "text-[var(--color-success)]      bg-[var(--color-success)]/10"        },
        { label: "Disabled",        value: disabled,                  icon: X,        color: "text-[var(--color-error)]        bg-[var(--color-error)]/10"          },
        { label: "Total roles",     value: 4,                         icon: Shield,   color: "text-[var(--color-secondary-400)] bg-[var(--color-secondary-500)]/10" },
      ].map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3", color)}>
            <Icon size={15} strokeWidth={1.75} />
          </div>
          <div className="text-xl font-black text-[var(--foreground)]">{value}</div>
          <div className="text-xs text-[var(--text-muted)] mt-0.5">{label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Create employee modal ────────────────────────────────────────────────────

function CreateEmployeeModal({ actorRole, onClose }: { actorRole: Role; onClose: () => void }) {
  const { createEmployee } = useAdminStore();
  const [form, setForm] = useState({ name: "", email: "", role: "employee" as Role, department: "Engineering" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]     = useState("");
  const [done, setDone]       = useState<{ name: string; password: string } | null>(null);

  const availableRoles = ROLE_HIERARCHY.filter((r) => canManageRole(actorRole, r) || (actorRole === "super_admin"));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) { setError("Name and email are required."); return; }
    if (!form.email.includes("@")) { setError("Enter a valid email address."); return; }

    setSubmitting(true);
    setError("");
    const tempPassword = `DS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const result = await createEmployee({ ...form, tempPassword });
    setSubmitting(false);

    if (result.error) { setError(result.error); return; }
    setDone({ name: form.name, password: tempPassword });
  }

  if (done) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 p-4 rounded-xl bg-[var(--color-success)]/10 border border-[var(--color-success)]/30">
          <Check size={16} className="text-[var(--color-success)]" />
          <span className="text-sm font-medium text-[var(--foreground)]">Account created for {done.name}</span>
        </div>
        <div className="p-4 rounded-xl bg-[var(--elevated)] border border-[var(--border)]">
          <div className="text-xs text-[var(--text-muted)] mb-1">Temporary password — share securely, cannot be retrieved again</div>
          <code className="text-lg font-mono font-bold text-[var(--color-primary-400)] tracking-widest">{done.password}</code>
        </div>
        <button onClick={onClose} className="w-full h-10 rounded-xl bg-[var(--color-primary-500)] text-black text-sm font-semibold hover:bg-[var(--color-primary-400)] transition-colors">Done</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {[
        { label: "Full name",  field: "name",  type: "text",  placeholder: "Sara Johnson" },
        { label: "Work email", field: "email", type: "email", placeholder: "sara@schoolasium.com" },
      ].map(({ label, field, type, placeholder }) => (
        <div key={field}>
          <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">{label}</label>
          <input type={type} placeholder={placeholder} value={(form as any)[field]}
            onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
            className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--elevated)] text-sm text-[var(--foreground)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/30 transition-all" />
        </div>
      ))}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">Role</label>
          <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
            className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--elevated)] text-sm text-[var(--foreground)] outline-none">
            {availableRoles.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">Department</label>
          <select value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
            className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--elevated)] text-sm text-[var(--foreground)] outline-none">
            {DEPT_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>
      {error && <p className="text-xs text-[var(--color-error)] flex items-center gap-1"><AlertTriangle size={11} />{error}</p>}
      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onClose} className="flex-1 h-10 rounded-xl border border-[var(--border)] text-sm text-[var(--text-secondary)] hover:bg-[var(--hover)] transition-colors">Cancel</button>
        <button type="submit" disabled={submitting} className="flex-1 h-10 rounded-xl bg-[var(--color-primary-500)] text-black text-sm font-semibold hover:bg-[var(--color-primary-400)] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
          {submitting ? <><Loader2 size={13} className="animate-spin" />Creating…</> : "Create account"}
        </button>
      </div>
    </form>
  );
}

// ─── Employee row ─────────────────────────────────────────────────────────────

function EmployeeRow({ emp, actorRole }: { emp: Employee; actorRole: Role }) {
  const { updateEmployee, deleteEmployee } = useAdminStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [resetPwd, setResetPwd] = useState<string | null>(null);
  const [busy, setBusy]         = useState(false);

  const canManage = canManageRole(actorRole, emp.role) || actorRole === "super_admin";

  async function handleToggleStatus() {
    setBusy(true);
    await updateEmployee(emp.id, { status: emp.status === "active" ? "disabled" : "active" });
    setBusy(false);
    setMenuOpen(false);
  }

  async function handleReset() {
    const pwd = `DS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    setBusy(true);
    await updateEmployee(emp.id, { newPassword: pwd });
    setBusy(false);
    setResetPwd(pwd);
    setMenuOpen(false);
  }

  async function handleDelete() {
    if (!confirm(`Delete ${emp.name}? This cannot be undone.`)) return;
    setBusy(true);
    await deleteEmployee(emp.id);
    setBusy(false);
  }

  return (
    <tr className="border-b border-[var(--border)] hover:bg-[var(--hover)] transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary-400)] to-[var(--color-primary-600)] flex items-center justify-center text-xs font-bold text-black shrink-0">
            {emp.avatar || emp.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-medium text-[var(--foreground)]">{emp.name}</div>
            <div className="text-[11px] text-[var(--text-muted)]">{emp.email}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full border uppercase tracking-wider", ROLE_COLORS[emp.role])}>
          {ROLE_LABELS[emp.role]}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">{emp.department}</td>
      <td className="px-4 py-3">
        <span className={cn("inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border",
          emp.status === "active"
            ? "text-[var(--color-success-dark)] bg-[var(--color-success)]/10 border-[var(--color-success)]/30"
            : "text-[var(--color-error)] bg-[var(--color-error)]/10 border-[var(--color-error)]/30")}>
          <span className={cn("w-1.5 h-1.5 rounded-full", emp.status === "active" ? "bg-[var(--color-success)]" : "bg-[var(--color-error)]")} />
          {emp.status === "active" ? "Active" : "Disabled"}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{timeAgo(emp.lastLogin)}</td>
      <td className="px-4 py-3 relative">
        {canManage && (
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} disabled={busy}
              className="p-1.5 rounded-lg hover:bg-[var(--elevated)] transition-colors text-[var(--text-muted)] disabled:opacity-40">
              {busy ? <Loader2 size={14} className="animate-spin" /> : <MoreVertical size={14} />}
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-[1059]" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-8 z-[1060] w-48 py-1 rounded-xl border border-[var(--border)] bg-[var(--elevated)] shadow-[var(--shadow-dark-lg)]">
                  <button onClick={handleToggleStatus} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-left hover:bg-[var(--hover)] text-[var(--foreground)]">
                    {emp.status === "active" ? <><Lock size={12} /> Disable account</> : <><Unlock size={12} /> Enable account</>}
                  </button>
                  <button onClick={handleReset} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-left hover:bg-[var(--hover)] text-[var(--foreground)]">
                    <RotateCcw size={12} /> Reset password
                  </button>
                  {actorRole === "super_admin" && (
                    <>
                      <hr className="my-1 border-[var(--border)]" />
                      <button onClick={handleDelete} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-left hover:bg-[var(--color-error)]/10 text-[var(--color-error)]">
                        <Trash2 size={12} /> Delete account
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
            {resetPwd && (
              <div className="absolute right-0 top-8 z-[1070] w-60 p-3 rounded-xl border border-[var(--color-primary-500)]/30 bg-[var(--elevated)] shadow-[var(--shadow-dark-lg)]">
                <div className="text-[10px] text-[var(--text-muted)] mb-1">New temporary password</div>
                <code className="text-sm font-mono font-bold text-[var(--color-primary-400)] tracking-widest">{resetPwd}</code>
                <button onClick={() => setResetPwd(null)} className="mt-2 block text-[10px] text-[var(--text-muted)] hover:text-[var(--foreground)]">Dismiss</button>
              </div>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}

// ─── Employees tab ────────────────────────────────────────────────────────────

function EmployeesTab({ actorRole }: { actorRole: Role }) {
  const { employees, loading, fetchEmployees } = useAdminStore();
  const [search, setSearch]       = useState("");
  const [filterRole, setFilterRole]   = useState<Role | "">("");
  const [filterDept, setFilterDept]   = useState("");
  const [filterStatus, setFilterStatus] = useState<"" | "active" | "disabled">("");
  const [showCreate, setShowCreate]   = useState(false);

  const doFetch = useCallback(() => {
    fetchEmployees({ search, role: filterRole, dept: filterDept, status: filterStatus });
  }, [search, filterRole, filterDept, filterStatus, fetchEmployees]);

  useEffect(() => { doFetch(); }, [doFetch]);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employees…"
            className="w-full h-9 pl-8 pr-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--foreground)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--color-primary-500)] transition-colors" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value as any)}
            className="h-9 px-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--foreground)] outline-none">
            <option value="">All roles</option>
            {ROLE_HIERARCHY.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </select>
          <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)}
            className="h-9 px-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--foreground)] outline-none">
            <option value="">All depts</option>
            {DEPT_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)}
            className="h-9 px-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--foreground)] outline-none">
            <option value="">All status</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-4 h-9 rounded-lg bg-[var(--color-primary-500)] text-black text-sm font-semibold hover:bg-[var(--color-primary-400)] transition-colors ml-auto">
          <Plus size={14} strokeWidth={2} />New employee
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden overflow-x-auto">
        {loading ? (
          <div className="py-16 flex items-center justify-center gap-2 text-sm text-[var(--text-muted)]">
            <Loader2 size={16} className="animate-spin" />Loading employees…
          </div>
        ) : (
          <table className="w-full min-w-[680px]">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--elevated)]">
                {["Employee", "Role", "Department", "Status", "Last login", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-[var(--text-muted)]">
                  No employees found.{" "}
                  <button onClick={() => { setSearch(""); setFilterRole(""); setFilterDept(""); setFilterStatus(""); }}
                    className="text-[var(--color-primary-400)] hover:underline">Clear filters</button>
                </td></tr>
              ) : employees.map((emp) => (
                <EmployeeRow key={emp.id} emp={emp} actorRole={actorRole} />
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="mt-2 text-xs text-[var(--text-muted)]">{employees.length} employees shown</div>

      {/* Create modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1040] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowCreate(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--elevated)] shadow-[var(--shadow-dark-lg)] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
                <h3 className="text-sm font-semibold text-[var(--foreground)]">Create employee account</h3>
                <button onClick={() => setShowCreate(false)} className="text-[var(--text-muted)] hover:text-[var(--foreground)]"><X size={16} /></button>
              </div>
              <div className="p-5">
                <CreateEmployeeModal actorRole={actorRole} onClose={() => { setShowCreate(false); doFetch(); }} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Activity tab ─────────────────────────────────────────────────────────────

const TYPE_ICONS: Record<string, React.ElementType> = {
  login: LogIn, logout: LogOut, download: Download, preview: Eye,
  failed_login: AlertTriangle, page_view: Globe, password_reset: RotateCcw,
  account_created: Plus, account_disabled: Lock, account_enabled: Unlock,
};
const TYPE_COLORS: Record<string, string> = {
  login:          "text-[var(--color-success)]      bg-[var(--color-success)]/10",
  logout:         "text-[var(--text-secondary)]     bg-[var(--elevated)]",
  download:       "text-[var(--color-primary-500)]  bg-[var(--color-primary-500)]/10",
  preview:        "text-[var(--color-info)]          bg-[var(--color-info)]/10",
  failed_login:   "text-[var(--color-error)]         bg-[var(--color-error)]/10",
  account_created:"text-[var(--color-success)]      bg-[var(--color-success)]/10",
  account_disabled:"text-[var(--color-error)]        bg-[var(--color-error)]/10",
  account_enabled:"text-[var(--color-success)]      bg-[var(--color-success)]/10",
  password_reset: "text-[var(--color-warning)]       bg-[var(--color-warning)]/10",
  page_view:      "text-[var(--color-secondary-400)] bg-[var(--color-secondary-500)]/10",
};

function ActivityTab() {
  const { events, total, loading, fetchEvents } = useActivityStore();
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    fetchEvents({ type: typeFilter || undefined, limit: 100 });
  }, [typeFilter, fetchEvents]);

  return (
    <div>
      <div className="flex gap-1.5 flex-wrap mb-5">
        {["", "login", "logout", "download", "failed_login", "account_created", "account_disabled", "password_reset"].map((t) => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors",
              typeFilter === t ? "bg-[var(--color-primary-500)] text-black"
                              : "border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--hover)]")}>
            {t === "" ? "All" : t.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden overflow-x-auto">
        {loading ? (
          <div className="py-16 flex items-center justify-center gap-2 text-sm text-[var(--text-muted)]">
            <Loader2 size={16} className="animate-spin" />Loading events…
          </div>
        ) : (
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--elevated)]">
                {["Type", "Employee", "Detail", "Device", "OS · Browser", "Time"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-[var(--text-muted)]">No events found</td></tr>
              ) : events.map((evt) => {
                const Icon = TYPE_ICONS[evt.type] ?? Activity;
                return (
                  <tr key={evt.id} className="border-b border-[var(--border)] hover:bg-[var(--hover)] transition-colors">
                    <td className="px-4 py-3">
                      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", TYPE_COLORS[evt.type] ?? "text-[var(--text-muted)] bg-[var(--elevated)]")}>
                        <Icon size={12} strokeWidth={1.75} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--foreground)] whitespace-nowrap">{evt.employeeName}</td>
                    <td className="px-4 py-3 text-xs text-[var(--text-secondary)] max-w-[180px] truncate">{evt.detail}</td>
                    <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{evt.device}</td>
                    <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{evt.os} · {evt.browser}</td>
                    <td className="px-4 py-3 text-xs text-[var(--text-muted)] whitespace-nowrap">{timeAgo(evt.timestamp)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <div className="mt-2 text-xs text-[var(--text-muted)]">{total} total events · TTL 90 days</div>
    </div>
  );
}

// ─── Change-password tab ──────────────────────────────────────────────────────

function ChangePasswordTab() {
  const [form, setForm]     = useState({ current: "", next: "", confirm: "" });
  const [error, setError]   = useState("");
  const [done, setDone]     = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.current || !form.next || !form.confirm) { setError("All fields are required."); return; }
    if (form.next.length < 8) { setError("New password must be at least 8 characters."); return; }
    if (form.next !== form.confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    const res = await fetch("/api/auth/change-password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ currentPassword: form.current, newPassword: form.next }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Failed to update password."); return; }
    setDone(true);
    setForm({ current: "", next: "", confirm: "" });
  }

  return (
    <div className="max-w-md space-y-5">
      <h2 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2 mb-6">
        <Lock size={15} className="text-[var(--color-primary-500)]" />Change Your Password
      </h2>
      {done ? (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-[var(--color-success)]/10 border border-[var(--color-success)]/30">
          <Check size={16} className="text-[var(--color-success)]" />
          <span className="text-sm font-medium text-[var(--foreground)]">Password updated successfully.</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {(["current", "next", "confirm"] as const).map((field) => (
            <div key={field}>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                {field === "current" ? "Current password" : field === "next" ? "New password" : "Confirm new password"}
              </label>
              <input
                type="password"
                placeholder={field === "next" ? "Min 8 characters" : "••••••••"}
                value={form[field]}
                onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--elevated)] text-sm text-[var(--foreground)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/30 transition-all"
              />
            </div>
          ))}
          {error && (
            <p className="flex items-center gap-1.5 text-xs text-[var(--color-error)]">
              <AlertTriangle size={11} />{error}
            </p>
          )}
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 px-5 h-10 rounded-xl bg-[var(--color-primary-500)] text-black text-sm font-semibold hover:bg-[var(--color-primary-400)] transition-colors disabled:opacity-60">
            {loading ? <><Loader2 size={13} className="animate-spin" />Updating…</> : "Update password"}
          </button>
        </form>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function AdminDashboard() {
  const { user, loading } = useAuthStore();
  const [tab, setTab] = useState<"employees" | "activity" | "settings">("employees");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={24} className="animate-spin text-[var(--text-muted)]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-24 text-center">
        <p className="text-sm text-[var(--text-muted)]">Sign in via the Employee Portal first.</p>
      </div>
    );
  }

  if (user.role !== "admin" && user.role !== "super_admin") {
    return (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-24 text-center">
        <Shield size={40} className="text-[var(--color-error)] mx-auto mb-4" strokeWidth={1.5} />
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">Access Denied</h2>
        <p className="text-sm text-[var(--text-secondary)]">You need admin or super_admin role to view this panel.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 pb-24">
      {/* Header */}
      <div className="py-10 border-b border-[var(--border)] mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border border-[var(--color-error)]/30 bg-[var(--color-error)]/8 text-[var(--color-error)] mb-3">
            <Shield size={11} />Admin Panel · {ROLE_LABELS[user.role]}
          </div>
          <h1 className="text-3xl font-black text-[var(--foreground)] tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{user.name} · {user.email}</p>
        </div>
      </div>

      <StatsBar />

      {/* Tabs */}
      <div className="flex border-b border-[var(--border)] mb-8">
        {[["employees", "Employee Management"], ["activity", "Activity Log"], ["settings", "Settings"]] .map(([id, label]) => (
          <button key={id} onClick={() => setTab(id as any)}
            className={cn("px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === id ? "text-[var(--color-primary-500)] border-[var(--color-primary-500)]"
                        : "text-[var(--text-muted)] border-transparent hover:text-[var(--foreground)]")}>
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          {tab === "employees" && <EmployeesTab actorRole={user.role} />}
          {tab === "activity"  && <ActivityTab />}
          {tab === "settings"  && <ChangePasswordTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
