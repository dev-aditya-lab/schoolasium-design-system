"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock, Check, Shield, Bell, Download, Activity, Zap, Star,
  FileText, Package, Layers, ArrowRight, Eye, EyeOff,
  LogIn, AlertCircle, Settings, ChevronRight, Megaphone,
  Clock, ExternalLink, Loader2,
} from "lucide-react";
import Link from "next/link";
import { useAuthStore }     from "@/lib/store/authStore";
import { useActivityStore } from "@/lib/store/activityStore";
import { ROLE_LABELS }      from "@/lib/rbac";
import { cn } from "@/lib/utils";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000)     return "just now";
  if (diff < 3_600_000)  return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

// ─── Login wall ───────────────────────────────────────────────────────────────

function LoginWall() {
  const { signIn, loading } = useAuthStore();
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]     = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Enter your credentials to continue."); return; }
    setSubmitting(true);
    const result = await signIn(email, password);
    setSubmitting(false);
    if (result.error) setError(result.error);
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-[var(--text-muted)]" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary-500)] flex items-center justify-center text-black font-black text-2xl mb-4 shadow-[var(--shadow-glow-primary)]">
            S
          </div>
          <h1 className="text-2xl font-black text-[var(--foreground)] tracking-tight">Employee Portal</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1 text-center">Sign in with your Schoolasium credentials</p>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-xl border border-[var(--color-info)]/30 bg-[var(--color-info)]/8 mb-6">
          <AlertCircle size={14} className="text-[var(--color-info)] mt-0.5 flex-shrink-0" />
          <p className="text-xs text-[var(--text-secondary)]">
            <span className="font-semibold text-[var(--color-info-dark)]">Employee accounts only.</span>{" "}
            Admins create accounts — you cannot self-register. Seed the DB first if it is empty.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">Work email</label>
            <input type="email" autoComplete="email" placeholder="you@schoolasium.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
              className={cn("w-full h-11 px-3.5 rounded-xl border bg-[var(--elevated)] text-sm text-[var(--foreground)] placeholder:text-[var(--text-muted)] outline-none transition-all focus:ring-2 focus:ring-[var(--color-primary-500)]/40 focus:border-[var(--color-primary-500)]",
                error ? "border-[var(--color-error)]" : "border-[var(--border)]")} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">Password</label>
            <div className="relative">
              <input type={showPw ? "text" : "password"} autoComplete="current-password" placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
                className={cn("w-full h-11 px-3.5 pr-10 rounded-xl border bg-[var(--elevated)] text-sm text-[var(--foreground)] placeholder:text-[var(--text-muted)] outline-none transition-all focus:ring-2 focus:ring-[var(--color-primary-500)]/40 focus:border-[var(--color-primary-500)]",
                  error ? "border-[var(--color-error)]" : "border-[var(--border)]")} />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--foreground)]"
                aria-label={showPw ? "Hide" : "Show"}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-1.5 text-xs text-[var(--color-error)]">
              <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />{error}
            </motion.p>
          )}

          <button type="submit" disabled={submitting}
            className="w-full h-11 rounded-xl text-sm font-semibold bg-[var(--color-primary-500)] text-black hover:bg-[var(--color-primary-400)] transition-all hover:shadow-[var(--shadow-glow-primary)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {submitting
              ? <><Loader2 size={15} className="animate-spin" />Signing in…</>
              : <><LogIn size={15} strokeWidth={2} />Sign in</>}
          </button>
        </form>

      </motion.div>
    </div>
  );
}

// ─── Setting row ──────────────────────────────────────────────────────────────

