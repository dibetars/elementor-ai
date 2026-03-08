import { NextRequest, NextResponse } from "next/server";
import { ElementorPage } from "@/lib/elementor";

interface PushPayload {
  siteUrl: string;
  username: string;
  appPassword: string;
  pages: Array<{ name: string; slug: string; json: ElementorPage }>;
}

async function wpRequest(
  baseUrl: string,
  path: string,
  auth: string,
  method: string,
  body?: object
) {
  const url = `${baseUrl.replace(/\/$/, "")}/wp-json/wp/v2${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WP API error ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

export async function POST(req: NextRequest) {
  const { siteUrl, username, appPassword, pages }: PushPayload =
    await req.json();

  if (!siteUrl || !username || !appPassword || !pages?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const auth = Buffer.from(`${username}:${appPassword}`).toString("base64");
  const results: Array<{ name: string; status: "success" | "error"; url?: string; error?: string }> = [];

  for (const page of pages) {
    try {
      // Create the WordPress page
      const created = await wpRequest(siteUrl, "/pages", auth, "POST", {
        title: page.name,
        slug: page.slug,
        status: "draft",
        meta: {
          _elementor_edit_mode: "builder",
          _elementor_template_type: "wp-page",
          _elementor_data: JSON.stringify(page.json.content),
          _elementor_page_settings: JSON.stringify(page.json.page_settings || {}),
          _elementor_version: "3.21.0",
        },
      });

      results.push({
        name: page.name,
        status: "success",
        url: created.link,
      });
    } catch (err: unknown) {
      results.push({
        name: page.name,
        status: "error",
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  const successCount = results.filter((r) => r.status === "success").length;

  return NextResponse.json({
    results,
    summary: `${successCount}/${pages.length} pages pushed to WordPress`,
  });
}

// Test connection endpoint
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const username = req.nextUrl.searchParams.get("username");
  const appPassword = req.nextUrl.searchParams.get("appPassword");

  if (!url || !username || !appPassword) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  try {
    const auth = Buffer.from(`${username}:${appPassword}`).toString("base64");
    const data = await wpRequest(url, "/users/me", auth, "GET");
    return NextResponse.json({ success: true, user: data.name, roles: data.roles });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Connection failed" },
      { status: 400 }
    );
  }
}
