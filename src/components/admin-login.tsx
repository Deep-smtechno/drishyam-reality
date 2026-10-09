"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LockKeyhole,
  LoaderCircle,
  TriangleAlert,
  Building2,
  MessagesSquare,
  ShieldCheck,
} from "lucide-react";
import { Brand } from "./brand";
import { Field } from "./admin-ui";
export function AdminLogin({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const data = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.get("email"),
          password: data.get("password"),
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="adm adm-login">
      <aside className="adm-login-side">
        <div className="adm-login-logo">
          <Brand />
        </div>
        <div>
          <h2>Manage your listings, enquiries and website content.</h2>
          <ul>
            <li>
              <Building2 size={18} /> Publish and update property listings
            </li>
            <li>
              <MessagesSquare size={18} /> Follow up on customer enquiries
            </li>
            <li>
              <ShieldCheck size={18} /> Secure, role-based access
            </li>
          </ul>
        </div>
        <small>© {new Date().getFullYear()} Drishyam Realty</small>
      </aside>
      <main className="adm-login-main">
        <div className="adm-login-card">
          <span className="adm-login-icon">
            <LockKeyhole size={22} />
          </span>
          <h1>Sign in</h1>
          <p>Enter your administrator credentials to continue.</p>
          {!configured && (
            <div className="adm-alert warn">
              <TriangleAlert size={16} />
              Administrator access is not enabled. Connect Microsoft SQL Server
              and create an administrator to activate this workspace.
            </div>
          )}
          <form className="adm-form" onSubmit={submit}>
            <Field label="Email address">
              <input
                type="email"
                name="email"
                autoComplete="username"
                required
                placeholder="name@company.com"
              />
            </Field>
            <Field label="Password">
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                placeholder="Enter your password"
              />
            </Field>
            {error && (
              <div role="alert" className="adm-alert error">
                <TriangleAlert size={16} />
                {error}
              </div>
            )}
            <button
              disabled={loading || !configured}
              className="adm-btn primary block"
            >
              {loading ? (
                <>
                  <LoaderCircle className="spin" size={16} />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
          <small className="adm-hint">
            Access is restricted to authorized administrators.
          </small>
        </div>
      </main>
    </div>
  );
}
