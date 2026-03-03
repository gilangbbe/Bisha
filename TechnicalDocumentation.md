Project: Banking Knowledge Base — Learning & Note-Taking Tool

---

## V3 Direction: Block-Based Notes (New Feature, Not a Redesign)

> Date: 2026-03-03
> Status: PROPOSAL — pending implementation
> Trigger: User feedback says the app works for structured concepts, but they also want a fast way to take freeform notes. Instead of redesigning the existing MVP, we **add a new feature** with its own database table to test whether block-based note-taking gets adopted.
> Strategy: **Ship alongside existing features.** If users adopt notes, we double down. If not, no damage. The existing concept/process/compare features stay exactly as they are.

### The Strategy: Feature Addition, Not Product Pivot

Previous proposals (V2, V3-old) tried to redesign the whole app. That's risky — it disrupts existing users and bets everything on an assumption.

Better approach: **add a new "Notes" feature** as a parallel track. Users get a new tab, a new creation flow, and a block-based editor. The existing concept cards, processes, and comparison all keep working. We observe which features get used and evolve based on real data.

This is a test, not a commitment.

### What Is a Block-Based Note?

Like Notion: a note is a sequence of **blocks**. Each block has a type that determines how it renders and what controls it offers. Users build notes by adding and arranging blocks.

Why blocks instead of a single textarea?
- **Structure emerges naturally** — users don't type markdown, they pick block types
- **Rich rendering** — callouts look like callouts, lists look like lists, references embed live concept cards
- **Reorderable** — drag or arrow to move blocks around
- **Extensible** — new block types can be added later without changing existing data

### Block Types

| Type | Purpose | Content | Rendering |
|---|---|---|---|
| `text` | General paragraph | Free text (supports newlines within block) | Normal paragraph text |
| `heading` | Section header | Short text | Bold, larger font. Level stored in metadata (h2 or h3) |
| `callout` | Highlighted box | Free text | Colored box with icon. Style in metadata: `info` (blue 💡), `warning` (amber ⚠️), `tip` (green ✅), `important` (red 🔴) |
| `list` | Bullet or numbered list | Items stored as string array in metadata | Rendered as ul/ol. List style in metadata: `bullet` or `numbered` |
| `divider` | Visual separator | *(none)* | Horizontal line |
| `reference` | Link to existing concept, process, or note | *(none — resolved from ID)* | Embedded mini-card showing the referenced item's title, category, and preview. Tappable to navigate. |
| `code` | Code/formula/technical text | Free text | Monospaced, dark background block |

### Data Model

```
Note {
  id: UUID
  title: string                    // required — every note needs a name
  blocks: NoteBlock[]              // ordered array of blocks (JSONB)
  category: NoteCategory           // required — for filtering
  tags: string[]                   // optional — user-defined tags
  created_at: timestamp
  updated_at: timestamp
}

NoteBlock {
  id: UUID                         // stable key for React rendering and reordering
  type: BlockType                  // "text" | "heading" | "callout" | "list" | "divider" | "reference" | "code"
  content: string                  // main text (empty for divider and reference)
  meta: BlockMeta                  // type-specific data
}

BlockMeta {
  // For heading:
  level?: 2 | 3                    // h2 or h3

  // For callout:
  style?: "info" | "warning" | "tip" | "important"

  // For list:
  listStyle?: "bullet" | "numbered"
  items?: string[]                 // list items

  // For reference:
  refType?: "concept" | "process" | "note"  // what kind of item is referenced
  refId?: UUID                     // the referenced item's ID
}

NoteCategory (enum) {
  PRODUCT                          // Banking products
  PROCESS                          // Workflows, procedures
  REGULATION                       // Rules, compliance, legal
  ROLE                             // People, departments
  DEFINITION                       // Terms, jargon, acronyms
  FORMULA                          // Calculations, ratios
  CASE_STUDY                       // Real scenarios, examples
  EXAM_TIP                         // Exam strategies
  GENERAL                          // Anything else
}
```

