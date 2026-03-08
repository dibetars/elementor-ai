"use client";

import { useState } from "react";
import { Globe, Key, User, CheckCircle, AlertCircle, Loader, ExternalLink } from "lucide-react";
import clsx from "clsx";
import { ElementorPage } from "@/lib/elementor";
import { SitePlan } from "@/lib/types";

interface WPConnectProps {
  plan: SitePlan;
  pageJsons: Record<string, ElementorPage>;
}

interface PushResult {
  name: string;
  status: "success" | "error";
  url?: string;
  error?: string;
}

export default function WordPressConnect({ plan, pageJsons }: WPConnectProps) {
  const [siteUrl, setSiteUrl] = useState("");
  const [username, setUsername] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [testing, setTesting] = useState(false);
  const [connected, setConnected] = useState<{ user: string; roles: string[] } | null>(null);
  const [connError, setConnError] = useState("");
  const [pushing, setPushing] = useState(false);
  const [results, setResults] = useState<PushResult[]>([]);
  const [summary, setSummary] = useState("");

  const testConnection = async () => {
    if (!siteUrl || !username || !appPassword) return;
    setTesting(true);
    setConnError("");
    setConnected(null);

    try {
      const params = new URLSearchParams({ url: siteUrl, username, appPassword });
      const res = await fetch(`/api/wordpress?${params}`);
      const data = await res.json();

      if (data.success) {
        setConnected({ user: data.user, roles: data.roles });
      } else {
        setConnError(data.error || "Connection failed");
      }
    } catch {
      setConnError("Could not reach WordPress site");
    } finally {
      setTesting(false);
    }
  };

  const pushToWordPress = async () => {
    if (!connected) return;
    setPushing(true);
    setResults([]);

    const pages = plan.pages.map((p) => ({
      name: p.name,
      slug: p.slug,
      json: pageJsons[p.id],
    }));

    try {
      const res = await fetch("/api/wordpress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteUrl, username, appPassword, pages }),
      });
      const data = await res.json();
      setResults(data.results || []);
      setSummary(data.summary || "");
    } catch {
      setConnError("Push failed");
    } finally {
      setPushing(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-display font-semibold text-text mb-1">Connect WordPress Site</h3>
        <p className="text-xs text-muted">
          Uses{" "}
          <a
            href="https://make.wordpress.org/core/2020/11/05/application-passwords-integration-guide/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline"
          >
            Application Passwords
          </a>{" "}
          (WP 5.6+). Go to Users → Profile → Application Passwords to generate one.
        </p>
      </div>

      {/* Fields */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2.5 focus-within:border-accent transition-colors">
          <Globe size={14} className="text-muted shrink-0" />
          <input
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            placeholder="https://yoursite.com"
            className="flex-1 bg-transparent text-sm text-text placeholder-muted focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2.5 focus-within:border-accent transition-colors">
          <User size={14} className="text-muted shrink-0" />
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="WordPress username"
            className="flex-1 bg-transparent text-sm text-text placeholder-muted focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2.5 focus-within:border-accent transition-colors">
          <Key size={14} className="text-muted shrink-0" />
          <input
            value={appPassword}
            onChange={(e) => setAppPassword(e.target.value)}
            type="password"
            placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
            className="flex-1 bg-transparent text-sm text-text placeholder-muted focus:outline-none font-mono"
          />
        </div>
      </div>

      {/* Connection error */}
      {connError && (
        <div className="flex items-center gap-2 text-red-400 bg-red-400/10 rounded-lg px-3 py-2 text-xs">
          <AlertCircle size={13} />
          {connError}
        </div>
      )}

      {/* Connected status */}
      {connected && (
        <div className="flex items-center gap-2 text-success bg-success/10 rounded-lg px-3 py-2 text-xs border border-success/20">
          <CheckCircle size={13} />
          Connected as <strong>{connected.user}</strong> ({connected.roles?.join(", ")})
        </div>
      )}

      {/* Test / Push buttons */}
      {!connected ? (
        <button
          onClick={testConnection}
          disabled={testing || !siteUrl || !username || !appPassword}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium bg-surface border border-border hover:border-accent transition-all disabled:opacity-50"
        >
          {testing ? <Loader size={14} className="animate-spin" /> : <Globe size={14} />}
          {testing ? "Testing..." : "Test Connection"}
        </button>
      ) : (
        <button
          onClick={pushToWordPress}
          disabled={pushing}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium bg-accent hover:bg-accent/90 text-white transition-all disabled:opacity-50"
        >
          {pushing ? <Loader size={14} className="animate-spin" /> : <Globe size={14} />}
          {pushing ? `Pushing ${plan.pages.length} pages...` : `Push ${plan.pages.length} Pages to WordPress`}
        </button>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-2">
          {summary && (
            <p className="text-xs font-mono text-success">{summary}</p>
          )}
          {results.map((r, i) => (
            <div
              key={i}
              className={clsx(
                "flex items-center justify-between px-3 py-2 rounded-lg text-xs border",
                r.status === "success"
                  ? "bg-success/5 border-success/20 text-success"
                  : "bg-red-500/5 border-red-500/20 text-red-400"
              )}
            >
              <div className="flex items-center gap-2">
                {r.status === "success" ? (
                  <CheckCircle size={12} />
                ) : (
                  <AlertCircle size={12} />
                )}
                <span>{r.name}</span>
              </div>
              {r.url && (
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 opacity-70 hover:opacity-100"
                >
                  View <ExternalLink size={10} />
                </a>
              )}
              {r.error && <span className="text-[10px] opacity-70">{r.error.slice(0, 40)}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
