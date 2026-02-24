import { TutorialTrack } from "@/types";

// ── Track A: How to Use This App (Mandatory First-Time) ──
const trackA: TutorialTrack = {
    id: "how-to-use",
    title: "How to Use This App",
    description: "Install the correct mental model in 2 minutes",
    icon: "🧠",
    cards: [
        {
            id: "a1",
            title: "This app is for differences, not notes",
            message:
                "Bisha doesn't replace your notebook. It replaces the confusion between similar concepts. Every field exists to answer one question: \"How is this different from that?\"",
            exampleBad: {
                label: "Bad",
                content: "Savings Account: A bank account where you save money.",
                explanation:
                    "This is a dictionary definition. It doesn't help you differentiate from fixed deposits, money market accounts, or current accounts.",
            },
            exampleGood: {
                label: "Good",
                content:
                    "Unlike fixed deposits, savings accounts allow withdrawals anytime but offer lower interest rates.",
                explanation:
                    "This directly contrasts two concepts — exactly what exams test.",
            },
        },
        {
            id: "a2",
            title: "Why structure beats freedom",
            message:
                "Free-form notes feel productive but fail at exam time. You can't compare two pages of scattered notes. Bisha uses fixed templates so every concept is captured the same way — making comparison instant.",
            exampleBad: {
                label: "Bad",
                content:
                    "KYC is important for banks. It involves verifying customers. There are different levels...",
                explanation:
                    "Unstructured notes ramble. You can't scan this in 10 seconds before an exam.",
            },
            exampleGood: {
                label: "Good",
                content:
                    "Purpose: Verify customer identity before onboarding. Key Difference: KYC verifies IDENTITY; AML monitors TRANSACTIONS.",
                explanation:
                    "Structured fields force clarity. Every concept reads the same way.",
            },
        },
        {
            id: "a3",
            title: "Comparison reduces exam mistakes",
            message:
                "Most exam errors come from confusing similar concepts. Bisha's Compare view puts concepts side-by-side so differences jump out. Use it before every exam — not after you've already confused two things.",
            exampleBad: {
                label: "Bad",
                content: "Study KYC. Then study AML. Hope you remember the difference.",
                explanation: "Studying concepts in isolation builds false confidence.",
            },
            exampleGood: {
                label: "Good",
                content:
                    "Compare KYC vs AML: one verifies identity at onboarding, the other monitors transactions forever.",
                explanation:
                    "Side-by-side comparison locks the difference in place.",
            },
            ctaLabel: "Try comparing now",
            ctaAction: "/compare",
        },
        {
            id: "a4",
            title: "What good entries look like",
            message:
                "A great concept card is short, specific, and exam-ready. Fill in the Key Difference first — it's the most important field. Then add a Memory Hook (a phrase you can recall in 5 seconds). Everything else supports these two.",
            exampleBad: {
                label: "Bad",
                content:
                    "Key Difference: It's different from other products. Memory Hook: Remember the features.",
                explanation: "Vague entries are worse than no entries — they give false confidence.",
            },
            exampleGood: {
                label: "Good",
                content:
                    "Key Difference: FD locks funds for higher returns; savings allows withdrawals anytime. Memory Hook: \"Lock it to earn it.\"",
                explanation:
                    "Specific, contrastive, and memorable. This is exam-ready.",
            },
            ctaLabel: "Create your first concept",
            ctaAction: "/create",
        },
    ],
};

