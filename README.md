# elementorAI

> Generate complete multi-page Elementor WordPress sites from a prompt, URL, or wireframe.

## Setup

```bash
npm install
cp .env.local.example .env.local   # add ANTHROPIC_API_KEY
npm run dev
```

Open http://localhost:3000

## Phases Complete

| Phase | Feature |
|-------|---------|
| 1 | Text prompt → agentic site plan (planner + reviewer) |
| 2 | Elementor JSON generation via component library |
| 3 | URL scraper — extracts sections, colors, fonts, copy |
| 4 | Wireframe image input via Claude Vision |
| 5 | WordPress REST API push via Application Passwords |

## Architecture

```
app/
  page.tsx                Input (prompt / URL / wireframe)
  plan/page.tsx           Plan preview + approval
  export/page.tsx         Live generation + export
  api/plan/               Planner + Reviewer agents
  api/generate/           Streaming JSON builder
  api/scrape/             URL scraper
  api/wordpress/          WP REST API push

components/
  SitePlanView            Visual sitemap
  GenerationProgress      Streaming progress UI
  ExportPanel             Download ZIP + WP push
  WordPressConnect        WP credentials form

lib/
  claude.ts               AI agents (planner, reviewer)
  elementor.ts            JSON builder + component library
  scraper.ts              Cheerio URL analysis
  types.ts                TypeScript types
```

## WordPress Integration

1. WP Admin → Users → Profile → Application Passwords
2. Generate a password, copy it
3. In the tool: paste site URL, username, and the app password
4. Click "Push to WordPress" — pages are created as drafts with Elementor data injected

Requires WordPress 5.6+ with Elementor installed.
