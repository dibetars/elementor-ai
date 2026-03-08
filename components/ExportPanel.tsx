"use client";

import { useState } from "react";
import { SitePlan } from "@/lib/types";
import { ElementorPage } from "@/lib/elementor";
import WordPressConnect from "./WordPressConnect";
import {
  Download,
  Upload,
  FileJson,
  ChevronDown,
  ChevronRight,
  Eye,
  Package,
} from "lucide-react";
import clsx from "clsx";

interface ExportPanelProps {
  plan: SitePlan;
  pageJsons: Record<string, ElementorPage>;
}

export default function ExportPanel({ plan, pageJsons }: ExportPanelProps) {
  const [tab, setTab] = useState<"download" | "wordpress">("download");
  const [expandedPage, setExpandedPage] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const downloadZip = async () => {
    setDownloading(true);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const folder = zip.folder("elementor-pages")!;

      for (const page of plan.pages) {
        const json = pageJsons[page.id];
        if (json) {
          folder.file(
            `${page.slug}.json`,
            JSON.stringify(json, null, 2)
          );
        }
      }

      // Add a readme
      folder.file(
        "HOW-TO-IMPORT.md",
        `# Elementor AI — Generated Site\n\nSite: ${plan.siteName}\nGenerated: ${new Date().toLocaleDateString()}\n\n## Pages\n${plan.pages.map((p) => `- ${p.name} (${p.slug}.json)`).join("\n")}\n\n## How to import\n\n1. Go to your WordPress admin\n2. Navigate to Templates → Saved Templates or Pages\n3. Click "Import Templates" or create a new page\n4. In Elementor editor, click the folder icon → Import JSON\n5. Select the .json file for that page\n\n## Notes\n- Each file is a full Elementor page template\n- Import one file per page\n- Design tokens: ${JSON.stringify(plan.designTokens, null, 2)}\n`
      );

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${plan.siteName.toLowerCase().replace(/\s+/g, "-")}-elementor.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  const downloadSingle = (pageId: string, pageName: string) => {
    const json = pageJsons[pageId];
    if (!json) return;
    const blob = new Blob([JSON.stringify(json, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${pageName.toLowerCase().replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Tab switcher */}
      <div className="flex bg-surface border border-border rounded-xl p-1">
        <button
          onClick={() => setTab("download")}
          className={clsx(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all",
            tab === "download"
              ? "bg-panel text-text shadow-sm"
              : "text-muted hover:text-subtle"
          )}
        >
          <Download size={14} />
          Download Files
        </button>
        <button
          onClick={() => setTab("wordpress")}
          className={clsx(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all",
            tab === "wordpress"
              ? "bg-panel text-text shadow-sm"
              : "text-muted hover:text-subtle"
          )}
        >
          <Upload size={14} />
          Push to WordPress
        </button>
      </div>

      {tab === "download" && (
        <div className="space-y-4">
          {/* Download all */}
          <button
            onClick={downloadZip}
            disabled={downloading}
            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl bg-accent hover:bg-accent/90 text-white font-medium transition-all glow disabled:opacity-50"
          >
            {downloading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Packing ZIP...
              </>
            ) : (
              <>
                <Package size={16} />
                Download All Pages as ZIP
              </>
            )}
          </button>

          <p className="text-xs text-muted text-center">
            Includes all {plan.pages.length} page JSONs + import instructions
          </p>

          {/* Per-page download */}
          <div className="space-y-2">
            <p className="text-xs text-muted font-mono">Or download individual pages:</p>
            {plan.pages.map((page) => {
              const json = pageJsons[page.id];
              const sectionCount = json?.content?.length ?? 0;

              return (
                <div
                  key={page.id}
                  className="bg-panel border border-border rounded-xl overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-3">
                    <button
                      onClick={() =>
                        setExpandedPage(expandedPage === page.id ? null : page.id)
                      }
                      className="flex items-center gap-2 flex-1 text-left"
                    >
                      <FileJson size={14} className="text-accent shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-text">{page.name}</p>
                        <p className="text-[11px] font-mono text-muted">
                          /{page.slug} · {sectionCount} sections
                        </p>
                      </div>
                      {expandedPage === page.id ? (
                        <ChevronDown size={13} className="text-muted ml-auto" />
                      ) : (
                        <ChevronRight size={13} className="text-muted ml-auto" />
                      )}
                    </button>
                    <button
                      onClick={() => downloadSingle(page.id, page.name)}
                      className="ml-3 flex items-center gap-1.5 text-xs text-subtle hover:text-accent transition-colors px-2 py-1 rounded-lg hover:bg-accent/10 border border-transparent hover:border-accent/20"
                    >
                      <Download size={11} />
                      .json
                    </button>
                  </div>

                  {/* JSON preview */}
                  {expandedPage === page.id && json && (
                    <div className="border-t border-border px-4 py-3">
                      <p className="text-[10px] font-mono text-muted mb-2 flex items-center gap-1">
                        <Eye size={10} /> JSON Preview (first 2 sections)
                      </p>
                      <pre className="text-[10px] font-mono text-subtle bg-surface rounded-lg p-3 overflow-auto max-h-48 leading-relaxed">
                        {JSON.stringify(
                          { ...json, content: json.content.slice(0, 2) },
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Import guide */}
          <div className="bg-surface border border-border rounded-xl p-4 space-y-2">
            <p className="text-xs font-mono text-accent">// How to import in Elementor</p>
            {[
              "1. Create a new page in WordPress",
              "2. Click 'Edit with Elementor'",
              "3. Click the folder icon (Import Template)",
              '4. Select "Import JSON" and upload the file',
              "5. Click 'Insert' to apply the template",
            ].map((step) => (
              <p key={step} className="text-xs text-muted">{step}</p>
            ))}
          </div>
        </div>
      )}

      {tab === "wordpress" && (
        <WordPressConnect plan={plan} pageJsons={pageJsons} />
      )}
    </div>
  );
}