// ── Track B: Writing Good Concepts ──
const trackB: TutorialTrack = {
    id: "writing-concepts",
    title: "Writing Good Concepts",
    description: "Stop writing textbook definitions. Start writing exam answers.",
    icon: "✍️",
    cards: [
        {
            id: "b1",
            title: "The Key Difference is everything",
            message:
                "This is the single most important field in a concept card. It answers: \"If I confuse this with something similar, what's the one thing that separates them?\" Write this field first, always.",
            exampleBad: {
                label: "Bad",
                content: "Key Difference: This is a type of bank account.",
                explanation:
                    "This doesn't differentiate from anything. Every product is 'a type of bank account.'",
            },
            exampleGood: {
                label: "Good",
                content:
                    "Key Difference: Unlike current accounts, savings accounts earn interest but have limited monthly withdrawals.",
                explanation:
                    "Starts with 'Unlike X' — immediately signals what it's being compared to.",
            },
        },
        {
            id: "b2",
            title: "Don't copy the textbook",
            message:
                "Textbook definitions are designed to explain. Exam answers need to differentiate. Your concept purpose should answer 'What is this FOR?' not 'What is this?'",
            exampleBad: {
                label: "Bad",
                content:
                    "Purpose: A fixed deposit is a financial instrument provided by banks which provides investors a higher rate of interest than a regular savings account.",
                explanation:
                    "This is a textbook sentence. Too long, too generic, not exam-ready.",
            },
            exampleGood: {
                label: "Good",
                content:
                    "Purpose: Lock funds for a fixed period to earn guaranteed higher returns.",
                explanation:
                    "Short, action-oriented. You can recall this in 5 seconds.",
            },
        },
        {
            id: "b3",
            title: "Memory Hooks that actually work",
            message:
                "A memory hook is a phrase, acronym, or mental image that triggers instant recall. It doesn't need to be accurate — it needs to be memorable. Think mnemonics, rhymes, or absurd associations.",
            exampleBad: {
                label: "Bad",
                content: "Memory Hook: Remember the key features of this product.",
                explanation:
                    "This isn't a hook — it's an instruction to remember. That defeats the purpose.",
            },
            exampleGood: {
                label: "Good",
                content:
                    "Memory Hook: \"KYC = Know before you Go. No KYC, no account.\"",
                explanation:
                    "Rhymes, abbreviation expansion, and a consequence. Sticky and scannable.",
            },
        },
        {
            id: "b4",
            title: "Spotting exam traps before they catch you",
            message:
                "Exam Trap Alerts capture the specific mistakes examiners hope you'll make. Think: 'What would someone who studied casually get wrong?' That's your trap alert.",
            exampleBad: {
                label: "Bad",
                content: "Exam Trap: Be careful with this topic.",
                explanation: "This says nothing. What should you be careful about?",
            },
            exampleGood: {
                label: "Good",
                content:
                    "Exam Trap: Don't confuse KYC with CDD — CDD is a component of KYC, not a synonym. Exams love testing this distinction.",
                explanation:
                    "Names the specific confusion, states the correct relationship, and warns why.",
            },
            ctaLabel: "Practice writing a concept",
            ctaAction: "/create",
        },
    ],
};

// ── Track C: Capturing Processes Fast ──
const trackC: TutorialTrack = {
    id: "capturing-processes",
    title: "Capturing Processes Fast",
    description: "Workshop mode: record workflows while listening, not drawing.",
    icon: "⚡",
    cards: [
        {
            id: "c1",
            title: "Don't draw — just list",
            message:
                "In a workshop, you have seconds to capture each step. Don't try to draw a flowchart — just type each step as one short sentence. Bisha will generate the diagram for you later.",
            exampleBad: {
                label: "Bad",
                content: "Trying to draw boxes and arrows on paper while the presenter moves on.",
                explanation:
                    "You miss steps while drawing. Capture comes first, visuals come later.",
            },
            exampleGood: {
                label: "Good",
                content:
                    "Step 1: Customer submits application. Step 2: Officer verifies documents. Step 3: Credit check performed.",
                explanation:
                    "Text-first capture. You got all 3 steps in 15 seconds. The flowchart draws itself.",
            },
        },
        {
            id: "c2",
            title: "One sentence per step — max",
            message:
                "Each step should be one clear action. If you need more than one sentence, you probably need two steps. Keep it scannable — you'll review later.",
            exampleBad: {
                label: "Bad",
                content:
                    "Step: The credit analyst reviews the application, checks the credit bureau score, evaluates collateral if applicable, and prepares a risk assessment report.",
                explanation:
                    "This is 4 steps crammed into one. You'll never remember the sequence.",
            },
            exampleGood: {
                label: "Good",
                content:
                    "Step 3: Credit check against bureau. Step 4: Collateral evaluation. Step 5: Risk assessment report prepared.",
                explanation:
                    "Three separate steps, each one sentence. Clear sequence, easy to review.",
            },
        },
        {
            id: "c3",
            title: "When to add a decision point",
            message:
                "Add a decision when the process branches: 'Does X meet the threshold?' 'Is the document complete?' Use the decision button — it creates a Yes/No branch automatically.",
            exampleBad: {
                label: "Bad",
                content:
                    "Step: If the credit score is good, proceed to approval. If not, the application may be reconsidered or rejected.",
                explanation:
                    "Cramming logic into prose. The branching is hidden in text.",
            },
            exampleGood: {
                label: "Good",
                content:
                    "Step 3 (Decision): Does credit score meet threshold? → Yes: proceed to approval. → No: reject with letter.",
                explanation:
                    "Clean branch. The flowchart will show this as a diamond with two paths.",
            },
        },
        {
            id: "c4",
            title: "Review later, not now",
            message:
                "During a workshop, your only job is capture. Don't edit, don't polish, don't add exam traps yet. After the session, open the process, switch to flowchart view, and refine. That's when you add actors, notes, and traps.",
            exampleBad: {
                label: "Bad",
                content: "Spending 2 minutes perfecting Step 1 while the presenter is on Step 5.",
                explanation: "Perfectionism during capture = missed information.",
            },
            exampleGood: {
                label: "Good",
                content:
                    "Capture all steps rough. After workshop: open flowchart view → add actors → add exam trap → done.",
                explanation:
                    "Capture now, refine later. This is the workshop mode philosophy.",
            },
            ctaLabel: "Try capturing a process",
            ctaAction: "/processes/create",
        },
    ],
};

