import { DesignTokens } from "./types";
import {
  ElementorPage,
  ElementorSection,
  ElementorColumn,
  ElementorWidget,
} from "./elementor";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function collectFonts(page: ElementorPage, tokens: DesignTokens): string[] {
  const fonts = new Set<string>([tokens.headingFont, tokens.bodyFont]);

  function walk(elements: { settings: Record<string, unknown>; elements?: unknown[] }[]) {
    for (const el of elements) {
      const s = el.settings;
      if (typeof s.typography_font_family === "string") fonts.add(s.typography_font_family);
      if (typeof s.title_typography_font_family === "string") fonts.add(s.title_typography_font_family);
      if (typeof s.description_typography_font_family === "string") fonts.add(s.description_typography_font_family);
      if (Array.isArray(el.elements)) walk(el.elements as typeof elements);
    }
  }

  walk(page.content as unknown as { settings: Record<string, unknown>; elements?: unknown[] }[]);
  return [...fonts].filter(Boolean);
}

function googleFontsLink(fonts: string[]): string {
  const families = fonts
    .map((f) => `family=${encodeURIComponent(f)}:wght@300;400;500;600;700;800`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

function px(val: unknown): string {
  if (!val) return "0px";
  if (typeof val === "number") return `${val}px`;
  if (typeof val === "string") return val.includes("px") || val.includes("%") ? val : `${val}px`;
  if (typeof val === "object" && val !== null) {
    const o = val as { size?: number | string; unit?: string };
    return `${o.size ?? 0}${o.unit ?? "px"}`;
  }
  return "0px";
}

function padStr(padding: unknown): string {
  if (!padding || typeof padding !== "object") return "";
  const p = padding as { top?: string; right?: string; bottom?: string; left?: string; unit?: string };
  const u = p.unit || "px";
  return `padding: ${p.top || "0"}${u} ${p.right || "0"}${u} ${p.bottom || "0"}${u} ${p.left || "0"}${u};`;
}

function esc(str: unknown): string {
  if (typeof str !== "string") return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ─── Widget Renderers ────────────────────────────────────────────────────────

function renderHeading(s: Record<string, unknown>): string {
  const tag = (s.header_size as string) || "h2";
  const align = (s.align as string) || "left";
  const color = (s.title_color as string) || "inherit";
  const font = s.typography_font_family ? `font-family:'${s.typography_font_family}',sans-serif;` : "";
  const weight = s.typography_font_weight ? `font-weight:${s.typography_font_weight};` : "";
  const size = s.typography_font_size ? `font-size:${px(s.typography_font_size)};` : "";

  return `<${tag} style="color:${color};text-align:${align};${font}${weight}${size}margin:0 0 0.5em">${esc(s.title as string)}</${tag}>`;
}

function renderTextEditor(s: Record<string, unknown>): string {
  const color = (s.text_color as string) || "inherit";
  const font = s.typography_font_family ? `font-family:'${s.typography_font_family}',sans-serif;` : "";
  return `<div style="color:${color};${font}line-height:1.7">${s.editor || ""}</div>`;
}

function renderButton(s: Record<string, unknown>): string {
  const text = esc(s.text as string) || "Click Here";
  const align = (s.align as string) || "left";
  const bg = (s.background_color as string) || "#333";
  const textColor = (s.button_text_color as string) || "#fff";
  const radius = s.border_radius ? `border-radius:${px(s.border_radius)};` : "";
  const font = s.typography_font_family ? `font-family:'${s.typography_font_family}',sans-serif;` : "";
  const weight = s.typography_font_weight ? `font-weight:${s.typography_font_weight};` : "";

  const sizeMap: Record<string, string> = {
    sm: "10px 20px",
    md: "12px 28px",
    lg: "16px 36px",
    xl: "20px 48px",
  };
  const pad = sizeMap[(s.size as string) || "md"] || "12px 28px";

  return `<div style="text-align:${align};margin:1em 0">
    <a href="#" style="display:inline-block;padding:${pad};background:${bg};color:${textColor};${radius}${font}${weight}text-decoration:none;font-size:15px;letter-spacing:0.3px">${text}</a>
  </div>`;
}

function renderImage(s: Record<string, unknown>): string {
  const img = s.image as { url?: string } | undefined;
  const url = img?.url || "https://placehold.co/800x400/ccc/999?text=Image";
  const radius = s.image_border_radius ? `border-radius:${px(s.image_border_radius)};` : "";
  return `<div style="margin:1em 0"><img src="${url}" alt="" style="width:100%;height:auto;display:block;${radius}" /></div>`;
}

function renderIconBox(s: Record<string, unknown>): string {
  const icon = s.selected_icon as { value?: string } | undefined;
  const iconClass = icon?.value || "fas fa-star";
  const iconColor = (s.icon_color as string) || (s.icon_primary_color as string) || "#333";
  const iconSize = s.icon_size ? px(s.icon_size) : "36px";
  const title = esc(s.title_text as string) || "";
  const desc = esc(s.description_text as string) || "";
  const titleColor = (s.title_color as string) || "inherit";
  const descColor = (s.description_color as string) || "inherit";
  const titleFont = s.title_typography_font_family ? `font-family:'${s.title_typography_font_family}',sans-serif;` : "";
  const titleWeight = s.title_typography_font_weight ? `font-weight:${s.title_typography_font_weight};` : "";
  const align = (s.position as string) === "left" ? "flex-start" : "center";
  const textAlign = (s.position as string) === "left" ? "left" : "center";
  const direction = (s.position as string) === "left" ? "row" : "column";

  return `<div style="display:flex;flex-direction:${direction};align-items:${align};text-align:${textAlign};gap:12px;padding:16px 0">
    <div style="flex-shrink:0"><i class="${iconClass}" style="font-size:${iconSize};color:${iconColor}"></i></div>
    <div>
      <h4 style="color:${titleColor};${titleFont}${titleWeight}margin:0 0 6px;font-size:18px">${title}</h4>
      <p style="color:${descColor};margin:0;font-size:14px;line-height:1.6">${desc}</p>
    </div>
  </div>`;
}

function renderIconList(s: Record<string, unknown>): string {
  const items = (s.icon_list as { text?: string; selected_icon?: { value?: string } }[]) || [];
  const iconColor = (s.icon_color as string) || "#333";
  const textColor = (s.text_color as string) || "inherit";
  const font = s.typography_font_family ? `font-family:'${s.typography_font_family}',sans-serif;` : "";
  const fontSize = s.typography_font_size ? `font-size:${px(s.typography_font_size)};` : "font-size:16px;";
  const gap = s.space_between ? px(s.space_between) : "12px";

  const lis = items
    .map((item) => {
      const ic = item.selected_icon?.value || "fas fa-check";
      return `<li style="display:flex;align-items:center;gap:10px;padding:${parseInt(gap) / 2}px 0">
        <i class="${ic}" style="color:${iconColor};width:20px;text-align:center;flex-shrink:0"></i>
        <span>${esc(item.text)}</span>
      </li>`;
    })
    .join("");

  return `<ul style="list-style:none;padding:0;margin:0;color:${textColor};${font}${fontSize}">${lis}</ul>`;
}

function renderAccordion(s: Record<string, unknown>): string {
  const tabs = (s.tabs as { tab_title?: string; tab_content?: string }[]) || [];
  const titleColor = (s.title_color as string) || "inherit";
  const activeColor = (s.title_active_color as string) || titleColor;
  const borderColor = (s.border_color as string) || "#ddd";

  const items = tabs
    .map(
      (tab, i) => `<details ${i === 0 ? "open" : ""} style="border-bottom:1px solid ${borderColor}">
      <summary style="padding:16px 0;cursor:pointer;font-weight:600;font-size:16px;color:${titleColor};display:flex;justify-content:space-between;align-items:center">
        ${esc(tab.tab_title)} <span style="color:${activeColor};font-size:20px">+</span>
      </summary>
      <div style="padding:0 0 16px;color:inherit;font-size:14px;line-height:1.7;opacity:0.8">
        ${tab.tab_content || ""}
      </div>
    </details>`
    )
    .join("");

  return `<div>${items}</div>`;
}

function renderTestimonial(s: Record<string, unknown>): string {
  const content = s.content || s.testimonial_content || "";
  const name = esc(s.name as string || s.testimonial_name as string) || "Client";
  const job = esc(s.job as string || s.testimonial_job as string) || "";
  const img = s.image as { url?: string } | undefined;
  const imgUrl = img?.url || "";
  const alignment = (s.alignment as string) || "center";
  const textColor = (s.text_color as string) || "inherit";
  const nameColor = (s.name_color as string) || "inherit";

  const imgHtml = imgUrl
    ? `<img src="${imgUrl}" alt="${name}" style="width:60px;height:60px;border-radius:50%;object-fit:cover;margin:16px ${alignment === "center" ? "auto" : "0"};display:block" />`
    : "";

  return `<div style="text-align:${alignment};padding:16px 0">
    <p style="font-style:italic;color:${textColor};font-size:15px;line-height:1.7;margin:0 0 12px">${content}</p>
    ${imgHtml}
    <p style="font-weight:600;color:${nameColor};margin:4px 0 0;font-size:15px">${name}</p>
    ${job ? `<p style="color:${textColor};opacity:0.6;margin:2px 0 0;font-size:13px">${job}</p>` : ""}
  </div>`;
}

function renderSocialIcons(s: Record<string, unknown>): string {
  const items = (s.social_icon_list as { social_icon?: { value?: string }; link?: { url?: string } }[]) || [];
  const iconSize = s.icon_size ? px(s.icon_size) : "20px";
  const primaryColor = (s.icon_primary_color as string) || "inherit";
  const secondaryColor = (s.icon_secondary_color as string) || "transparent";
  const shape = (s.shape as string) || "";
  const radius = shape === "rounded" ? "border-radius:6px;" : shape === "circle" ? "border-radius:50%;" : "";

  const icons = items
    .map((item) => {
      const ic = item.social_icon?.value || "fab fa-link";
      const url = item.link?.url || "#";
      return `<a href="${url}" style="display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;background:${secondaryColor};color:${primaryColor};${radius}text-decoration:none;font-size:${iconSize}">
        <i class="${ic}"></i>
      </a>`;
    })
    .join("");

  return `<div style="display:flex;gap:8px;padding:8px 0">${icons}</div>`;
}

function renderHtmlWidget(s: Record<string, unknown>): string {
  return `<div>${s.html || ""}</div>`;
}

function renderImageBox(s: Record<string, unknown>): string {
  const img = s.image as { url?: string } | undefined;
  const url = img?.url || "https://placehold.co/400x300/ccc/999?text=Image";
  const title = esc(s.title_text as string) || "";
  const desc = esc(s.description_text as string) || "";
  const titleColor = (s.title_color as string) || "inherit";
  const descColor = (s.description_color as string) || "inherit";
  const titleFont = s.title_typography_font_family ? `font-family:'${s.title_typography_font_family}',sans-serif;` : "";
  const titleWeight = s.title_typography_font_weight ? `font-weight:${s.title_typography_font_weight};` : "";
  const imgRadius = s.image_border_radius ? `border-radius:${px(s.image_border_radius)};` : "";
  const align = (s.align as string) || "left";

  return `<div style="text-align:${align};padding:8px 0">
    <img src="${url}" alt="${title}" style="width:100%;height:auto;display:block;${imgRadius}margin:0 auto 16px" />
    <h4 style="color:${titleColor};${titleFont}${titleWeight}margin:0 0 8px;font-size:18px">${title}</h4>
    <p style="color:${descColor};margin:0;font-size:14px;line-height:1.6">${desc}</p>
  </div>`;
}

function renderPosts(s: Record<string, unknown>): string {
  const cols = parseInt((s.columns as string) || "3", 10);
  const cards = Array.from(
    { length: cols },
    (_, i) => `<div style="flex:1;min-width:0">
      <div style="background:#e5e7eb;height:180px;border-radius:8px;margin-bottom:12px;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:13px">
        Blog Post ${i + 1}
      </div>
      <div style="height:14px;background:#e5e7eb;border-radius:4px;margin-bottom:8px;width:80%"></div>
      <div style="height:10px;background:#f3f4f6;border-radius:4px;width:60%"></div>
    </div>`
  ).join("");

  return `<div style="display:flex;gap:24px;padding:16px 0">${cards}
    <p style="position:absolute;bottom:8px;right:12px;font-size:11px;color:#9ca3af;font-style:italic">Blog posts — populated from WordPress</p>
  </div>`;
}

// ─── Widget Dispatcher ───────────────────────────────────────────────────────

function renderWidget(widget: ElementorWidget): string {
  const s = widget.settings;
  switch (widget.widgetType) {
    case "heading":       return renderHeading(s);
    case "text-editor":   return renderTextEditor(s);
    case "button":        return renderButton(s);
    case "image":         return renderImage(s);
    case "icon-box":      return renderIconBox(s);
    case "icon-list":     return renderIconList(s);
    case "accordion":     return renderAccordion(s);
    case "testimonial":   return renderTestimonial(s);
    case "social-icons":  return renderSocialIcons(s);
    case "html":          return renderHtmlWidget(s);
    case "image-box":     return renderImageBox(s);
    case "posts":         return renderPosts(s);
    default:              return `<!-- unsupported widget: ${widget.widgetType} -->`;
  }
}

// ─── Column & Section ────────────────────────────────────────────────────────

function renderColumn(col: ElementorColumn): string {
  const size = (col.settings._column_size as number) || 100;
  const widgetsHtml = col.elements.map((w) => renderWidget(w)).join("");
  return `<div style="width:${size}%;box-sizing:border-box;padding:0 15px">${widgetsHtml}</div>`;
}

function renderSection(section: ElementorSection): string {
  const s = section.settings;
  const bgColor = (s.background_color as string) || "transparent";
  const layout = (s.layout as string) || "boxed";
  const maxWidth = layout === "full_width" ? "1140px" : "1140px";
  const padding = padStr(s.padding);

  const columnsHtml = section.elements.map((col) => renderColumn(col)).join("");

  return `<section style="background-color:${bgColor};${padding}width:100%">
    <div style="max-width:${maxWidth};margin:0 auto;display:flex;flex-wrap:wrap;align-items:flex-start">
      ${columnsHtml}
    </div>
  </section>`;
}

// ─── Main Entry ──────────────────────────────────────────────────────────────

export function elementorToHtml(
  page: ElementorPage,
  designTokens: DesignTokens
): string {
  const fonts = collectFonts(page, designTokens);
  const fontsLink = googleFontsLink(fonts);
  const bgColor =
    (page.page_settings?.background_color as string) || designTokens.backgroundColor;

  const sectionsHtml = page.content.map((s) => renderSection(s)).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(page.title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="${fontsLink}" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: '${designTokens.bodyFont}', system-ui, sans-serif;
      color: ${designTokens.textColor};
      background-color: ${bgColor};
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    img { max-width: 100%; height: auto; }
    a { text-decoration: none; color: inherit; }
    h1, h2, h3, h4, h5, h6 {
      font-family: '${designTokens.headingFont}', system-ui, sans-serif;
      line-height: 1.2;
    }
    ul { list-style: none; padding: 0; }
    details summary { list-style: none; }
    details summary::-webkit-details-marker { display: none; }
    section { position: relative; }
  </style>
</head>
<body>
${sectionsHtml}
</body>
</html>`;
}
