import { DesignTokens, Section } from "./types";

// ─── Core Elementor JSON Types ────────────────────────────────────────────────

export type ElType = "section" | "column" | "widget";

export interface ElementorWidget {
  id: string;
  elType: "widget";
  widgetType: string;
  settings: Record<string, unknown>;
  elements: [];
}

export interface ElementorColumn {
  id: string;
  elType: "column";
  settings: Record<string, unknown>;
  elements: ElementorWidget[];
}

export interface ElementorSection {
  id: string;
  elType: "section";
  settings: Record<string, unknown>;
  elements: ElementorColumn[];
}

export interface ElementorPage {
  version: "0.4";
  title: string;
  type: "page";
  content: ElementorSection[];
  page_settings: Record<string, unknown>;
}

// ─── ID Generator ─────────────────────────────────────────────────────────────

export function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

// ─── Builder Helpers ──────────────────────────────────────────────────────────

export function makeSection(
  settings: Record<string, unknown>,
  columns: ElementorColumn[]
): ElementorSection {
  return { id: uid(), elType: "section", settings, elements: columns };
}

export function makeColumn(
  size: number,
  widgets: ElementorWidget[],
  settings: Record<string, unknown> = {}
): ElementorColumn {
  return {
    id: uid(),
    elType: "column",
    settings: { _column_size: size, ...settings },
    elements: widgets,
  };
}

export function makeWidget(
  widgetType: string,
  settings: Record<string, unknown>
): ElementorWidget {
  return { id: uid(), elType: "widget", widgetType, settings, elements: [] };
}

// ─── Design Token Helpers ─────────────────────────────────────────────────────

function spacingFromTokens(tokens: DesignTokens): {
  top: number;
  bottom: number;
} {
  const map = { compact: 40, balanced: 80, spacious: 120 };
  const v = map[tokens.spacing];
  return { top: v, bottom: v };
}

function radiusFromTokens(tokens: DesignTokens): number {
  return { sharp: 0, soft: 6, rounded: 16 }[tokens.borderRadius];
}

// ─── Section Component Library ────────────────────────────────────────────────
// Each factory returns a fully valid ElementorSection using real widget types.

export function buildNavbar(tokens: DesignTokens, siteName: string, navItems: string[]): ElementorSection {
  return makeSection(
    {
      layout: "full_width",
      background_background: "classic",
      background_color: tokens.backgroundColor,
      custom_height: { unit: "px", size: 80 },
      padding: { unit: "px", top: "0", bottom: "0", left: "20", right: "20", isLinked: false },
    },
    [
      makeColumn(33, [
        makeWidget("heading", {
          title: siteName,
          header_size: "h3",
          typography_typography: "custom",
          typography_font_family: tokens.headingFont,
          typography_font_weight: "700",
          title_color: tokens.textColor,
        }),
      ]),
      makeColumn(67, [
        makeWidget("nav-menu", {
          layout: "horizontal",
          align_items: "center",
          text_align: "right",
          typography_font_family: tokens.bodyFont,
          color: tokens.textColor,
          custom_css_class: "site-nav",
        }),
      ], { "align": "right" }),
    ]
  );
}

export function buildHero(tokens: DesignTokens, hints: string[]): ElementorSection {
  const { top, bottom } = spacingFromTokens(tokens);
  return makeSection(
    {
      layout: "full_width",
      background_background: "classic",
      background_color: tokens.backgroundColor,
      padding: { unit: "px", top: String(top * 2), bottom: String(bottom * 2), left: "20", right: "20", isLinked: false },
      content_width: { unit: "px", size: 1200 },
    },
    [
      makeColumn(100, [
        makeWidget("heading", {
          title: hints[0] || "Bold Headline That Commands Attention",
          header_size: "h1",
          align: "center",
          typography_typography: "custom",
          typography_font_family: tokens.headingFont,
          typography_font_weight: "800",
          typography_font_size: { unit: "px", size: 64 },
          title_color: tokens.textColor,
        }),
        makeWidget("text-editor", {
          editor: `<p style="text-align:center;font-size:20px;color:${tokens.textColor}aa">${hints[1] || "Supporting subheadline that expands on your core value proposition."}</p>`,
        }),
        makeWidget("button", {
          text: hints[2] || "Get Started",
          align: "center",
          size: "lg",
          background_color: tokens.primaryColor,
          button_text_color: "#ffffff",
          border_radius: { unit: "px", size: radiusFromTokens(tokens) },
          typography_font_family: tokens.bodyFont,
          typography_font_weight: "600",
        }),
      ]),
    ]
  );
}

