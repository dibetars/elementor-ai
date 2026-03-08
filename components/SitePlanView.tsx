"use client";

import { SitePlan, Section, DesignTokens } from "@/lib/types";
import {
  Layout,
  FileText,
  Palette,
  Type,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Trash2,
  Plus,
} from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

const SECTION_COLORS: Record<string, string> = {
  hero: "bg-violet-500/15 border-violet-500/30 text-violet-300",
  navbar: "bg-slate-500/15 border-slate-500/30 text-slate-300",
  features: "bg-blue-500/15 border-blue-500/30 text-blue-300",
  about: "bg-cyan-500/15 border-cyan-500/30 text-cyan-300",
  services: "bg-teal-500/15 border-teal-500/30 text-teal-300",
  portfolio: "bg-indigo-500/15 border-indigo-500/30 text-indigo-300",
  testimonials: "bg-purple-500/15 border-purple-500/30 text-purple-300",
  pricing: "bg-green-500/15 border-green-500/30 text-green-300",
  team: "bg-orange-500/15 border-orange-500/30 text-orange-300",
  cta: "bg-rose-500/15 border-rose-500/30 text-rose-300",
  contact: "bg-yellow-500/15 border-yellow-500/30 text-yellow-300",
  faq: "bg-amber-500/15 border-amber-500/30 text-amber-300",
  blog: "bg-pink-500/15 border-pink-500/30 text-pink-300",
  footer: "bg-slate-600/15 border-slate-600/30 text-slate-400",
  custom: "bg-muted/15 border-muted/30 text-subtle",
};

function SectionPill({ section }: { section: Section }) {
  const colorClass = SECTION_COLORS[section.type] || SECTION_COLORS.custom;
  return (
    <div className={clsx("border rounded-lg px-3 py-2.5 text-xs", colorClass)}>
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono font-medium uppercase tracking-wider text-[10px] opacity-70">
          {section.type}
        </span>
        <span className="opacity-50 text-[10px]">{section.columns}col</span>
      </div>
      <p className="font-medium text-sm leading-snug">{section.label}</p>
      <p className="opacity-60 mt-0.5 text-[11px] leading-snug line-clamp-2">
        {section.description}
      </p>
    </div>
  );
}

