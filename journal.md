## 2026-02-25 — V3 Block-Based Notes Feature Implemented

### What changed
- Built the complete **Block-Based Notes** module as a new feature alongside existing Concepts and Processes
- 7 block types: Text, Heading, Callout, List, Divider, Reference (links to existing concepts/processes), Code
- 9 note categories: Product, Process, Regulation, Role, Definition, Formula, Case Study, Exam Tip, General
- Tags support (comma-separated, stored as text array)
- Full CRUD: create, view, edit, delete notes with block editor
- Reference blocks can link to existing concepts and processes with searchable picker
- Callout blocks with 4 styles: info, warning, tip, important

### Files created
- `src/lib/notes.ts` — CRUD data layer (getAllNotes, getNoteById, createNote, updateNote, deleteNote)
- `src/components/NoteBlockEditor.tsx` — Block editor: add/remove/reorder blocks, type-specific editing UI
- `src/components/NoteBlockView.tsx` — Block renderer for view mode
- `src/components/NoteCard.tsx` — Card component for notes list
- `src/app/notes/page.tsx` — Notes list with search + category filter
- `src/app/notes/create/page.tsx` — Create note page with block editor
- `src/app/notes/[id]/page.tsx` — Note detail/view page
- `src/app/notes/[id]/edit/page.tsx` — Edit note page
- `src/app/create/concept/page.tsx` — Concept create moved to sub-route

### Files modified
- `src/types.ts` — Added NoteCategory, BlockType, BlockMeta, NoteBlock, Note, NoteFormData, BLOCK_TYPE_CONFIG, CALLOUT_STYLES
- `supabase-schema.sql` — Added `notes` table with JSONB blocks, category CHECK constraint, GIN index on tags
- `src/components/BottomNav.tsx` — Added Notes tab (5 nav items now)
- `src/app/create/page.tsx` — Now shows creation choice: Note / Concept / Process

### Database setup required
Run the new CREATE TABLE statement from `supabase-schema.sql` in Supabase SQL Editor to create the `notes` table.

### Architecture decisions
- **New table, no changes to existing tables** — users have real data in concepts/processes
- **JSONB blocks column** — flexible block storage, each block has id/type/content/meta
- **Reference blocks** — deep integration with existing modules via concept/process picker
- **Same design system** — glassmorphism, dark theme, mobile-first 640px max

---

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

---

## 2026-03-02 — Remove Character Limits & UX Tweaks

### What changed
- **Removed all `maxLength` constraints** from every form field across concept and process forms — users can now write as much as needed without hitting invisible caps
- **Key Characteristics uncapped** — previously hard-capped at 3 entries; "Add characteristic" button is now always available with no upper limit. Label changed from "Max 3" to "Add as many as needed"
- **Home page preview shows Purpose** instead of Key Difference — `ConceptCard` now displays `concept.purpose` for a more informative at-a-glance preview

### Files modified
- `src/components/ConceptForm.tsx` — removed `maxLength` from all 6 text inputs/textareas (title, purpose, used_when, characteristics, key_difference, memory_hook, exam_trap); removed `< 3` guard on `addCharacteristic()`; updated label text
- `src/components/ConceptCard.tsx` — changed preview text from `concept.key_difference` to `concept.purpose`
- `src/app/processes/create/page.tsx` — removed `maxLength` from title, trigger, outcome, exam trap fields
- `src/app/processes/[id]/edit/page.tsx` — removed `maxLength` from title, trigger, outcome, exam trap fields
- `src/components/StepEditor.tsx` — removed `maxLength` from action, actor, decision question, branch label, and notes inputs
---

## 2026-03-02 — Newline / Multi-line Text Support

### What changed
- **All single-line `<input>` fields converted to `<textarea>`** — users can now press Enter to create newlines in any form field (concept forms, process forms, step editor)
- **All text display elements render newlines** — added `whiteSpace: "pre-line"` to every `<p>` and text container across detail views, cards, compare tables, and step list views so saved newlines display correctly

