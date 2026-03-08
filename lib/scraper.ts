import * as cheerio from "cheerio";

export interface ScrapedSite {
  url: string;
  title: string;
  description: string;
  sections: DetectedSection[];
  colors: string[];
  fonts: string[];
  headings: string[];
  bodyText: string[];
  navItems: string[];
  ctaTexts: string[];
  imageCount: number;
}

export interface DetectedSection {
  type: string;
  confidence: "high" | "medium" | "low";
  textContent: string[];
}

const SECTION_PATTERNS: Record<string, RegExp[]> = {
  hero: [/hero/i, /banner/i, /jumbotron/i, /splash/i, /intro/i, /main-header/i],
  navbar: [/nav/i, /header/i, /menu/i, /topbar/i, /toolbar/i],
  features: [/feature/i, /benefit/i, /service/i, /highlight/i, /advantage/i],
  testimonials: [/testimonial/i, /review/i, /quote/i, /feedback/i, /client/i],
  pricing: [/pric/i, /plan/i, /package/i, /tier/i, /subscription/i],
  cta: [/cta/i, /call-to-action/i, /action/i, /sign-up/i, /signup/i],
  contact: [/contact/i, /form/i, /reach/i, /touch/i, /enquir/i],
  portfolio: [/portfolio/i, /work/i, /project/i, /case-stud/i, /gallery/i],
  team: [/team/i, /staff/i, /people/i, /member/i, /employee/i],
  footer: [/footer/i, /bottom/i, /foot/i],
  faq: [/faq/i, /question/i, /accordion/i, /help/i],
  blog: [/blog/i, /post/i, /article/i, /news/i, /insight/i],
  about: [/about/i, /story/i, /mission/i, /vision/i, /history/i],
};

function detectSectionType(
  el: cheerio.Element,
  $: cheerio.CheerioAPI
): { type: string; confidence: "high" | "medium" | "low" } {
  const elem = $(el);
  const id = (elem.attr("id") || "").toLowerCase();
  const className = (elem.attr("class") || "").toLowerCase();
  const combined = `${id} ${className}`;

  for (const [type, patterns] of Object.entries(SECTION_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(combined)) {
        return { type, confidence: "high" };
      }
    }
  }

  // Heuristic: first large block is likely hero
  const tag = el.tagName?.toLowerCase();
  if (tag === "header") return { type: "navbar", confidence: "medium" };
  if (tag === "footer") return { type: "footer", confidence: "medium" };
  if (tag === "nav") return { type: "navbar", confidence: "high" };

  const text = elem.text().toLowerCase();
  for (const [type, patterns] of Object.entries(SECTION_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        return { type, confidence: "low" };
      }
    }
  }

  return { type: "custom", confidence: "low" };
}