export function buildFeatures(tokens: DesignTokens, hints: string[], columns: number): ElementorSection {
  const { top, bottom } = spacingFromTokens(tokens);
  const colSize = Math.floor(100 / columns);
  const featureCols = Array.from({ length: columns }, (_, i) =>
    makeColumn(colSize, [
      makeWidget("icon", {
        selected_icon: { library: "solid", value: ["fas", "star"] },
        primary_color: tokens.primaryColor,
        size: { unit: "px", size: 40 },
      }),
      makeWidget("heading", {
        title: hints[i] || `Feature ${i + 1}`,
        header_size: "h4",
        typography_font_family: tokens.headingFont,
        typography_font_weight: "600",
        title_color: tokens.textColor,
      }),
      makeWidget("text-editor", {
        editor: `<p style="color:${tokens.textColor}88">A clear description of this feature and the value it delivers to your users.</p>`,
      }),
    ])
  );

  return makeSection(
    {
      layout: "full_width",
      background_background: "classic",
      background_color: tokens.backgroundColor,
      padding: { unit: "px", top: String(top), bottom: String(bottom), left: "20", right: "20", isLinked: false },
    },
    featureCols
  );
}

export function buildAbout(tokens: DesignTokens, hints: string[]): ElementorSection {
  const { top, bottom } = spacingFromTokens(tokens);
  return makeSection(
    {
      layout: "full_width",
      background_background: "classic",
      background_color: tokens.secondaryColor + "22",
      padding: { unit: "px", top: String(top), bottom: String(bottom), left: "20", right: "20", isLinked: false },
    },
    [
      makeColumn(50, [
        makeWidget("image", {
          image: { url: "https://placehold.co/600x400/888/fff?text=About+Us" },
          image_border_radius: { unit: "px", size: radiusFromTokens(tokens) },
        }),
      ]),
      makeColumn(50, [
        makeWidget("heading", {
          title: hints[0] || "Our Story",
          header_size: "h2",
          typography_font_family: tokens.headingFont,
          typography_font_weight: "700",
          title_color: tokens.textColor,
        }),
        makeWidget("text-editor", {
          editor: `<p style="color:${tokens.textColor}bb">${hints[1] || "We are a passionate team dedicated to delivering exceptional results. Our mission drives everything we do — from how we work with clients to the quality of our output."}</p>`,
        }),
        makeWidget("button", {
          text: "Learn More",
          background_color: tokens.primaryColor,
          button_text_color: "#ffffff",
          border_radius: { unit: "px", size: radiusFromTokens(tokens) },
        }),
      ]),
    ]
  );
}

export function buildServices(tokens: DesignTokens, hints: string[]): ElementorSection {
  const { top, bottom } = spacingFromTokens(tokens);
  return makeSection(
    {
      layout: "full_width",
      background_background: "classic",
      background_color: tokens.backgroundColor,
      padding: { unit: "px", top: String(top), bottom: String(bottom), left: "20", right: "20", isLinked: false },
    },
    [
      makeColumn(100, [
        makeWidget("heading", {
          title: "Our Services",
          header_size: "h2",
          align: "center",
          typography_font_family: tokens.headingFont,
          typography_font_weight: "700",
          title_color: tokens.textColor,
        }),
        makeWidget("icon-list", {
          icon_list: hints.map((hint) => ({
            id: uid(),
            text: hint,
            selected_icon: { library: "solid", value: ["fas", "check"] },
            link: { url: "" },
          })),
          icon_color: tokens.accentColor,
          text_color: tokens.textColor,
          typography_font_family: tokens.bodyFont,
          typography_font_size: { unit: "px", size: 18 },
          space_between: { unit: "px", size: 16 },
        }),
      ]),
    ]
  );
}

export function buildTestimonials(tokens: DesignTokens, hints: string[]): ElementorSection {
  const { top, bottom } = spacingFromTokens(tokens);
  return makeSection(
    {
      layout: "full_width",
      background_background: "classic",
      background_color: tokens.primaryColor + "11",
      padding: { unit: "px", top: String(top), bottom: String(bottom), left: "20", right: "20", isLinked: false },
    },
    [
      makeColumn(100, [
        makeWidget("heading", {
          title: "What Our Clients Say",
          header_size: "h2",
          align: "center",
          typography_font_family: tokens.headingFont,
          title_color: tokens.textColor,
        }),
      ]),
      ...Array.from({ length: 3 }, (_, i) =>
        makeColumn(33, [
          makeWidget("testimonial", {
            content: hints[i] || `"An incredible experience working with this team. They delivered beyond expectations and were professional throughout."`,
            name: `Client ${i + 1}`,
            job: "CEO, Company",
            image: { url: `https://placehold.co/80x80/888/fff?text=C${i + 1}` },
            alignment: "center",
            text_color: tokens.textColor,
            name_color: tokens.primaryColor,
          }),
        ])
      ),
    ]
  );
}