function DesignTokensPanel({ tokens }: { tokens: DesignTokens }) {
  const colors = [
    { label: "Primary", value: tokens.primaryColor },
    { label: "Secondary", value: tokens.secondaryColor },
    { label: "Accent", value: tokens.accentColor },
    { label: "Background", value: tokens.backgroundColor },
    { label: "Text", value: tokens.textColor },
  ];

  return (
    <div className="bg-panel border border-border rounded-xl p-5 space-y-5">
      <h3 className="font-display font-semibold text-sm text-text flex items-center gap-2">
        <Palette size={14} className="text-accent" />
        Design Tokens
      </h3>

      {/* Colors */}
      <div>
        <p className="text-xs text-muted font-mono mb-3">Color Palette</p>
        <div className="flex gap-2">
          {colors.map((c) => (
            <div key={c.label} className="flex-1 text-center">
              <div
                className="w-full aspect-square rounded-lg mb-1.5 border border-white/10"
                style={{ backgroundColor: c.value }}
              />
              <p className="text-[10px] text-muted">{c.label}</p>
              <p className="text-[10px] font-mono text-subtle">{c.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div>
        <p className="text-xs text-muted font-mono mb-3 flex items-center gap-1">
          <Type size={11} />
          Typography
        </p>
        <div className="space-y-2">
          <div className="bg-surface rounded-lg px-3 py-2">
            <p className="text-[10px] text-muted">Heading</p>
            <p className="text-sm text-text font-medium">{tokens.headingFont}</p>
          </div>
          <div className="bg-surface rounded-lg px-3 py-2">
            <p className="text-[10px] text-muted">Body</p>
            <p className="text-sm text-text">{tokens.bodyFont}</p>
          </div>
        </div>
      </div>

      {/* Style tags */}
      <div className="flex flex-wrap gap-2">
        {[tokens.style, tokens.borderRadius, tokens.spacing].map((tag) => (
          <span
            key={tag}
            className="text-[10px] font-mono bg-surface border border-border rounded-full px-2.5 py-1 text-subtle"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

interface SitePlanViewProps {
  plan: SitePlan;
  onApprove: () => void;
  approving: boolean;
}

export default function SitePlanView({
  plan,
  onApprove,
  approving,
}: SitePlanViewProps) {
  const [expandedPages, setExpandedPages] = useState<Record<string, boolean>>(
    Object.fromEntries(plan.pages.map((p) => [p.id, true]))
  );

  const togglePage = (id: string) => {
    setExpandedPages((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      {/* Site header */}
      <div className="bg-panel border border-border rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-muted bg-surface border border-border px-2 py-0.5 rounded-full">
                {plan.industry}
              </span>
              <span className="text-xs font-mono text-muted bg-surface border border-border px-2 py-0.5 rounded-full">
                {plan.tone}
              </span>
            </div>
            <h2 className="font-display text-2xl font-bold text-text">
              {plan.siteName}
            </h2>
            <p className="text-subtle mt-1">{plan.siteTagline}</p>
            <p className="text-muted text-sm mt-2 leading-relaxed max-w-lg">
              {plan.reasoning}
            </p>
          </div>
          <div className="text-right shrink-0 ml-6">
            <p className="text-xs text-muted font-mono">
              {plan.pages.length} pages
            </p>
            <p className="text-xs text-muted font-mono">
              {plan.pages.reduce((a, p) => a + p.sections.length, 0)} sections
            </p>
          </div>
        </div>

        {/* Global nav */}
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted font-mono">Nav:</span>
          {plan.globalNav.map((item, i) => (
            <span
              key={i}
              className="text-xs bg-surface border border-border rounded px-2 py-0.5 text-subtle"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Pages */}
        <div className="col-span-2 space-y-3">
          <h3 className="font-display font-semibold text-sm text-text flex items-center gap-2">
            <Layout size={14} className="text-accent" />
            Page Structure
          </h3>

          {plan.pages.map((page) => (
            <div
              key={page.id}
              className="bg-panel border border-border rounded-xl overflow-hidden"
            >
              {/* Page header */}
              <button
                onClick={() => togglePage(page.id)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText size={14} className="text-muted" />
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text">
                        {page.name}
                      </span>
                      {page.isHome && (
                        <span className="text-[10px] font-mono bg-accent/20 text-accent px-1.5 py-0.5 rounded">
                          home
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-muted font-mono">
                      /{page.slug}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted">
                    {page.sections.length} sections
                  </span>
                  {expandedPages[page.id] ? (
                    <ChevronDown size={14} className="text-muted" />
                  ) : (
                    <ChevronRight size={14} className="text-muted" />
                  )}
                </div>
              </button>

              {/* Sections */}
              {expandedPages[page.id] && (
                <div className="px-5 pb-4 space-y-2 border-t border-border pt-4">
                  <p className="text-xs text-muted mb-3 italic">{page.purpose}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {page.sections.map((section) => (
                      <SectionPill key={section.id} section={section} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Design tokens sidebar */}
        <div className="space-y-4">
          <DesignTokensPanel tokens={plan.designTokens} />

          {/* Approve button */}
          <button
            onClick={onApprove}
            disabled={approving}
            className="w-full bg-accent hover:bg-accent/90 text-white rounded-xl py-3.5 text-sm font-medium flex items-center justify-center gap-2 glow transition-all disabled:opacity-50"
          >
            {approving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Generating JSON...
              </>
            ) : (
              <>
                Approve & Generate
                <ChevronRight size={15} />
              </>
            )}
          </button>

          <p className="text-xs text-muted text-center leading-relaxed">
            You can edit sections after generation. This kicks off the JSON
            generation pipeline for all pages.
          </p>
        </div>
      </div>
    </div>
  );
}
