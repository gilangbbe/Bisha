## 2026-02-24 — Project Initialized

### What changed
- Created the Bisha MVP: a differentiation-first learning tool for banking trainees
- Tech stack: Next.js 15 (App Router, Turbopack) + Tailwind CSS v4 + Supabase
- All core features implemented: Concept CRUD, Compare (killer feature), "Often Confused With" navigation, Exam Trap Alerts, Memory Hook priority

### Architecture decisions
- **Supabase from day one** (not localStorage) — user preference
- **Dark theme primary** — reduces eye strain for studying
- **Mobile-first** — max-width 640px container, bottom nav
- **Glassmorphism card design** with micro-animations
- Database schema lives in `supabase-schema.sql` — must be run manually in Supabase SQL Editor
- 5 seed banking concepts: Savings Account, Fixed Deposit, KYC Process, AML, Relationship Manager

### Why it matters
- This is the foundational build. All future features build on this structure.
- The Concept schema is the single most important data model — every field supports differentiation and comparison.

### Key files
- `src/types.ts` — domain model
- `src/lib/supabase.ts` — client config
- `src/lib/concepts.ts` — data access layer
- `src/app/page.tsx` — browse/list
- `src/app/concepts/[id]/page.tsx` — detail view
- `src/app/compare/page.tsx` — side-by-side comparison
- `src/components/ConceptForm.tsx` — create/edit form
- `supabase-schema.sql` — database schema + seed data

## 2026-02-25 — Tutorial & Learning Guidance Module Implemented

### What changed
- Built the full Tutorial Module per `TutorialModuleTechnicalDocumentation.md`
- 4 tutorial tracks with 16 total cards, all using the Bad/Good contrast pattern
- Swipe-based, full-screen card navigation (mobile-first, thumb-safe)
- Contextual micro-tutorial system for behavioral triggers
- "Learn" tab added to bottom nav (5 tabs total: Concepts, Processes, Compare, Learn, Create)

### Architecture decisions
- **No persistence for tutorial state** — single-user app, no auth, all tracks always accessible without needing to track completion. Per doc section 8: "all tracks remain accessible without any state."
- **Tutorial content as static data** — embedded in `src/lib/tutorials.ts`, not stored in Supabase. Tutorial cards are read-only content, not user-generated. No database table needed.
- **Swipe implemented via touch events** — no external swipe library. Keeps dependencies minimal. Threshold set to 50px for comfortable thumb detection.
- **MicroTutorial is a reusable component** — any page can import and trigger it. Uses `toast-in`/`toast-out` animations already in globals.css.
- **Contextual triggers added to Compare page** — shows "Comparison is the point" micro-tutorial when Compare view is empty. Limited to 1 per session (per doc: "Max 1 card per session").
- **"Help me study better" CTA** on home page header — links to /learn hub. This is the primary organic entry point per doc.
- **Bottom nav expanded to 5 items** — standard mobile pattern (iOS/Android both support 5). Learn tab uses a `?` icon to signal help/guidance.

### Key files added
- `src/types.ts` — added `TutorialCard`, `TutorialExample`, `TutorialTrack` types
- `src/lib/tutorials.ts` — all tutorial content (4 tracks × 4 cards each + 5 micro-tutorials)
- `src/components/TutorialCardView.tsx` — single card renderer with Good/Bad examples
- `src/components/TutorialTrackViewer.tsx` — swipe-based track viewer with progress dots
- `src/components/MicroTutorial.tsx` — contextual popup component
- `src/app/learn/page.tsx` — tutorial hub (track selection)
- `src/app/learn/[trackId]/page.tsx` — individual track viewer
- `src/app/globals.css` — tutorial example styles, slide animations, micro-tutorial popup styles

### Why it matters
- Teaches usage philosophy (differentiation thinking), not just feature discovery
- Every tutorial card uses contrast (Bad vs Good) — mirrors how exams test
- Reduces vague entries by showing concrete examples
- Micro-tutorials catch users at key moments (empty compare, first concept) without blocking