export function buildPricing(tokens: DesignTokens, hints: string[]): ElementorSection {
  const { top, bottom } = spacingFromTokens(tokens);
  const tiers = ["Starter", "Professional", "Enterprise"];
  const prices = ["$29", "$79", "$199"];
  return makeSection(
    {
      layout: "full_width",
      background_background: "classic",
      background_color: tokens.backgroundColor,
      padding: { unit: "px", top: String(top), bottom: String(bottom), left: "20", right: "20", isLinked: false },
    },
    [
      makeColumn(100, [
        makeWidget("heading", {
          title: "Simple, Transparent Pricing",
          header_size: "h2",
          align: "center",
          typography_font_family: tokens.headingFont,
          title_color: tokens.textColor,
        }),
      ]),
      ...tiers.map((tier, i) =>
        makeColumn(33, [
          makeWidget("price-table", {
            heading: tier,
            price: prices[i],
            period: "/month",
            features_list: [
              { item_text: hints[0] || "Core feature included" },
              { item_text: hints[1] || "Priority support" },
              { item_text: hints[2] || "Analytics dashboard" },
            ],
            button_text: "Get Started",
            button_background_color: i === 1 ? tokens.primaryColor : "transparent",
            button_text_color: i === 1 ? "#ffffff" : tokens.primaryColor,
            background_color: i === 1 ? tokens.primaryColor + "15" : tokens.backgroundColor,
            border_width: { unit: "px", top: "1", right: "1", bottom: "1", left: "1" },
            border_color: i === 1 ? tokens.primaryColor : tokens.secondaryColor + "44",
            border_radius: { unit: "px", size: radiusFromTokens(tokens) },
            heading_color: tokens.textColor,
            price_color: tokens.primaryColor,
          }),
        ])
      ),
    ]
  );
}

export function buildCTA(tokens: DesignTokens, hints: string[]): ElementorSection {
  return makeSection(
    {
      layout: "full_width",
      background_background: "classic",
      background_color: tokens.primaryColor,
      padding: { unit: "px", top: "80", bottom: "80", left: "20", right: "20", isLinked: false },
    },
    [
      makeColumn(100, [
        makeWidget("heading", {
          title: hints[0] || "Ready to Get Started?",
          header_size: "h2",
          align: "center",
          typography_font_family: tokens.headingFont,
          typography_font_weight: "700",
          title_color: "#ffffff",
        }),
        makeWidget("text-editor", {
          editor: `<p style="text-align:center;color:rgba(255,255,255,0.8);font-size:18px">${hints[1] || "Join thousands of satisfied customers. No commitment required."}</p>`,
        }),
        makeWidget("button", {
          text: hints[2] || "Start Free Trial",
          align: "center",
          size: "lg",
          background_color: "#ffffff",
          button_text_color: tokens.primaryColor,
          hover_color: tokens.secondaryColor,
          border_radius: { unit: "px", size: radiusFromTokens(tokens) },
          typography_font_weight: "700",
        }),
      ]),
    ]
  );
}

export function buildContact(tokens: DesignTokens, hints: string[]): ElementorSection {
  const { top, bottom } = spacingFromTokens(tokens);
  return makeSection(
    {
      layout: "full_width",
      background_background: "classic",
      background_color: tokens.backgroundColor,
      padding: { unit: "px", top: String(top), bottom: String(bottom), left: "20", right: "20", isLinked: false },
    },
    [
      makeColumn(50, [
        makeWidget("heading", {
          title: hints[0] || "Get In Touch",
          header_size: "h2",
          typography_font_family: tokens.headingFont,
          title_color: tokens.textColor,
        }),
        makeWidget("text-editor", {
          editor: `<p style="color:${tokens.textColor}88">${hints[1] || "We'd love to hear from you. Fill out the form and we'll get back to you within 24 hours."}</p>`,
        }),
        makeWidget("icon-list", {
          icon_list: [
            { id: uid(), text: "hello@company.com", selected_icon: { library: "solid", value: ["fas", "envelope"] } },
            { id: uid(), text: "+1 (555) 000-0000", selected_icon: { library: "solid", value: ["fas", "phone"] } },
            { id: uid(), text: "123 Main St, City, Country", selected_icon: { library: "solid", value: ["fas", "location-dot"] } },
          ],
          icon_color: tokens.primaryColor,
          text_color: tokens.textColor,
        }),
      ]),
      makeColumn(50, [
        makeWidget("form", {
          form_name: "Contact Form",
          form_fields: [
            { field_type: "text", field_label: "Your Name", field_placeholder: "John Doe", required: "true", width: "100" },
            { field_type: "email", field_label: "Email Address", field_placeholder: "john@example.com", required: "true", width: "100" },
            { field_type: "textarea", field_label: "Message", field_placeholder: "How can we help?", required: "true", width: "100", rows: 5 },
          ],
          button_text: "Send Message",
          button_background_color: tokens.primaryColor,
          button_text_color: "#ffffff",
          input_border_radius: { unit: "px", size: radiusFromTokens(tokens) },
        }),
      ]),
    ]
  );
}