function SettingRow({ label, desc, defaultOn }: { label: string; desc: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <div>
        <div className="text-sm font-medium text-[var(--foreground)]">{label}</div>
        <div className="text-xs text-[var(--text-muted)] mt-0.5">{desc}</div>
      </div>
      <button onClick={() => setOn(!on)} role="switch" aria-checked={on}
        className={cn("relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ml-4",
          on ? "bg-[var(--color-primary-500)]" : "bg-[var(--color-neutral-700)]")}>
        <span className={cn("absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200",
          on ? "translate-x-5" : "translate-x-0")} />
      </button>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

const ANNOUNCEMENTS = [
  { id: 1, title: "Design System v1.1.0 Roadmap Published", body: "New: Calendar, Data Table, Kanban, Rich Text Editor. ETA July 2026.", time: "2h ago", type: "release", pinned: true },
  { id: 2, title: "Figma UI Kit updated to v1.0.2",          body: "Fixed auto-layout issues on Card variants. Re-sync your Figma Libraries.", time: "1d ago", type: "update", pinned: false },
  { id: 3, title: "All 40 components WCAG 2.2 AA verified",  body: "Full accessibility audit complete. Full report in Resources.", time: "3d ago", type: "info", pinned: false },
];

const TYPE_STYLES: Record<string, string> = {
  release: "text-[var(--color-primary-400)]  bg-[var(--color-primary-500)]/10  border-[var(--color-primary-500)]/30",
  update:  "text-[var(--color-secondary-400)] bg-[var(--color-secondary-500)]/10 border-[var(--color-secondary-500)]/30",
  info:    "text-[var(--color-info-dark)]     bg-[var(--color-info)]/10          border-[var(--color-info)]/30",
};

function Dashboard() {
  const { user, signOut } = useAuthStore();
  const { events, fetchEvents, log } = useActivityStore();
  const [tab, setTab] = useState<"overview" | "activity" | "settings">("overview");
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const [cpForm, setCpForm]   = useState({ current: "", next: "", confirm: "" });
  const [cpError, setCpError] = useState("");
  const [cpDone, setCpDone]   = useState(false);
  const [cpLoading, setCpLoading] = useState(false);

  useEffect(() => {
    if (tab === "activity" && user) {
      fetchEvents({ employeeId: user.id, limit: 20 });
    }
  }, [tab, user, fetchEvents]);

  async function handleSignOut() {
    await log({ type: "logout", detail: "Signed out" });
    await signOut();
  }

  async function handleChangePw(e: React.FormEvent) {
    e.preventDefault();
    setCpError("");
    if (!cpForm.current || !cpForm.next || !cpForm.confirm) { setCpError("All fields are required."); return; }
    if (cpForm.next.length < 8) { setCpError("New password must be at least 8 characters."); return; }
    if (cpForm.next !== cpForm.confirm) { setCpError("Passwords do not match."); return; }
    setCpLoading(true);
    const res = await fetch("/api/auth/change-password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ currentPassword: cpForm.current, newPassword: cpForm.next }),
    });
    const data = await res.json();
    setCpLoading(false);
    if (!res.ok) { setCpError(data.error ?? "Failed to update password."); return; }
    setCpDone(true);
    setCpForm({ current: "", next: "", confirm: "" });
  }

  if (!user) return null;

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 pb-24">
      {/* Header */}
      <div className="py-10 border-b border-[var(--border)] mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-500)] flex items-center justify-center text-black font-black text-sm">S</div>
            <span className="text-xs text-[var(--color-primary-400)] font-medium">Employee Portal</span>
          </div>
          <h1 className="text-3xl font-black text-[var(--foreground)] tracking-tight">Welcome, {user.name.split(" ")[0]}</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{ROLE_LABELS[user.role]} · {user.department}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {isAdmin && (
            <Link href="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--color-primary-500)] text-black hover:bg-[var(--color-primary-400)] transition-colors">
              <Shield size={11} strokeWidth={2} />Admin Panel
            </Link>
          )}
          <span className="flex items-center gap-1.5 text-xs text-[var(--color-success-dark)] bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] animate-pulse" />
            Signed in
          </span>
          <button onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--hover)] transition-colors">
            <Lock size={11} />Sign out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border)] mb-8 overflow-x-auto">
        {(["overview", "activity", "settings"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("px-5 py-2.5 text-sm font-medium capitalize whitespace-nowrap border-b-2 -mb-px transition-colors",
              tab === t ? "text-[var(--color-primary-500)] border-[var(--color-primary-500)]"
                        : "text-[var(--text-muted)] border-transparent hover:text-[var(--foreground)]")}>
            {t}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

          {/* ── Overview ── */}
          {tab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-2">
                <h2 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2 mb-4">
                  <Megaphone size={15} className="text-[var(--color-primary-500)]" />Announcements
                </h2>
                {ANNOUNCEMENTS.map((ann) => (
                  <div key={ann.id} className={cn("p-4 rounded-xl border bg-[var(--surface)] hover:bg-[var(--elevated)] transition-colors",
                    ann.pinned ? "border-[var(--color-primary-500)]/25" : "border-[var(--border)]")}>
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {ann.pinned && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[var(--color-primary-500)] text-black uppercase">Pinned</span>}
                          <span className={cn("text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border", TYPE_STYLES[ann.type])}>{ann.type}</span>
                        </div>
                        <div className="text-sm font-semibold text-[var(--foreground)] mb-1">{ann.title}</div>
                        <div className="text-xs text-[var(--text-secondary)]">{ann.body}</div>
                        <div className="text-[10px] text-[var(--text-muted)] mt-2 flex items-center gap-1"><Clock size={9} />{ann.time}</div>
                      </div>
                      <ChevronRight size={14} className="text-[var(--text-muted)] shrink-0 mt-0.5" />
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <h2 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2 mb-4">
                  <Zap size={15} className="text-[var(--color-primary-500)]" />Quick Access
                </h2>
                <div className="space-y-2">
                  {[
                    { label: "Design Tokens",    href: "/tokens",        icon: Star    },
                    { label: "Component Docs",   href: "/components",    icon: Package },
                    { label: "Resource Hub",     href: "/resources",     icon: Layers  },
                    { label: "AI Guidelines",    href: "/ai-guidelines", icon: Zap     },
                    { label: "Getting Started",  href: "/guide",         icon: FileText},
                    ...(isAdmin ? [{ label: "Admin Panel", href: "/admin", icon: Shield }] : []),
                  ].map(({ label, href, icon: Icon }) => (
                    <Link key={label} href={href}
                      className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--elevated)] hover:border-[var(--color-primary-500)]/25 transition-all group">
                      <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-500)]/10 flex items-center justify-center text-[var(--color-primary-500)] shrink-0">
                        <Icon size={14} strokeWidth={1.75} />
                      </div>
                      <span className="text-sm text-[var(--foreground)] flex-1">{label}</span>
                      <ChevronRight size={13} className="text-[var(--text-muted)] group-hover:text-[var(--foreground)] transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Activity ── */}
          {tab === "activity" && (
            <div>
              <h2 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2 mb-6">
                <Activity size={15} className="text-[var(--color-primary-500)]" />Your Activity
              </h2>
              {events.length === 0 ? (
                <div className="py-16 text-center text-sm text-[var(--text-muted)]">No activity recorded yet.</div>
              ) : (
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] divide-y divide-[var(--border)]">
                  {events.map((evt) => (
                    <div key={evt.id} className="flex items-center gap-4 px-5 py-3 hover:bg-[var(--elevated)] transition-colors">
                      <div className="text-xs text-[var(--foreground)] flex-1">{evt.detail}</div>
                      <div className="text-[10px] text-[var(--text-muted)] hidden sm:block">{evt.device} · {evt.browser}</div>
                      <div className="text-[10px] text-[var(--text-muted)] whitespace-nowrap">{timeAgo(evt.timestamp)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Settings ── */}
          {tab === "settings" && (
            <div className="max-w-lg space-y-4">
              <h2 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2 mb-6">
                <Settings size={15} className="text-[var(--color-primary-500)]" />Account Settings
              </h2>
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-1">
                <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Account</div>
                <div className="text-sm font-medium text-[var(--foreground)]">{user.name}</div>
                <div className="text-xs text-[var(--text-muted)]">{user.email}</div>
                <div className="flex gap-2 mt-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full border border-[var(--border)] text-[var(--text-secondary)]">{ROLE_LABELS[user.role]}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full border border-[var(--border)] text-[var(--text-secondary)]">{user.department}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-3">
                <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Change Password</div>
                {cpDone ? (
                  <div className="flex items-center gap-2 text-sm text-[var(--color-success-dark)]">
                    <Check size={14} className="text-[var(--color-success)]" />Password updated. Sign in again on other devices if needed.
                  </div>
                ) : (
                  <form onSubmit={handleChangePw} className="space-y-3">
                    {(["current", "next", "confirm"] as const).map((field) => (
                      <div key={field}>
                        <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                          {field === "current" ? "Current password" : field === "next" ? "New password" : "Confirm new password"}
                        </label>
                        <input type="password"
                          placeholder={field === "next" ? "Min 8 characters" : "••••••••"}
                          value={cpForm[field]}
                          onChange={(e) => setCpForm((f) => ({ ...f, [field]: e.target.value }))}
                          className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--elevated)] text-sm text-[var(--foreground)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/30 transition-all" />
                      </div>
                    ))}
                    {cpError && (
                      <p className="flex items-center gap-1.5 text-xs text-[var(--color-error)]">
                        <AlertCircle size={12} />{cpError}
                      </p>
                    )}
                    <button type="submit" disabled={cpLoading}
                      className="flex items-center gap-2 px-5 h-10 rounded-xl bg-[var(--color-primary-500)] text-black text-sm font-semibold hover:bg-[var(--color-primary-400)] transition-colors disabled:opacity-60">
                      {cpLoading ? <><Loader2 size={13} className="animate-spin" />Updating…</> : "Update password"}
                    </button>
                  </form>
                )}
              </div>

              {[
                { label: "Email notifications",  desc: "Announcements, changelog, new assets",    defaultOn: true  },
                { label: "Download history",     desc: "Keep a log of my asset downloads",        defaultOn: true  },
                { label: "Session persistence",  desc: "Stay signed in for 30 days",              defaultOn: false },
                { label: "Analytics sharing",    desc: "Allow anonymized usage data for DS team", defaultOn: true  },
              ].map((item) => <SettingRow key={item.label} {...item} />)}
              <div className="pt-4 border-t border-[var(--border)]">
                <button onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 h-10 rounded-xl border border-[var(--color-error)]/30 text-[var(--color-error)] text-sm font-medium hover:bg-[var(--color-error)]/10 transition-colors">
                  <Lock size={14} />Sign out of this session
                </button>
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function EmployeePortalClient() {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-[var(--text-muted)]" />
      </div>
    );
  }

  return user ? <Dashboard /> : <LoginWall />;
}