### Forms updated (input → textarea)
- `src/components/ConceptForm.tsx` — title and each key characteristic field converted to `<textarea rows={1}>`
- `src/app/processes/create/page.tsx` — title → `<textarea rows={1}>`, trigger → `<textarea rows={2}>`, outcome → `<textarea rows={2}>`
- `src/app/processes/[id]/edit/page.tsx` — title → `<textarea rows={1}>`, trigger → `<textarea rows={2}>`, outcome → `<textarea rows={2}>`
- `src/components/StepEditor.tsx` — action, actor, decision question, branch label, notes all converted to `<textarea rows={1}>`

### Views updated (whiteSpace: pre-line)
- `src/app/concepts/[id]/page.tsx` — purpose, used_when, key_difference, exam_memory_hook, exam_trap_alert
- `src/app/processes/[id]/page.tsx` — trigger, outcome, exam_trap_alert + StepListView: step.action, step.decision.question, step.notes
- `src/components/ConceptCard.tsx` — purpose preview text
- `src/app/compare/page.tsx` — `renderValue()` wraps all text values and key_characteristics items in `<span>` with pre-line
- `src/app/processes/compare/page.tsx` — trigger, outcome, exam_trap, key steps all wrapped with pre-line

---

## 2026-03-03 — V2 Direction Proposal: Flexible Concept Structure

### What changed
- **Major product direction shift proposed** based on real user feedback: fixed-schema concept forms are too restrictive. Users want to define concepts with fields that match their own mental model.
- **V2 Direction documented in `TechnicalDocumentation.md`** — full proposal covering new data model, template system, comparison adaptation, and migration plan

### Key decisions in the proposal
- **Concept schema changes from fixed columns to `fields: ConceptField[]`** — an ordered array of `{ id, label, value }` pairs stored as JSONB. Users choose what dimensions to capture.
- **`exam_memory_hook` and `exam_trap_alert` stay as dedicated optional fields** — they serve a metacognitive purpose (how to remember / what traps to avoid) and get special UI treatment (icons, colors). Burying them in generic fields would lose that.
- **Template system for cold-start** — built-in templates (Banking Product, Regulation/Policy, Role/Function, General, Blank) pre-fill field labels so users aren't starting from scratch. Custom templates deferred.
- **Comparison adapts dynamically** — instead of fixed dimensions, comparison collects all unique field labels across selected concepts and builds the table from that. This preserves the killer feature.
- **Product principle #1 revised**: "Structure over freedom" → "Guided freedom" — templates and suggestions guide, but never force.
- **Process module stays structured** — step/decision/branching workflows are inherently structured and don't need this flexibility.
- **V1 sections preserved in TechDoc as reference** under "V1 Reference (Original Design)" heading

### Why it matters
- This is the biggest architectural shift since project creation. The Concept entity — the core of the app — is being redesigned.
- The comparison feature (the killer feature) survives because it was never dependent on fixed columns — it only needs shared dimension labels.
- All existing V1 code for concepts (form, detail, card, compare) will need rewrites. Process module is unaffected.
- Database migration path is documented: convert old fixed columns into JSONB `fields[]` entries.

### Status
- Proposal only — no code changes yet. Pending user review and approval before implementation.
- **SUPERSEDED by V3 on 2026-03-03** — see next entry.

---

## 2026-03-03 — V3 Pivot: Note-Taking First (SUPERSEDES V2)

### What changed
- **Fundamental product pivot based on user feedback**: the comparison feature (original "killer feature") is barely used. Users want the app to make **note-taking easier** — not structured differentiation, just fast capture of banking knowledge.
- **V3 direction documented in `TechnicalDocumentation.md`** — full proposal covering new `notes` entity, app restructure, navigation redesign, and coexistence with existing data.
- **V2 (flexible fields) marked as SUPERSEDED** — it still assumed comparison was the core value. V3 abandons that assumption entirely.