**Design decisions:**
- **`blocks` as JSONB** — same pattern as `processes.steps`. The block tree is the note's content, stored as a single JSONB column. Simple, no joins, easy to reorder.
- **`meta` as a flexible object** — each block type uses different fields in `meta`. This avoids a separate table per block type. TypeScript union types keep it type-safe on the client.
- **No `exam_memory_hook` / `exam_trap_alert` as dedicated fields** — in the block system, users can add a `callout` block with `style: "tip"` for memory hooks or `style: "warning"` for exam traps. The block system naturally handles this without special fields.
- **Tags instead of `confused_with`** — notes link to concepts via `reference` blocks, not a dedicated relationship field. Tags provide the cross-cutting organization.

### Database (New Table Only)

```sql
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  blocks JSONB NOT NULL DEFAULT '[]',
  category TEXT NOT NULL DEFAULT 'GENERAL'
    CHECK (category IN (
      'PRODUCT', 'PROCESS', 'REGULATION', 'ROLE',
      'DEFINITION', 'FORMULA', 'CASE_STUDY', 'EXAM_TIP', 'GENERAL'
    )),
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" ON notes FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_tags ON notes USING gin(tags);
```

**Zero changes to `concepts` or `processes` tables.**

### Block Editor UX

The editor is the core of the feature. It must feel fast and intuitive on mobile.

#### Adding Blocks

At the bottom of the block list (and between blocks), there's an "Add block" button that opens a block type picker:

```
┌──────────────────────────────┐
│  + Add Block                 │
├──────────────────────────────┤
│  📝 Text         Plain text  │
│  📌 Heading      Section     │
│  💡 Callout      Highlight   │
│  📋 List         Items       │
│  ── Divider      Separator   │
│  🔗 Reference    Link item   │
│  💻 Code         Technical   │
└──────────────────────────────┘
```

#### Editing Blocks

Each block renders in edit mode with:
- A **type indicator** on the left (icon or colored bar)
- The **content area** (textarea for text/heading/callout/code, item list for list, concept picker for reference)
- A **toolbar row** with: move up ↑, move down ↓, change type, delete ×
- Type-specific controls (callout style picker, list style toggle, heading level toggle)

#### Block Rendering (View Mode)

```
┌─────────────────────────────────────────┐
│ [Category]  Note Title                  │
│ Created: date                           │
│                                         │
│ This is a text block. It renders as a   │
│ normal paragraph.                       │
│                                         │
│ ── Section Heading ──                   │
│                                         │
│ 💡 ┌─────────────────────────────────┐  │
│    │ This is a callout block.        │  │
│    │ Important info highlighted.     │  │
│    └─────────────────────────────────┘  │
│                                         │
│ • First item                            │
│ • Second item                           │
│ • Third item                            │
│                                         │
│ ─────────────────────                   │
│                                         │
│ ┌─ 📋 Referenced Concept ──────────┐   │
│ │ [PRODUCT] Savings Account        │   │
│ │ A deposit account that earns...  │   │
│ └──────────────────────────────────┘   │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ code or formula block              │ │
│ │ monospaced text here               │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Tags: #banking #products               │
│                                         │
│ [Edit] [Delete]                         │
└─────────────────────────────────────────┘
```

#### Quick Start: Empty Note

When creating a new note, the form starts with:
1. Title input (auto-focused)
2. Category picker (defaults to GENERAL)
3. One empty `text` block (ready to type immediately)
4. "+ Add Block" button below

Users can start typing instantly. Adding more blocks or changing types is progressive — available but not in the way.

### How Notes Integrate With Existing App

#### Navigation

The bottom nav adds one new entry. Options:

| Current Nav | New Nav | Change |
|---|---|---|
| Home | Home | Add "Notes" section alongside concepts |
| Compare | Compare | No change |
| Learn | Learn | No change |
| Create (concepts) | Create | Expanded — pick "Note" or "Concept" or "Process" |
| Processes | Processes | No change |

