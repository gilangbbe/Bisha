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

---

## 2026-02-24 — Tutorial & Learning Guidance Module

### What changed
- Built the full Tutorial & Learning Guidance Module from spec
- 4 tutorial tracks × 4 cards each, plus 5 contextual micro-tutorials
- New pages: `/learn` (hub) and `/learn/[trackId]` (track viewer)
- BottomNav expanded to 5 tabs (added Learn between Compare and Create)
- Contextual micro-tutorial triggers on Compare page empty state and home page
- Touch-friendly swipe-based card viewer with progress tracking

### Architecture decisions
- **Static data layer** (`src/lib/tutorials.ts`) — all tutorial content is hardcoded, no DB needed for MVP
- **TutorialCardView as atomic unit** — single-responsibility: one card with Good/Bad examples
- **TutorialTrackViewer with touch events** — swipe left/right on mobile, buttons on desktop
- **MicroTutorial as portal overlay** — contextual popup triggered by parent pages, not a route
- **CSS animations in globals.css** — slide-in-left/right for card transitions, fade for micro-tutorials
- **Progress in localStorage** — sessionStorage would lose progress on tab close; localStorage persists across sessions
- **5-tab BottomNav** — Learn icon placed between Compare and Create for natural flow

### Key files
- `src/lib/tutorials.ts` — tutorial content data (tracks, cards, micro-tutorials)
- `src/components/TutorialCardView.tsx` — single card renderer
- `src/components/TutorialTrackViewer.tsx` — swipe-based track viewer
- `src/components/MicroTutorial.tsx` — contextual popup component
- `src/app/learn/page.tsx` — hub page
- `src/app/learn/[trackId]/page.tsx` — track viewer page

---

## 2026-02-24 — Multi-Branch Decision Enhancement

### What changed
- Replaced binary Decision model (`optionA`/`optionB`) with flexible `options: DecisionOption[]` array
- Decisions now support 2–6 branches instead of only Yes/No
- All visualizations (Flowchart, Mindmap), editor, and detail views updated
- Backward-compatible normalization layer in `processes.ts` auto-converts legacy DB records
- Branch color palette cycling (green, red, blue, amber, purple, pink) applied across all views

### Architecture decisions
- **`options[]` array over fixed fields** — scalable to N branches without schema changes; cleaner iteration in rendering
- **`DecisionOption.id` (UUID)** — stable React keys and future-proof for step linking; generated client-side with `uuid`
- **Max 6 options cap** — product principle of low cognitive load; enforced in UI only, not at type level (MAX_DECISION_OPTIONS constant)
- **Min 2 options floor** — a decision with fewer than 2 branches is meaningless; enforced in UI with MIN_DECISION_OPTIONS
- **Backward-compat normalizer in data layer** — old records with `optionA`/`optionB` are converted to `options[]` on read via `normalizeDecision()`, so UI code only sees new format. No DB migration needed.
- **Color palette as constant** — `DECISION_BRANCH_COLORS` in types.ts, cycled via modulo index. Ensures consistent coloring across Flowchart edges, Mindmap sub-branches, StepEditor dots, and detail page labels.
- **FlowchartView: even fan-out** — N branches distributed linearly from `-BRANCH_X_OFFSET` to `+BRANCH_X_OFFSET`, with `fromSide` computed based on branch position relative to center
- **MindmapView: angular spread** — sub-branches distributed evenly using `totalSpread = min(0.6 * N, π * 0.6)`, preventing excessive angular overlap for many branches
- **Compare page: branch count annotations** — Decision Points dimension now shows `(N branches)` suffix for quick differentiation
- **Seed SQL updated to new format** — converted to `options[]` in supabase-schema.sql for clean installs

### Files modified
- `src/types.ts` — new `DecisionOption` interface, `Decision.options[]`, color/limit constants
- `src/lib/processes.ts` — `LegacyDecision` type, `normalizeDecision()`, `normalizeProcess()` functions
- `src/components/StepEditor.tsx` — dynamic option inputs with add/remove, color dots
- `src/components/FlowchartView.tsx` — N-branch layout, colored edges, `optionLabels[]`/`branchTargets[]`
- `src/components/MindmapView.tsx` — dynamic angular sub-branches, colored edges
- `src/app/processes/[id]/page.tsx` — dynamic option list with colored labels
- `src/app/processes/compare/page.tsx` — branch count in Decision Points dimension
- `supabase-schema.sql` — seed data converted to `options[]` format

