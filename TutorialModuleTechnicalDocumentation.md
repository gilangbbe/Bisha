Tutorial & Learning Guidance Module
(Differentiation-First, Mobile-First, Exam-Oriented)

1. Purpose
The Tutorial Module helps first-time and returning users quickly internalize the mental model of the app so they can:
 - Capture concepts and processes correctly
 - Use comparison as the default thinking tool
 - Avoid vague or non-exam-relevant entries
 - Become productive within 5–10 minutes
The tutorial teaches usage philosophy, not feature discovery.

2. Design Principles (Non-Negotiable)
  1. Thinking over touring
    - No UI walkthrough arrows
    - No “tap here” tutorials
  2. Show → Compare → Explain
    - Every tutorial step uses contrast
    - Wrong vs right is explicit
  3. Micro-learning, not manuals
    - Each tutorial screen < 30 seconds
    - One idea per screen
  4. Mobile-first, thumb-safe
    - Full-screen cards
    - Swipe-based progression
  5. Dismissible, revisit-able
    - Never blocks usage
    - Always accessible later

3. Tutorial Module Structure
The module is a standalone UI layer, not a modal tour.
Entry points:
- First app launch
- “Help me study better” CTA
- Settings → Tutorial
- Contextual triggers (e.g. empty compare view)

4. Core Tutorial Units (Locked)
4.1 Tutorial Cards (Atomic Unit)
Each tutorial step is a card, not a tooltip.
TutorialCard Schema
TutorialCard {
  id: UUID
  title: string
  message: string
  exampleGood?: Example
  exampleBad?: Example
  ctaLabel?: string
  ctaAction?: Action
}

Rules:
- Max 2 short paragraphs
- Plain language
- No jargon

4.2 Example Entity (Critical)
Examples are mandatory for learning.
Example {
  label: "Good" | "Bad"
  content: string
  explanation?: string
}

This enforces:
- Differentiation thinking
- Exam realism
- Self-correction

5. Tutorial Tracks (User-Selectable)
Tutorial is not linear by default.
Track A: How to Use This App (Mandatory First-Time)
Purpose:
- Install correct mental model
Screens:
1. “This app is for differences, not notes”
2. “Why structure beats freedom”
3. “How comparison reduces exam mistakes”
4. “What good entries look like”
Completion unlocks full usage (soft gate).

Track B: Writing Good Concepts
Purpose:
- Prevent vague concept cards
Topics:
- Writing strong keyDifference
- Avoiding textbook definitions
- Using memory hooks properly
- Spotting exam traps
Includes:
- Before / After examples
- Edit-your-own mini exercise (optional)

Track C: Capturing Processes Fast (Workshop Mode)
Purpose:
- Teach live capture behavior
Topics:
- Don’t draw, just list
- One-sentence steps
- When to add decisions
- Review later, not now
UI:
- Simulated workshop screen
- Fake typing animation

Track D: Comparing Like an Examiner
Purpose:
- Train exam-oriented thinking
Topics:
- What examiners test
- Where confusion happens
- How to update entries after comparing
- Turning mistakes into memory hooks

6. Contextual Micro-Tutorials
Triggered by user behavior.
Examples:
- Empty comparison view → “Comparison is the point”
- Overlong text entry → “Shorter is better”
- First decision added → “You just created a branch”
Rules:
- Max 1 card per session
- Non-blocking
- Dismissible forever

7. Tutorial UX (Mobile-First)
Navigation
- Swipe left/right to progress
- Tap “Skip” always visible
- Progress dots (optional)
Visuals
- Minimal illustrations
- High contrast text
- No screenshots (UI may change)

8. Persistence & State (Single-User, Local-First)
8.1 Design Assumptions
 - The app has exactly one user
 - No authentication
 - No profiles
 - No user switching

Therefore:
- No userId
- No per-user scoping
therefore all tracks remain accessible without any state.

9. Success Criteria
The tutorial is successful if:
- Users complete at least one tutorial track
- Concept and Process entries become shorter and clearer
- Users use comparison within first session
- Fewer vague or empty keyDifference fields
Primary emotional success:
“Ah — now I know how I’m supposed to think with this app.”

10. Explicit Non-Goals
❌ Feature tours
❌ Tooltip overlays
❌ Long documentation
❌ Video-only onboarding
❌ Mandatory quizzes

11. Product Owner Rule (Final)
If a tutorial screen does not:
Show a mistake, contrast it, and explain why it matters in exams
It should not exist.