Or simpler: add a "Notes" tab to the bottom nav, replacing Learn (which is underused) or adding a 6th item.

The exact nav arrangement can be decided during implementation — the key point is notes are reachable in **one tap** from anywhere.

#### Home Page

Add a section or tab for recent notes alongside the existing concept list. Options:
- **Tab approach:** Home has tabs: "All" | "Notes" | "Concepts" | "Processes"
- **Section approach:** Home shows recent notes at top, then concepts below

#### Create Flow

The create button (or page) offers a choice:
- 📝 **New Note** — opens block editor
- 📋 **New Concept** — opens existing ConceptForm (unchanged)
- 🔄 **New Process** — opens existing process create flow (unchanged)

### TypeScript Types

```typescript
export enum NoteCategory {
  PRODUCT = "PRODUCT",
  PROCESS = "PROCESS",
  REGULATION = "REGULATION",
  ROLE = "ROLE",
  DEFINITION = "DEFINITION",
  FORMULA = "FORMULA",
  CASE_STUDY = "CASE_STUDY",
  EXAM_TIP = "EXAM_TIP",
  GENERAL = "GENERAL",
}

export type BlockType = "text" | "heading" | "callout" | "list" | "divider" | "reference" | "code";

export interface BlockMeta {
  level?: 2 | 3;
  style?: "info" | "warning" | "tip" | "important";
  listStyle?: "bullet" | "numbered";
  items?: string[];
  refType?: "concept" | "process" | "note";
  refId?: string;
}

export interface NoteBlock {
  id: string;
  type: BlockType;
  content: string;
  meta: BlockMeta;
}

export interface Note {
  id: string;
  title: string;
  blocks: NoteBlock[];
  category: NoteCategory;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export type NoteFormData = Omit<Note, "id" | "created_at" | "updated_at">;
```

### Summary of Implementation Work

| Component | Type | Description |
|---|---|---|
| `types.ts` | Modify | Add `Note`, `NoteBlock`, `BlockMeta`, `NoteCategory`, `BlockType` types |
| `supabase-schema.sql` | Modify | Add `notes` table CREATE statement (additive) |
| `lib/notes.ts` | New | CRUD functions for notes (same pattern as `lib/concepts.ts`) |
| `components/NoteBlockEditor.tsx` | New | Single block editor component (renders different UI per block type) |
| `components/NoteEditor.tsx` | New | Full note editor — manages block array, add/remove/reorder |
| `components/NoteBlockView.tsx` | New | Single block renderer for view mode |
| `components/NoteCard.tsx` | New | Card component for note list items (title + preview + category + tags) |
| `app/notes/page.tsx` | New | Notes list page |
| `app/notes/create/page.tsx` | New | Create note page with block editor |
| `app/notes/[id]/page.tsx` | New | Note detail/view page |
| `app/notes/[id]/edit/page.tsx` | New | Edit note page with block editor |
| `components/BottomNav.tsx` | Modify | Add Notes tab |
| `app/create/page.tsx` | Modify | Add "New Note" option alongside existing concept/process creation |
| `app/page.tsx` | Modify | Add notes section/tab to home page |

### What This Does NOT Change
- `concepts` table — untouched
- `processes` table — untouched
- ConceptForm, ConceptCard — untouched
- Concept detail, edit, compare pages — untouched
- Process create, edit, detail, compare pages — untouched
- StepEditor, FlowchartView, MindmapView — untouched
- Tutorial/Learn module — untouched
- Dark theme, glassmorphism, mobile-first design — consistent across new pages

### Success Criteria
This feature test is successful if:
- Users create notes **at least as often** as they create concepts
- The block editor feels **fast enough** on mobile (no laggy re-renders)
- Users use **multiple block types** (not just text — callouts, lists, references)
- Reference blocks create **cross-links** between notes and existing concepts

If this succeeds → notes become the primary creation flow and we can evolve the home page around them.
If this fails → we learned cheaply. Existing features are unaffected.

Primary emotional success:
**"I can write it down exactly how I think about it."**