### Key decisions
- **New `notes` table (additive only)** — existing `concepts` and `processes` tables are completely untouched. Users' existing data is preserved. The `notes` table stores freeform entries with: title, content (text), category, tags, optional exam_memory_hook, optional exam_trap_alert, linked_concepts, linked_notes.
- **Expanded categories** — `NoteCategory` includes: PRODUCT, PROCESS, REGULATION, ROLE, DEFINITION, FORMULA, CASE_STUDY, EXAM_TIP, GENERAL. More coverage for banking training topics.
- **Navigation redesign** — Home (recent feed) → Search (full-text across all types) → Quick Add (+) → Library (browse by category). Comparison is still available but no longer in main nav.
- **Quick-add form is radically simple** — title + content visible by default; category defaults to GENERAL; tags, memory hook, exam trap, links hidden in collapsible "More" section. Target: under 30 seconds to save a note.
- **Unified home feed** — shows notes, concepts, and processes together sorted by recency. Each type has a distinct icon (📝, 📋, 🔄).
- **Existing features preserved** — concept CRUD, comparison, process module, tutorial module all remain functional and accessible from Library. Nothing is deleted.
- **Templates deferred** — unlike V2's template system, V3 launches without templates. Freeform content doesn't need them. Can be added later as "note starters" with pre-filled content outlines.

### Why it matters
- This is a complete product identity change: from "differentiation-first learning tool" to "personal knowledge base for banking exam prep."
- The original product principle "Structure over freedom" is now replaced with "Capture speed above all."
- The success metric changes from "user compares concepts" to "user creates notes daily."
- Critically, this is purely additive to the database — no migration, no data loss, no risk to existing users.

### What's preserved
- All existing concept data and CRUD flows
- All existing process data and CRUD flows
- Comparison feature (accessible from Library/concepts)
- Exam-oriented features (memory hook, exam trap) — now optional on notes too
- Dark theme, glassmorphism, mobile-first design

### Status
- Proposal only — no code changes yet. Pending user review and approval before implementation.
- **SUPERSEDED by V3 (block-based) on 2026-03-03** — see next entry.

---

## 2026-03-03 — V3 Revised: Block-Based Notes as New Feature

### What changed
- **V3 approach revised**: instead of a full product redesign (replacing nav, rebuilding home page), we're adding a **new "Notes" feature** alongside existing functionality. This is a test — ship it, see if users adopt it, iterate based on data.
- **Block-based editor (Notion-style)** replaces the plain textarea approach. Notes are composed of typed blocks: text, heading, callout (info/warning/tip/important), list (bullet/numbered), divider, reference (embed existing concept/process), code.
- **Blocks stored as JSONB** in a new `notes` table — same pattern as `processes.steps`. Each block has `{ id, type, content, meta }`.
- **No exam_memory_hook / exam_trap_alert as dedicated fields on notes** — the block system handles this naturally via callout blocks with `style: "tip"` and `style: "warning"`.
- **Existing app features completely untouched** — concepts, processes, comparison, learn module all stay exactly as they are. Only additions: new Notes tab in nav, note CRUD pages, block editor components.

### Key decisions
- **Feature addition, not redesign** — lower risk. If notes flop, nothing is damaged. If they succeed, we double down.
- **7 block types for launch**: text, heading, callout, list, divider, reference, code. Extensible later.
- **Reference blocks** are the bridge between new (notes) and existing (concepts/processes) — they embed a mini-card of the referenced item.
- **Tags replace `confused_with` on notes** — broader, more flexible, user-defined organization.
- **NoteCategory expanded to 9 values** — PRODUCT, PROCESS, REGULATION, ROLE, DEFINITION, FORMULA, CASE_STUDY, EXAM_TIP, GENERAL.
- **Nav adds Notes tab** without removing anything. Create page offers choice: New Note / New Concept / New Process.

### Why this approach over V3-old (plain textarea)
- Blocks give **structure without rigidity** — users pick block types, content looks good automatically
- Reference blocks create **cross-links** to existing concepts/processes (the textarea approach had no equivalent)
- Callout blocks naturally replace exam memory hooks / exam traps (colored boxes with icons)
- Extensible — can add new block types later without schema changes

### Status
- Proposal only — no code changes yet. Pending user approval before implementation.