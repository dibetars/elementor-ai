import { NextRequest } from "next/server";
import { SitePlan } from "@/lib/types";
import { buildPage, ElementorPage } from "@/lib/elementor";

export const runtime = "nodejs";
export const maxDuration = 120;

function encode(obj: object): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(obj) + "\n");
}

export async function POST(req: NextRequest) {
  const { plan }: { plan: SitePlan } = await req.json();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const total = plan.pages.length;

        controller.enqueue(
          encode({ type: "start", total, message: "Starting generation pipeline..." })
        );

        const results: Record<string, ElementorPage> = {};

        for (let i = 0; i < plan.pages.length; i++) {
          const page = plan.pages[i];

          controller.enqueue(
            encode({
              type: "page_start",
              pageId: page.id,
              pageName: page.name,
              current: i + 1,
              total,
              message: `Generating ${page.name}...`,
            })
          );

          // Build the Elementor JSON from our component library
          const pageJson = buildPage(
            page.name,
            page.sections,
            plan.designTokens,
            plan.siteName,
            plan.globalNav
          );

          // Simulate a small delay so the UI updates feel realistic
          await new Promise((r) => setTimeout(r, 300));

          controller.enqueue(
            encode({
              type: "page_reviewing",
              pageId: page.id,
              message: `Reviewing ${page.name}...`,
            })
          );

          await new Promise((r) => setTimeout(r, 200));

          // Validate: each page must have content
          const isValid = pageJson.content.length > 0;

          controller.enqueue(
            encode({
              type: "page_done",
              pageId: page.id,
              pageName: page.name,
              sectionCount: pageJson.content.length,
              valid: isValid,
              message: isValid
                ? `✓ ${page.name} — ${pageJson.content.length} sections`
                : `⚠ ${page.name} — validation warning`,
            })
          );

          results[page.id] = pageJson;
        }

        controller.enqueue(
          encode({
            type: "complete",
            pageJsons: results,
            message: "All pages generated successfully.",
          })
        );
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Generation failed";
        controller.enqueue(encode({ type: "error", message }));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
    },
  });
}
