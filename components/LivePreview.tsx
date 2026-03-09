"use client";

import { useState, useMemo } from "react";
import { SitePlan } from "@/lib/types";
import { ElementorPage } from "@/lib/elementor";
import { elementorToHtml } from "@/lib/elementor-renderer";
import { Monitor, Tablet, Smartphone } from "lucide-react";
import clsx from "clsx";

interface LivePreviewProps {
  pageJsons: Record<string, ElementorPage>;
  plan: SitePlan;
}

const DEVICE_WIDTHS = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
} as const;

type Device = keyof typeof DEVICE_WIDTHS;

export default function LivePreview({ pageJsons, plan }: LivePreviewProps) {
  const [activePage, setActivePage] = useState<string>(plan.pages[0]?.id || "");
  const [device, setDevice] = useState<Device>("desktop");

  const currentPage = plan.pages.find((p) => p.id === activePage) || plan.pages[0];

  const htmlString = useMemo(() => {
    const pageJson = pageJsons[activePage];
    if (!pageJson) return "";
    return elementorToHtml(pageJson as ElementorPage, plan.designTokens);
  }, [activePage, pageJsons, plan.designTokens]);

  const siteDomain = plan.siteName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return (
    <div>
      {/* Page tabs + Device toggle */}
      <div className="flex items-center border-b border-border bg-surface/50 rounded-t-2xl px-2">
        {/* Page tabs */}
        <div className="flex items-center gap-0.5 overflow-x-auto py-2 px-2">
          {plan.pages.map((page) => (
            <button
              key={page.id}
              onClick={() => setActivePage(page.id)}
              className={clsx(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                activePage === page.id
                  ? "bg-white text-accent shadow-sm border border-border"
                  : "text-muted hover:text-text hover:bg-white/50"
              )}
            >
              {page.name}
            </button>
          ))}
        </div>

        {/* Device toggle */}
        <div className="ml-auto flex items-center gap-0.5 px-2">
          {(
            [
              { key: "desktop", icon: Monitor, label: "Desktop" },
              { key: "tablet", icon: Tablet, label: "Tablet" },
              { key: "mobile", icon: Smartphone, label: "Mobile" },
            ] as const
          ).map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setDevice(key)}
              title={label}
              className={clsx(
                "p-1.5 rounded-md transition-colors",
                device === key
                  ? "text-accent bg-white shadow-sm border border-border"
                  : "text-muted hover:text-text"
              )}
            >
              <Icon size={14} />
            </button>
          ))}
        </div>
      </div>

      {/* Browser chrome */}
      <div className="bg-surface border-b border-border px-4 py-2 flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
        </div>
        <div className="flex-1 bg-white border border-border rounded-md px-3 py-1 text-[11px] text-muted font-mono truncate">
          https://{siteDomain}.com/{currentPage?.slug || ""}
        </div>
      </div>

      {/* Iframe container */}
      <div
        className="bg-[#e8ecf0] flex justify-center overflow-auto"
        style={{ height: "600px" }}
      >
        <iframe
          srcDoc={htmlString}
          sandbox="allow-same-origin"
          style={{
            width: DEVICE_WIDTHS[device],
            maxWidth: "100%",
            height: "3000px",
            border: "none",
            backgroundColor: "#ffffff",
            transition: "width 0.3s ease",
          }}
          title={`Preview: ${currentPage?.name || "Page"}`}
        />
      </div>
    </div>
  );
}