---

## V3-old Direction: Note-Taking First / Plain Textarea (SUPERSEDED)

> Date: 2026-03-03
> Status: **SUPERSEDED by V3 (block-based)** — This version proposed a full app pivot around freeform textarea notes with a redesigned nav (Home feed, Search, Quick Add, Library). The subsequent refinement keeps the same "add notes" spirit but uses a block-based editor (like Notion) and frames it as a **feature addition** rather than a full product redesign. Existing features stay untouched.
> Kept here for historical context only.

The original V3 proposed: single textarea for note content, new `notes` table with `content TEXT`, redesigned navigation replacing Compare with Search, unified home feed, radical simplicity. While the instinct was right (users want easier note-taking), the approach was too aggressive (full redesign) and the format too limiting (plain textarea). The block-based approach gives structure without rigidity.

---

## V2 Direction: Flexible Concept Structure (SUPERSEDED)

> Date: 2026-03-03
> Status: **SUPERSEDED by V3** — The V2 proposal assumed comparison was still the killer feature and redesigned the concept schema around flexible fields. Subsequent user feedback revealed comparison isn't the primary use case at all. V3 takes a fundamentally different approach.
> Kept here for historical context only.

Real feedback: users want to define concepts freely. Some concepts need "Definition + Example + Risk Level." Others need "Eligibility Criteria + Required Documents + Timeline." Forcing everything into one schema creates friction and discourages usage.

### The Insight: Comparison Doesn't Require a Fixed Schema

The killer feature is comparison. The V1 assumption was: "comparison needs fixed columns." This is wrong.

Comparison needs **shared dimension labels**. If two concepts both have a field labeled "Purpose," they compare on that dimension. If only one has it, the other cell shows "—". The comparison table dynamically adapts to whatever fields exist across the selected concepts.

This means we can give users full freedom on which fields to include while **preserving and even strengthening** the comparison feature — because now users compare on the dimensions they actually care about.

### New Product Principles

The V1 principles need revision:

| V1 Principle | V2 Principle | Rationale |
|---|---|---|
| Structure over freedom | **Guided freedom** | Offer templates and suggestions, but never force fields the user doesn't need. The user knows what matters for their learning. |
| Differentiation-first | **Differentiation-first** (unchanged) | Still the core mission. Flexible fields don't weaken this — comparison adapts to user-defined dimensions. |
| Small cognitive load | **Progressive complexity** | Start simple (template or blank + add fields), let users build complexity as they need it. |
| Mobile-first | **Mobile-first** (unchanged) | Still the primary use case. |

New addition:
- **User ownership**: Users decide what's worth capturing. The system helps them *organize* and *compare*, not dictate what to write.

### New Concept Data Model

```
Concept {
  id: UUID
  title: string                    // required — every concept needs a name
  category: ConceptCategory        // required — for filtering and organization
  fields: ConceptField[]           // ordered array of user-defined dimensions
  exam_memory_hook?: string        // optional special field (kept for unique UI treatment)
  exam_trap_alert?: string         // optional special field (kept for unique UI treatment)
  confused_with: UUID[]            // still references other concepts
  created_at: timestamp
  updated_at: timestamp
}

ConceptField {
  id: UUID                         // stable key for React rendering and reordering
  label: string                    // dimension name (e.g., "Purpose", "Risk Level", "Eligibility")
  value: string                    // the content (supports newlines, no character limit)
}
```

**What stays:**
- `title` — you need a name
- `category` — you need organization
- `confused_with` — relationships are orthogonal to content structure
- `exam_memory_hook` and `exam_trap_alert` — these get special UI treatment (💡 and ⚠️ icons, highlight colors). Keeping them as dedicated optional fields preserves their visual distinction without complicating the general field system.

**What changes:**
- `purpose`, `used_when`, `key_characteristics`, `key_difference` → all replaced by `fields[]`
- Users add fields with any label and any value
- Field order is preserved and user-controllable (drag or up/down arrows)

