Process Visualization Module
(Mindmap & Flowchart – Differentiation-First, Mobile-First)

1. Purpose
The Process Visualization Module enables trainees to capture, visualize, and differentiate business processes (e.g., banking workflows) quickly during live workshops and review them effectively for exams.
This module is explicitly designed for:
- Listening-first environments (workshops, training sessions)
- Minimal interaction time
- Mobile-first usage
- Exam-oriented differentiation, not documentation beauty

The module supports two views from the same data:
- Flowchart
- Mindmap
Users never manually draw diagrams.

2. Design Principles (Non-Negotiable)
These inherit and extend the core product principles.
    1. Structure over freedom
      - No free canvas
      - No drag-and-drop
      - Fixed schemas only
    2. Capture first, visualize later
      - Input is text-first
      - Visualization is system-generated
    3. Low cognitive load
      - One-sentence steps
      - Limited decisions
      - Mobile-friendly gestures only
    4. Differentiation-first
      - Processes must be comparable
      - Exam traps must be explicit
    5. Mobile-first, workshop-safe
      - One-thumb usage
      - No precision interaction
If a feature violates any principle above, it is invalid.

3. Scope Definition
In Scope (MVP)
- Create structured process records
- Capture steps and decisions quickly
- Auto-generate flowchart view
- Auto-generate mindmap view
- Compare similar processes
- Exam-oriented annotations

Out of Scope
- Free-form drawing
- Shape libraries
- Manual layout control
- AI-generated processes
- Exporting diagrams
- Collaboration or sharing
- Styling / theming controls

4. Core Domain Model
4.1 Core Entity: Process
A Process represents a business workflow that must be understood, sequenced, and differentiated.
Examples:
- Loan Approval Process (Retail)
- Credit Card Issuance
- Customer Due Diligence
- Risk Escalation Flow

Process Schema
Process {
  id: UUID
  title: string
  processType: LINEAR | DECISION | CYCLICAL
  trigger: string
  outcome: string
  steps: Step[]
  examTrapAlert?: string
  confusedWith: UUID[]        // references other Processes
  createdAt: timestamp
  updatedAt: timestamp
}

Rationale
- trigger and outcome anchor exam recall
- processType constrains visualization logic
- confusedWith enforces differentiation thinking

4.2 Step Entity
A Step represents a single action or decision within a process.
Step Schema
Step {
  id: UUID
  order: number
  action: string              // one sentence max
  actor?: string              // optional role
  decision?: Decision
  notes?: string              // short clarification only
}

Rules:
- action is mandatory
- Max one sentence
- No rich text
- Steps are auto-numbered

4.3 Decision Entity
Decisions model branching logic without requiring diagram drawing.
Decision Schema
Decision {
  question: string
  optionA: {
    label: string
    nextStepId: UUID
  }
  optionB: {
    label: string
    nextStepId: UUID
  }
}

Rules:
- Binary decisions only (MVP)
- Labels must be short (e.g., “Yes / No”, “Complete / Incomplete”)

5. Core Features (Functional Requirements)
5.1 Create Process (Workshop Mode)
Primary capture mode
Purpose:
- Allow users to record processes while listening
- Zero visualization distraction

Behavior:
- Single-column mobile UI
- Focused text input
- No diagrams rendered

User Actions:
- Enter title
- Add steps sequentially
- Add decision via one-tap shortcut
- Reorder steps via swipe

Validation:
- Title required
- At least one step required
- Vague entries discouraged via UI copy (not blocked)

5.2 Auto-Generated Visualization
Visualization is derived, never authored.
5.2.1 Flowchart View
- Vertical, top-down layout
- Linear steps → straight flow
- Decisions → automatic branching
- Read-only by default
- Tap node → edit underlying text

Rules:
- Layout determined solely by step order + decisions
- No manual repositioning

5.2.2 Mindmap View
Uses the same Process data.
- Center node = Process title
- Primary branches = step groups or phases
- Sub-branches = decisions and notes
Switching views does not change data.

5.3 Zoom-by-Level (Mobile Critical)
Instead of free zooming:
- Level 1: Major steps only
- Level 2: Steps + decisions
- Level 3: Steps + decisions + notes
This ensures readability on small screens.

6. Differentiation & Exam Features
6.1 “Often Confused With” (Process-Level)
Purpose:
- Encourage comparative thinking
- Reduce exam mistakes
Behavior:
- Links to other Process entities
- Offers “Compare with this process” CTA

6.2 Process Comparison View
Users select 2–3 processes.
Comparison dimensions (fixed):
| Dimension       | Source          |
| --------------- | --------------- |
| Trigger         | `trigger`       |
| Key Steps       | `steps`         |
| Decision Points | `decision`      |
| Outcome         | `outcome`       |
| Exam Trap       | `examTrapAlert` |

UI Rules:
- Identical values → gray
- Differences → highlighted
- Missing values → “—”

6.3 Exam Trap Anchors
Purpose:
Capture where exams commonly trick trainees.
Behavior:
- Highlighted in detail view
- Visually marked in diagrams
- Prominent in comparison view

7. UX Flows (High-Level)
Flow 1: Live Workshop Capture
Listen → Add steps → Add decisions → Save
(No visualization)

Flow 2: Clarification After Workshop
Open process → View flowchart → Edit steps → Add exam trap

Flow 3: Exam Review
Browse processes → Read trigger & outcome → Scan traps → Compare similar processes

8. Non-Functional Requirements
Devices
- Mobile-first
- Tablet friendly
- Desktop optional

9. Success Criteria (MVP)
The feature is successful if:
- Users capture processes during workshops
- Users rely on auto-generated diagrams instead of manual drawing
- Users compare similar processes before exams
- Users report clearer understanding of process differences
Primary emotional success:
“I didn’t have to draw anything, but I still understand the process clearly.”

10. Product Owner Rule (Final Lock)
When considering any future enhancement, ask:
“Does this reduce capture time or improve differentiation?”
If not — do not build it.