// ── Track D: Comparing Like an Examiner ──
const trackD: TutorialTrack = {
    id: "comparing-examiner",
    title: "Comparing Like an Examiner",
    description: "Think the way the exam tests — through contrasts and traps.",
    icon: "🎯",
    cards: [
        {
            id: "d1",
            title: "What examiners actually test",
            message:
                "Examiners rarely test definitions. They test whether you can tell similar things apart. 'What is the difference between X and Y?' is the most common exam pattern. That's why this app exists.",
            exampleBad: {
                label: "Bad",
                content: "Studying: 'What is KYC?' → 'KYC stands for Know Your Customer...'",
                explanation:
                    "Definition recall feels productive but doesn't match exam format.",
            },
            exampleGood: {
                label: "Good",
                content:
                    "Studying: 'What's the difference between KYC and AML?' → KYC = identity at onboarding. AML = transactions forever.",
                explanation:
                    "This matches how the question will actually appear on the exam.",
            },
        },
        {
            id: "d2",
            title: "Where confusion actually happens",
            message:
                "Confusion happens when two concepts share surface features but differ in purpose or scope. The 'Often Confused With' links help you identify these pairs. If you find yourself hesitating between two concepts — link them immediately.",
            exampleBad: {
                label: "Bad",
                content: "Thinking: 'I kinda know the difference... I'll figure it out during the exam.'",
                explanation:
                    "Vague familiarity is the #1 cause of wrong answers. If you 'kinda' know, you don't know.",
            },
            exampleGood: {
                label: "Good",
                content:
                    "Action: Link KYC ↔ CDD as 'Often Confused With'. Compare them. Write the difference explicitly.",
                explanation:
                    "Making confusion explicit turns it into a study action, not a hope.",
            },
        },
        {
            id: "d3",
            title: "Update after comparing",
            message:
                "After using Compare view, go back and update your concept cards. Did you discover a sharper Key Difference? A better Memory Hook? Editing after comparison is the highest-value study action in this app.",
            exampleBad: {
                label: "Bad",
                content: "Compare two concepts → 'Interesting' → close the app.",
                explanation:
                    "Comparison without action is passive reading. You'll forget by tomorrow.",
            },
            exampleGood: {
                label: "Good",
                content:
                    "Compare KYC vs AML → notice Key Difference is vague → edit KYC → rewrite: 'KYC verifies IDENTITY; AML monitors TRANSACTIONS.'",
                explanation:
                    "The compare → edit loop is where real learning happens.",
            },
            ctaLabel: "Compare concepts now",
            ctaAction: "/compare",
        },
        {
            id: "d4",
            title: "Turn mistakes into memory hooks",
            message:
                "If you've confused two concepts before (in practice or in an exam), that mistake is your best memory hook source. The embarrassment makes it stick. Write what you got wrong and why — that becomes your Exam Trap Alert.",
            exampleBad: {
                label: "Bad",
                content: "Got a practice question wrong → feel bad → move on.",
                explanation: "The mistake vanishes. You'll make it again.",
            },
            exampleGood: {
                label: "Good",
                content:
                    "Got KYC/CDD wrong → Exam Trap: 'CDD is a component of KYC, not a synonym.' Memory Hook: 'CDD lives inside KYC.'",
                explanation:
                    "Mistake → Trap Alert → Memory Hook. This is the learning loop.",
            },
        },
    ],
};

// ── Contextual Micro-Tutorial Messages ──
export interface MicroTutorialMessage {
    id: string;
    trigger: string; // identifier for when to show
    title: string;
    message: string;
}

export const microTutorials: MicroTutorialMessage[] = [
    {
        id: "mt-empty-compare",
        trigger: "empty-compare",
        title: "Comparison is the point",
        message:
            "This app exists for comparison. Select 2–4 similar concepts and see their differences side by side. That's how exams test you.",
    },
    {
        id: "mt-first-concept",
        trigger: "first-concept-created",
        title: "Nice! Now find its twin",
        message:
            "Every concept has something it's confused with. Go back and link it using 'Often Confused With' — then compare them.",
    },
    {
        id: "mt-first-decision",
        trigger: "first-decision-added",
        title: "You just created a branch",
        message:
            "Decision points become diamond shapes in the flowchart. After you save, switch to Flow view to see your process come alive.",
    },
    {
        id: "mt-long-text",
        trigger: "long-text-entry",
        title: "Shorter is better",
        message:
            "If it takes more than 5 seconds to read, it's too long for exam recall. Can you say it in one sentence?",
    },
    {
        id: "mt-empty-key-difference",
        trigger: "empty-key-difference",
        title: "This field matters most",
        message:
            "Key Difference is the #1 field for exams. Start with 'Unlike X...' to force yourself into comparison mode.",
    },
];

// ── All Tracks ──
export const tutorialTracks: TutorialTrack[] = [trackA, trackB, trackC, trackD];

export function getTrackById(id: string): TutorialTrack | undefined {
    return tutorialTracks.find((t) => t.id === id);
}
