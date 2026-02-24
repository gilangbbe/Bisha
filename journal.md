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
