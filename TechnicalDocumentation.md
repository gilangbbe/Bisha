Project: Differentiation-First Learning Tool (MVP)

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