**Why keep exam_memory_hook and exam_trap_alert separate?**
They serve a *metacognitive* purpose — they're not about the concept itself, but about *how to remember it* and *what traps to avoid*. Their special rendering (warning colors, priority placement) would be lost if buried in generic fields. Keeping them as optional toggle-on fields gives them first-class UI treatment while remaining non-mandatory.

### Template System

Freedom without guidance is a blank page. Templates solve cold-start paralysis.

**How templates work:**
- A template is a list of field labels with no values
- When creating a concept, the user picks a template (or starts blank)
- The form pre-populates with empty fields using those labels
- Users can always add, remove, or rename fields regardless of template

**Built-in templates:**

| Template | Pre-filled Field Labels |
|---|---|
| Banking Product | Purpose, Used When, Key Characteristics, Key Difference |
| Regulation / Policy | Purpose, Scope, Key Requirements, Penalties |
| Role / Function | Responsibilities, Reports To, Key Skills, Scope of Authority |
| General | Definition, Key Points, Example |
| Blank | *(no pre-filled fields)* |

**Custom templates (future):**
- "Save as template" from any existing concept
- User-created templates appear alongside built-in ones

For MVP of V2, built-in templates only. Custom templates can come later.

### How Comparison Adapts

**V1:** Fixed dimensions → fixed table columns.
**V2:** Dynamic dimensions → table rows are the union of all field labels across selected concepts.

Algorithm:
1. User selects 2–4 concepts
2. Collect all unique field labels (case-insensitive) across all selected concepts, preserving encounter order
3. Each label becomes a row in the comparison table
4. For each concept, look up the field with that label. If missing → "—"
5. Highlight logic: same value → gray, different → highlighted, empty → neutral

`exam_memory_hook` and `exam_trap_alert` always appear as the last two rows if any selected concept has them, with their special styling preserved.

### How the Create/Edit Form Changes

**V1 form:** Fixed fields in fixed order. Fill them all.
**V2 form:**

1. Title (always first, always required)
2. Category picker (always second, always required)
3. **Field section:** Dynamic list of `{ label input, value textarea }` pairs
   - "Add Field" button at the bottom
   - Each field has a remove button (×)
   - Each field's label is editable (textarea or input)
   - When using a template, fields are pre-populated with labels only
   - Suggested labels appear as autocomplete/chips when typing a label (Purpose, Definition, Used When, etc.)
4. Exam Memory Hook (optional, toggle to show/hide)
5. Exam Trap Alert (optional, toggle to show/hide)
6. Confused With (same as V1 — link to other concepts)

### How the Detail View Changes

Instead of hard-coded section headings, the detail view iterates over `concept.fields` and renders each as a labeled section:

```
[Category Badge]  Title

─── Field 1 Label ───
Field 1 value

─── Field 2 Label ───
Field 2 value

...

💡 Memory Hook (if present)
⚠️ Exam Trap (if present)

Often Confused With: [linked concepts]
```

### How the Home/List View Changes

`ConceptCard` currently shows `purpose` as preview text. In V2, show the value of the **first field** instead — since the user controls field order, whatever they put first is what they consider most important.

### Impact on Process Module

The Process module stays structured. Processes inherently have workflow semantics (trigger → steps → outcome → decisions → branching) that ARE the value. The step/decision tree is not something users want to freestyle — they want to model actual flows.

However, the same feedback spirit applies: if users want additional metadata fields on processes beyond trigger/outcome/exam_trap, that could be added later using the same `fields[]` pattern. This is not in scope for the initial V2 change.

### Database Migration

