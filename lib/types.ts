// ─── Site Plan Types ──────────────────────────────────────────────────────────

export type SectionType =
  | "hero"
  | "navbar"
  | "features"
  | "about"
  | "services"
  | "portfolio"
  | "testimonials"
  | "pricing"
  | "team"
  | "cta"
  | "contact"
  | "faq"
  | "blog"
  | "footer"
  | "custom";

export interface Section {
  id: string;
  type: SectionType;
  label: string;
  description: string;
  columns: 1 | 2 | 3 | 4;
  contentHints: string[];
}

export interface Page {
  id: string;
  name: string;
  slug: string;
  isHome: boolean;
  purpose: string;
  sections: Section[];
}

export interface DesignTokens {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  headingFont: string;
  bodyFont: string;
  borderRadius: "sharp" | "soft" | "rounded";
  spacing: "compact" | "balanced" | "spacious";
  style: "minimal" | "corporate" | "creative" | "bold" | "elegant";
}

export interface SitePlan {
  siteName: string;
  siteTagline: string;
  industry: string;
  audience: string;
  tone: string;
  pages: Page[];
  designTokens: DesignTokens;
  globalNav: string[];
  reasoning: string;
}

// ─── Input Types ──────────────────────────────────────────────────────────────

export type InputMode = "prompt" | "url" | "wireframe";

export interface GeneratePlanInput {
  mode: InputMode;
  prompt?: string;
  url?: string;
  wireframeBase64?: string;
}

// ─── Generation Types ─────────────────────────────────────────────────────────

export type GenerationStatus =
  | "idle"
  | "planning"
  | "generating"
  | "reviewing"
  | "complete"
  | "error";

export interface GenerationState {
  status: GenerationStatus;
  sitePlan: SitePlan | null;
  pageJsons: Record<string, object>;
  errors: string[];
}

// ─── WordPress Types ──────────────────────────────────────────────────────────

export interface WPCredentials {
  siteUrl: string;
  username: string;
  appPassword: string;
}