export function buildPortfolio(tokens: DesignTokens, hints: string[]): ElementorSection {
  const { top, bottom } = spacingFromTokens(tokens);
  return makeSection(
    {
      layout: "full_width",
      background_background: "classic",
      background_color: tokens.backgroundColor,
      padding: { unit: "px", top: String(top), bottom: String(bottom), left: "20", right: "20", isLinked: false },
    },
    [
      makeColumn(100, [
        makeWidget("heading", {
          title: hints[0] || "Our Work",
          header_size: "h2",
          align: "center",
          typography_font_family: tokens.headingFont,
          title_color: tokens.textColor,
        }),
        makeWidget("portfolio", {
          columns: "3",
          orderby: "date",
          order: "DESC",
          show_filter: "yes",
          item_ratio: { unit: "%", size: 66.66 },
          overlay_background_color: tokens.primaryColor + "dd",
          overlay_text_color: "#ffffff",
        }),
      ]),
    ]
  );
}

export function buildTeam(tokens: DesignTokens, hints: string[]): ElementorSection {
  const { top, bottom } = spacingFromTokens(tokens);
  return makeSection(
    {
      layout: "full_width",
      background_background: "classic",
      background_color: tokens.secondaryColor + "11",
      padding: { unit: "px", top: String(top), bottom: String(bottom), left: "20", right: "20", isLinked: false },
    },
    [
      makeColumn(100, [
        makeWidget("heading", {
          title: "Meet The Team",
          header_size: "h2",
          align: "center",
          typography_font_family: tokens.headingFont,
          title_color: tokens.textColor,
        }),
      ]),
      ...Array.from({ length: 3 }, (_, i) =>
        makeColumn(33, [
          makeWidget("team-member", {
            image: { url: `https://placehold.co/200x200/888/fff?text=Team${i + 1}` },
            name: hints[i] || `Team Member ${i + 1}`,
            position: "Co-Founder",
            description: "Passionate about building great products and serving our customers.",
            image_size: "medium",
            name_color: tokens.textColor,
            position_color: tokens.primaryColor,
            description_color: tokens.textColor + "99",
            image_border_radius: { unit: "%", size: 50 },
          }),
        ])
      ),
    ]
  );
}

export function buildFAQ(tokens: DesignTokens, hints: string[]): ElementorSection {
  const { top, bottom } = spacingFromTokens(tokens);
  return makeSection(
    {
      layout: "full_width",
      background_background: "classic",
      background_color: tokens.backgroundColor,
      padding: { unit: "px", top: String(top), bottom: String(bottom), left: "20", right: "20", isLinked: false },
    },
    [
      makeColumn(100, [
        makeWidget("heading", {
          title: "Frequently Asked Questions",
          header_size: "h2",
          align: "center",
          typography_font_family: tokens.headingFont,
          title_color: tokens.textColor,
        }),
        makeWidget("accordion", {
          tabs: hints.map((hint, i) => ({
            tab_title: hint || `Question ${i + 1}`,
            tab_content: "Provide a clear and helpful answer to this question here. Be specific and address the core concern your audience has.",
          })),
          icon: { library: "solid", value: ["fas", "plus"] },
          icon_active: { library: "solid", value: ["fas", "minus"] },
          title_color: tokens.textColor,
          title_active_color: tokens.primaryColor,
          border_color: tokens.secondaryColor + "44",
          icon_color: tokens.primaryColor,
        }),
      ]),
    ]
  );
}