---

## 2026-02-24 — Deep Recursive Branching (Breaking Change)

### What changed
- **Fundamental schema redesign**: replaced flat `DecisionOption.nextStepId` pointer with recursive `DecisionOption.steps: Step[]` — each branch now contains its own sequence of steps, which can themselves have decisions, enabling arbitrary nesting
- **Removed all backward compatibility**: deleted `LegacyDecision`, `normalizeDecision`, `normalizeProcess`, `normalizeProcesses` — data layer now reads `Process[]` directly from Supabase with no normalization
- **New recursive helpers**: `countAllSteps(steps)` traverses the entire step tree to count all nodes; `collectDecisions(steps, depth)` collects all decisions with depth metadata
- **`MAX_DECISION_DEPTH = 3`**: prevents infinite nesting in editor UI; enforced at the StepEditor level
- **StepEditor fully rewritten**: now a self-recursive component accepting `{ steps, onChange, depth, prefix }` — each decision branch renders a nested `<StepEditor>` for its sub-steps
- **FlowchartView fully rewritten**: new `layoutStepSequence()` recursively lays out step trees; decision nodes fan out into horizontal columns, each column containing that branch's vertical step sequence
- **MindmapView fully rewritten**: new `layoutSubtree()` recursively distributes sub-trees using proportional angular allocation based on `subtreeWeight()` — heavier branches get wider angular slices
- **Process detail page**: new `StepListView` component recursively renders nested steps with hierarchical numbering (e.g., 1, 2.A.1, 2.B.1) and colored branch indicators
- **Compare page**: updated "Decision Points" dimension to use `collectDecisions()` for recursive counting with depth annotations
- **Seed data**: updated Loan Approval process to demonstrate recursive branching — "Yes" branch contains Risk Assessment + Disbursement steps, "No" branch contains Rejection step

### Architecture decisions
- **`steps: Step[]` inside `DecisionOption` (tree structure)** — this is the core change. Instead of pointing to a step elsewhere in a flat array (`nextStepId`), each option *owns* its sub-steps. This makes the data model a true tree: `Step → Decision → DecisionOption[] → Step[] → ...`. Trees are natural for branching workflows and eliminate the complexity of resolving cross-references in a flat list.
- **No backward compat** — user explicitly permitted dropping the existing table. Removing normalization reduced `processes.ts` from ~80 lines to ~40 lines and eliminated an entire class of bugs.
- **`MAX_DECISION_DEPTH = 3`** — practical limit to prevent UI from becoming unusable. 3 levels of nesting is sufficient for most banking processes (e.g., credit check → risk assessment → collateral type). Enforced in UI only, not at type level.
- **Recursive layout algorithms** — both FlowchartView and MindmapView now use recursive layout functions. FlowchartView uses column-based layout (branches side by side), MindmapView uses angular-weighted layout (heavier sub-trees get wider angles). Both calculate bounds dynamically to size the SVG.
- **Hierarchical step numbering** — `StepListView` uses `prefix` strings like "2.A" to create readable hierarchical labels (2.A.1, 2.A.2, 2.B.1) that clearly show nesting context.

### Files modified
- `src/types.ts` — `DecisionOption.steps: Step[]` (removed `nextStepId`), `MAX_DECISION_DEPTH`, `countAllSteps()`, `collectDecisions()`
- `src/lib/processes.ts` — removed all legacy normalization; simplified to direct Supabase queries
- `src/components/StepEditor.tsx` — full rewrite as self-recursive component with depth/prefix props
- `src/components/FlowchartView.tsx` — full rewrite with recursive `layoutStepSequence()` algorithm
- `src/components/MindmapView.tsx` — full rewrite with recursive `layoutSubtree()` and `subtreeWeight()`
- `src/app/processes/[id]/page.tsx` — new recursive `StepListView` component for steps tab
- `src/app/processes/compare/page.tsx` — uses `collectDecisions()` with depth annotations
- `supabase-schema.sql` — seed data uses recursive `steps: []` within options
