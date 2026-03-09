import OpenAI from "openai";
import { SitePlan, GeneratePlanInput } from "./types";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY!,
  baseURL: "https://api.groq.com/openai/v1",
});

// Text model — supports JSON mode for reliable structured output
const TEXT_MODEL = "llama-3.3-70b-versatile";
// Vision model — for wireframe image input
const VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

// ─── Planner Agent ────────────────────────────────────────────────────────────

const PLANNER_SYSTEM = `You are a world-class website architect and UX strategist. Your job is to create detailed, opinionated site plans for WordPress + Elementor sites.

Given a user's description, URL analysis, or wireframe, you produce a complete site plan as a JSON object. Your plans should be:
- Strategically sound: right pages, right sections, right order
- Elementor-native: only use sections that map to real Elementor widget types
- Design-opinionated: commit to a clear visual direction
- Content-aware: suggest real, specific content hints per section

Valid section types: hero, navbar, features, about, services, portfolio, testimonials, pricing, team, cta, contact, faq, blog, footer, custom

You MUST respond with ONLY a valid JSON object matching this exact schema. No markdown, no explanation, no code fences — just raw JSON:
{
  "siteName": string,
  "siteTagline": string,
  "industry": string,
  "audience": string,
  "tone": string,
  "pages": [
    {
      "id": string (slug format),
      "name": string,
      "slug": string,
      "isHome": boolean,
      "purpose": string (1 sentence),
      "sections": [
        {
          "id": string,
          "type": SectionType,
          "label": string,
          "description": string,
          "columns": 1|2|3|4,
          "contentHints": string[] (3-5 specific hints)
        }
      ]
    }
  ],
  "designTokens": {
    "primaryColor": string (hex),
    "secondaryColor": string (hex),
    "accentColor": string (hex),
    "backgroundColor": string (hex),
    "textColor": string (hex),
    "headingFont": string (Google Font name),
    "bodyFont": string (Google Font name),
    "borderRadius": "sharp"|"soft"|"rounded",
    "spacing": "compact"|"balanced"|"spacious",
    "style": "minimal"|"corporate"|"creative"|"bold"|"elegant"
  },
  "globalNav": string[] (page names in nav order),
  "reasoning": string (2-3 sentences explaining your strategic choices)
}`;

export async function generateSitePlan(
  input: GeneratePlanInput
): Promise<SitePlan> {
  let userMessage = "";

  if (input.mode === "prompt" && input.prompt) {
    userMessage = `Create a complete site plan for the following:

${input.prompt}

Be specific and opinionated. Choose a distinctive design direction that suits this type of business.`;
  } else if (input.mode === "url" && input.url) {
    userMessage = `Analyze this website and create a site plan that captures its structure and improves upon it:

URL: ${input.url}

Focus on the page structure, section types, and design direction that would work well for this type of site.`;
  } else if (input.mode === "wireframe" && input.wireframeBase64) {
    userMessage =
      "Analyze this wireframe and create a complete Elementor site plan based on the layout and structure shown.";
  }

  // Wireframe mode uses vision model (no JSON mode support)
  if (input.mode === "wireframe" && input.wireframeBase64) {
    const response = await groq.chat.completions.create({
      model: VISION_MODEL,
      max_tokens: 4096,
      messages: [
        { role: "system", content: PLANNER_SYSTEM },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${input.wireframeBase64}`,
              },
            },
            { type: "text", text: userMessage },
          ],
        },
      ],
    });

    const text = response.choices[0].message.content ?? "";
    const clean = text.replace(/```json\n?|```\n?/g, "").trim();
    return JSON.parse(clean) as SitePlan;
  }

  // Text/URL mode — use JSON mode for guaranteed structured output
  const response = await groq.chat.completions.create({
    model: TEXT_MODEL,
    max_tokens: 4096,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: PLANNER_SYSTEM },
      { role: "user", content: userMessage },
    ],
  });

  const text = response.choices[0].message.content ?? "";
  return JSON.parse(text) as SitePlan;
}

// ─── Reviewer Agent ───────────────────────────────────────────────────────────

const REVIEWER_SYSTEM = `You are a senior Elementor developer reviewing a site plan for quality and completeness.

Review the site plan and return a JSON object with:
{
  "approved": boolean,
  "score": number (0-100),
  "issues": string[],
  "suggestions": string[],
  "refinedPlan": <the improved SitePlan object, or null if approved as-is>
}

Check for:
- Every page has a navbar and footer section
- Home page has a hero section
- Sections are in a logical order
- Content hints are specific and actionable
- Design tokens form a cohesive palette
- No duplicate page slugs

You MUST respond with ONLY valid JSON. No markdown, no explanation, no code fences.`;

export async function reviewSitePlan(plan: SitePlan): Promise<{
  approved: boolean;
  score: number;
  issues: string[];
  suggestions: string[];
  refinedPlan: SitePlan | null;
}> {
  const response = await groq.chat.completions.create({
    model: TEXT_MODEL,
    max_tokens: 4096,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: REVIEWER_SYSTEM },
      {
        role: "user",
        content: `Review this site plan and fix any issues:\n\n${JSON.stringify(plan, null, 2)}`,
      },
    ],
  });

  const text = response.choices[0].message.content ?? "";
  return JSON.parse(text);
}