export function buildFooter(tokens: DesignTokens, siteName: string, navItems: string[]): ElementorSection {
  return makeSection(
    {
      layout: "full_width",
      background_background: "classic",
      background_color: tokens.textColor === "#ffffff" ? "#111111" : "#1a1a1a",
      padding: { unit: "px", top: "60", bottom: "40", left: "20", right: "20", isLinked: false },
    },
    [
      makeColumn(33, [
        makeWidget("heading", {
          title: siteName,
          header_size: "h4",
          typography_font_family: tokens.headingFont,
          title_color: "#ffffff",
        }),
        makeWidget("text-editor", {
          editor: `<p style="color:rgba(255,255,255,0.5);font-size:14px">© ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>`,
        }),
      ]),
      makeColumn(33, [
        makeWidget("heading", {
          title: "Navigation",
          header_size: "h6",
          title_color: "#ffffff",
          typography_font_family: tokens.headingFont,
        }),
        makeWidget("icon-list", {
          icon_list: navItems.map((item) => ({
            id: uid(),
            text: item,
            link: { url: "#" },
            selected_icon: { library: "solid", value: ["fas", "angle-right"] },
          })),
          text_color: "rgba(255,255,255,0.6)",
          icon_color: tokens.primaryColor,
        }),
      ]),
      makeColumn(33, [
        makeWidget("heading", {
          title: "Connect",
          header_size: "h6",
          title_color: "#ffffff",
          typography_font_family: tokens.headingFont,
        }),
        makeWidget("social-icons", {
          social_icon_list: [
            { social_icon: { library: "brand", value: ["fab", "twitter"] }, link: { url: "#" } },
            { social_icon: { library: "brand", value: ["fab", "linkedin"] }, link: { url: "#" } },
            { social_icon: { library: "brand", value: ["fab", "instagram"] }, link: { url: "#" } },
          ],
          icon_size: { unit: "px", size: 20 },
          icon_color: "rgba(255,255,255,0.6)",
          hover_primary_color: tokens.primaryColor,
          shape: "rounded",
          color_type: "custom",
        }),
      ]),
    ]
  );
}

export function buildBlog(tokens: DesignTokens, hints: string[]): ElementorSection {
  const { top, bottom } = spacingFromTokens(tokens);
  return makeSection(
    {
      layout: "full_width",
      background_background: "classic",
      background_color: tokens.backgroundColor,
      padding: { unit: "px", top: String(top), bottom: String(bottom), left: "20", right: "20", isLinked: false },
    },
    [
      makeColumn(100, [
        makeWidget("heading", {
          title: hints[0] || "Latest Articles",
          header_size: "h2",
          align: "center",
          typography_font_family: tokens.headingFont,
          title_color: tokens.textColor,
        }),
        makeWidget("posts", {
          columns: "3",
          posts_per_page: "6",
          show_image: "yes",
          show_title: "yes",
          show_excerpt: "yes",
          show_read_more: "yes",
          read_more_text: "Read More",
          image_border_radius: { unit: "px", size: radiusFromTokens(tokens) },
          title_color: tokens.textColor,
          meta_color: tokens.textColor + "88",
          excerpt_color: tokens.textColor + "99",
          read_more_color: tokens.primaryColor,
        }),
      ]),
    ]
  );
}

// ─── Main Section Builder ─────────────────────────────────────────────────────

export function buildSection(
  section: Section,
  tokens: DesignTokens,
  siteName: string,
  navItems: string[]
): ElementorSection {
  const hints = section.contentHints;

  switch (section.type) {
    case "navbar":   return buildNavbar(tokens, siteName, navItems);
    case "hero":     return buildHero(tokens, hints);
    case "features": return buildFeatures(tokens, hints, section.columns);
    case "about":    return buildAbout(tokens, hints);
    case "services": return buildServices(tokens, hints);
    case "testimonials": return buildTestimonials(tokens, hints);
    case "pricing":  return buildPricing(tokens, hints);
    case "cta":      return buildCTA(tokens, hints);
    case "contact":  return buildContact(tokens, hints);
    case "portfolio": return buildPortfolio(tokens, hints);
    case "team":     return buildTeam(tokens, hints);
    case "faq":      return buildFAQ(tokens, hints);
    case "blog":     return buildBlog(tokens, hints);
    case "footer":   return buildFooter(tokens, siteName, navItems);
    default:         return buildCTA(tokens, hints);
  }
}

// ─── Page Builder ─────────────────────────────────────────────────────────────

export function buildPage(
  pageName: string,
  sections: Section[],
  tokens: DesignTokens,
  siteName: string,
  navItems: string[]
): ElementorPage {
  return {
    version: "0.4",
    title: pageName,
    type: "page",
    content: sections.map((s) => buildSection(s, tokens, siteName, navItems)),
    page_settings: {
      background_background: "classic",
      background_color: tokens.backgroundColor,
    },
  };
}