function extractColors(html: string): string[] {
  const colors = new Set<string>();

  // Extract hex colors
  const hexMatches = html.matchAll(/#([0-9a-fA-F]{3,6})\b/g);
  for (const m of hexMatches) {
    const hex = m[1];
    if (hex.length === 3 || hex.length === 6) {
      colors.add(`#${hex}`);
    }
  }

  // Extract CSS variables that look like colors
  const varMatches = html.matchAll(/--[\w-]*color[\w-]*:\s*(#[0-9a-fA-F]{3,6})/gi);
  for (const m of varMatches) {
    colors.add(m[1]);
  }

  // Filter out very common non-brand colors
  const filtered = [...colors].filter(
    (c) => !["#fff", "#ffffff", "#000", "#000000", "#333", "#666", "#999"].includes(c.toLowerCase())
  );

  return filtered.slice(0, 8);
}

function extractFonts(html: string): string[] {
  const fonts = new Set<string>();

  // Google Fonts links
  const googleMatches = html.matchAll(/family=([^&"'\s:]+)/g);
  for (const m of googleMatches) {
    const family = decodeURIComponent(m[1]).replace(/\+/g, " ").split(":")[0].trim();
    if (family) fonts.add(family);
  }

  // CSS font-family declarations
  const cssMatches = html.matchAll(/font-family:\s*['"]?([^'",;{}]+)['"]?/gi);
  for (const m of cssMatches) {
    const family = m[1].split(",")[0].replace(/['"]/g, "").trim();
    if (family && !["serif", "sans-serif", "monospace", "inherit", "initial"].includes(family.toLowerCase())) {
      fonts.add(family);
    }
  }

  return [...fonts].slice(0, 4);
}

export async function scrapeSite(url: string): Promise<ScrapedSite> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; SiteAnalyzer/1.0; +https://elementorai.com)",
      Accept: "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Remove scripts and styles from text extraction
  $("script, style, noscript, iframe").remove();

  const title = $("title").text().trim() || $("h1").first().text().trim() || "";
  const description =
    $('meta[name="description"]').attr("content") ||
    $('meta[property="og:description"]').attr("content") ||
    "";

  // Extract nav items
  const navItems: string[] = [];
  $("nav a, header a, .nav a, .menu a").each((_, el) => {
    const text = $(el).text().trim();
    if (text && text.length < 30 && !navItems.includes(text)) {
      navItems.push(text);
    }
  });

  // Extract headings
  const headings: string[] = [];
  $("h1, h2, h3").each((_, el) => {
    const text = $(el).text().trim();
    if (text && text.length < 120 && !headings.includes(text)) {
      headings.push(text);
    }
  });

  // Extract body text snippets
  const bodyText: string[] = [];
  $("p").each((_, el) => {
    const text = $(el).text().trim();
    if (text.length > 40 && text.length < 300) {
      bodyText.push(text);
    }
  });

  // Extract CTA button texts
  const ctaTexts: string[] = [];
  $("a.btn, a.button, button, .cta, [class*='btn'], [class*='button']").each(
    (_, el) => {
      const text = $(el).text().trim();
      if (text && text.length < 40) ctaTexts.push(text);
    }
  );

  // Detect sections
  const sections: DetectedSection[] = [];
  $(
    "section, [class*='section'], [id*='section'], header, footer, nav, [class*='hero'], [class*='banner']"
  ).each((_, el) => {
    const { type, confidence } = detectSectionType(el, $);
    const textContent: string[] = [];

    $(el)
      .find("h1, h2, h3, h4, p")
      .each((_, child) => {
        const text = $(child).text().trim();
        if (text && text.length > 5) textContent.push(text);
      });

    if (textContent.length > 0 || confidence === "high") {
      sections.push({ type, confidence, textContent: textContent.slice(0, 4) });
    }
  });

  const colors = extractColors(html);
  const fonts = extractFonts(html);
  const imageCount = $("img").length;

  return {
    url,
    title,
    description,
    sections,
    colors,
    fonts,
    headings: headings.slice(0, 10),
    bodyText: bodyText.slice(0, 6),
    navItems: navItems.slice(0, 8),
    ctaTexts: [...new Set(ctaTexts)].slice(0, 5),
    imageCount,
  };
}

export function scraperToPromptContext(scraped: ScrapedSite): string {
  return `
URL ANALYSIS RESULTS:
---------------------
Site: ${scraped.title}
Description: ${scraped.description}

Detected Sections (${scraped.sections.length}):
${scraped.sections.map((s) => `  - ${s.type} (confidence: ${s.confidence}): "${s.textContent[0] || "no text"}"`).join("\n")}

Navigation Items: ${scraped.navItems.join(", ") || "none detected"}

Key Headings:
${scraped.headings.map((h) => `  • ${h}`).join("\n")}

Body Text Samples:
${scraped.bodyText.map((t) => `  "${t.slice(0, 100)}..."`).join("\n")}

CTA Buttons: ${scraped.ctaTexts.join(", ")}

Color Palette: ${scraped.colors.join(", ") || "none detected"}
Fonts Detected: ${scraped.fonts.join(", ") || "none detected"}
Image-heavy: ${scraped.imageCount > 10 ? "yes" : "no"} (${scraped.imageCount} images)
`.trim();
}