**New `concepts` table schema:**
```sql
CREATE TABLE concepts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('PRODUCT', 'PROCESS', 'ROLE', 'POLICY', 'OTHER')),
  fields JSONB NOT NULL DEFAULT '[]',          -- array of {id, label, value}
  exam_memory_hook TEXT,                        -- optional, no longer NOT NULL
  exam_trap_alert TEXT,
  confused_with UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Migration from V1:**
Existing concepts can be migrated by converting the old fixed columns into fields:
```sql
UPDATE concepts SET fields = jsonb_build_array(
  jsonb_build_object('id', gen_random_uuid(), 'label', 'Purpose', 'value', COALESCE(purpose, '')),
  jsonb_build_object('id', gen_random_uuid(), 'label', 'Used When', 'value', COALESCE(used_when, '')),
  jsonb_build_object('id', gen_random_uuid(), 'label', 'Key Characteristics', 'value', array_to_string(key_characteristics, E'\n')),
  jsonb_build_object('id', gen_random_uuid(), 'label', 'Key Difference', 'value', COALESCE(key_difference, ''))
);
```
Then drop old columns: `purpose`, `used_when`, `key_characteristics`, `key_difference`.

Note: `key_characteristics` (previously an array) becomes a single text field with newlines — the newline rendering support we already built handles this.

### Summary of Changes Required

| Component | Change |
|---|---|
| `types.ts` | New `ConceptField` interface, update `Concept` to use `fields[]`, remove old field types |
| `supabase-schema.sql` | New table schema with JSONB `fields`, migration script for existing data |
| `ConceptForm.tsx` | Complete rewrite — dynamic field list with add/remove, template picker, label suggestions |
| `ConceptCard.tsx` | Show first field value instead of `purpose` |
| `concepts/[id]/page.tsx` | Iterate over `fields[]` instead of hardcoded sections |
| `concepts/[id]/edit/page.tsx` | Use new dynamic form |
| `compare/page.tsx` | Dynamic dimension collection from field labels instead of fixed list |
| `lib/concepts.ts` | Update types, may need minor query adjustments |
| `create/page.tsx` | Template selection before form |

### What This Does NOT Change
- Process module (steps, decisions, branching) — stays fully structured
- Tutorial/Learn module — stays as-is
- Navigation and overall app structure — stays as-is
- Dark theme, glassmorphism, mobile-first design — stays as-is

### Success Criteria (V2)
The V2 direction is successful if:
- Users create concepts **more often** because the form matches their mental model
- Users still actively use comparison (the killer feature survives the flexibility)
- Users feel **ownership** over their knowledge cards
- The template system prevents blank-page paralysis

Primary emotional success (updated):
"I can capture it exactly how I understand it — and still see how things differ."

---

## V1 Reference (Original Design)

> The sections below document the original V1 fixed-schema design. They remain here for reference and to understand the migration path. Once V2 is implemented, these describe the legacy system.

1. Purpose
This system helps management trainees in banking (starting with your girlfriend) understand and differentiate similar banking concepts (products, processes, roles, policies) to improve internal exam performance.
The system prioritizes:
- Clear differentiation
- Structured thinking
- Easy comparison
- Memorization support

2. Product Principles (Non-Negotiable)
These guide all technical decisions.
  1. Structure over freedom
     No free-form notes. Fixed schemas only.
  2. Differentiation-first
     Every data model supports comparison.
  3. Small cognitive load
     Minimal fields, minimal UI.
  4. Mobile-first
     Primary use case is studying anywhere.

3. MVP Scope
In scope (MVP)
- Create concept cards
- Compare similar concepts
- Highlight differences
- Exam-focused fields

Out of scope (V1)
- AI features
- User-to-user sharing
- Public content
- Multi-bank knowledge base
- Gamification

4. Core Domain Model
4.1 Core Entity: Concept
A Concept is anything a trainee must understand and differentiate.
Examples:
- Credit Product A
- Savings Account
- Loan Approval Process
- Risk Management
- Compliance

4.2 Concept Schema
Concept {
  id: UUID
  title: string
  category: ConceptCategory
  purpose: string
  usedWhen: string
  keyCharacteristics: string[]  // max 3
  keyDifference: string
  examMemoryHook: string
  examTrapAlert?: string
  confusedWith: UUID[]          // references other Concepts
  createdAt: timestamp
  updatedAt: timestamp
}

4.3 ConceptCategory (Enum)
enum ConceptCategory {
  PRODUCT
  PROCESS
  ROLE
  POLICY
  OTHER
}

5. Core Features (Functional Requirements)

5.1 Create Concept Card
Description
User creates a concept using a fixed template.

Rules
- All text fields have character limits
- keyCharacteristics max length = 3
- confusedWith can reference only existing concepts
- No rich text / formatting

Validation
- title, category, purpose, keyDifference, examMemoryHook are required
- Empty or vague entries should be discouraged via UI copy (not blocked)

5.2 Concept List View
Purpose
- Allow quick scanning
- Entry point to comparison

Display
- Title
- Category badge
- Key difference (one line)

Actions
- View
- Edit
- Select for comparison

5.3 Compare Concepts (Killer Feature)
Description
User selects 2–4 concepts and views them side-by-side.

Comparison Dimensions (Fixed)
| Dimension           | Source Field         |
| ------------------- | -------------------- |
| Purpose             | `purpose`            |
| Used When           | `usedWhen`           |
| Key Characteristics | `keyCharacteristics` |
| Key Difference      | `keyDifference`      |
| Exam Memory Hook    | `examMemoryHook`     |

UI Logic Rules
- If values are identical or very similar → gray text
- If values differ → highlighted
- Empty values → shown as “—”
Note: Similarity detection can be manual (MVP)
Automated semantic comparison is out of scope

5.4 “Often Confused With” Navigation
Purpose
- Encourage comparison thinking
- Reduce exam mistakes

Behavior
- Clicking a linked concept:
  - Opens its detail page
  - Offers “Compare with this concept” CTA

6. Exam-Oriented Design Features

6.1 Exam Trap Alert
Optional field to capture:
“What usually confuses people in exams?”

Usage
- Displayed prominently
- Highlighted with warning icon
- Only visible in detail view & compare view

6.2 Memory Hook Priority
In review contexts:
- examMemoryHook is shown first
- Designed for quick recall before exams

7. UX Flow (High-Level)
Flow 1: Studying
Learn topic → Create Concept → Fill template → Save

Flow 2: Clarifying Confusion
Confused → Select concepts → Compare → See differences → Update keyDifference

Flow 3: Exam Review
Browse concepts → Read memory hooks → Scan exam traps

8. Non-Functional Requirements
Performance
- Comparison view must load < 500ms (local DB acceptable)

Accessibility
- Large tap targets
- High contrast
- Clear typography

Devices
- Mobile first
- Tablet friendly
- Desktop optional

9. Technical Stack (Suggested, not forced)
Frontend
- React / Next.js
- Tailwind or similar utility CSS
- Local-first friendly design
- Interactive animation heavy to engage users

Backend (MVP-friendly)
- Supabase
- Simple REST or RPC API

10. Success Criteria (MVP)
The MVP is successful if:
- User actively uses comparison
- User updates keyDifference after comparing
- User reports less confusion in exams
Primary emotional success:
“Now I can clearly tell them apart.”

11. Final Note (Product Owner Voice)
If you ever ask:
“Should we add this feature?”
Ask instead:
“Does this make differences or learning clearer?”
If not — don’t build it.

12. Memory and context management
You maintain a persistent file called journal.md.
- journal.md is the single source of truth for anything important, long-term, or state-changing.
- Every time you:
  - Make an important decision
  - Change assumptions, rules, or direction
  - Learn something that affects future behavior
  - Establish a convention, workflow, or preference
  - Update goals, plans, or responsibilities
  You must write a clear entry to journal.md.

Rules for writing to journal.md
- Entries must be concise, factual, and structured.
- Each entry should include:
  - Date
  - What changed or was decided
  - Why it matters
- Do not write trivial conversation, brainstorming, or temporary thoughts.
- If something conflicts with an earlier entry, explicitly note the change instead of silently overriding it.

Usage discipline
- When unsure whether something is “important,” err on the side of writing it.
- Treat journal.md as memory, not narration.
- Never modify past entries except to add clarifications or corrections with dates.