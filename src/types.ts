export enum ConceptCategory {
    PRODUCT = "PRODUCT",
    PROCESS = "PROCESS",
    ROLE = "ROLE",
    POLICY = "POLICY",
    OTHER = "OTHER",
}

export interface Concept {
    id: string;
    title: string;
    category: ConceptCategory;
    purpose: string;
    used_when: string;
    key_characteristics: string[];
    key_difference: string;
    exam_memory_hook: string;
    exam_trap_alert: string | null;
    confused_with: string[];
    created_at: string;
    updated_at: string;
}

export type ConceptFormData = Omit<Concept, "id" | "created_at" | "updated_at">;

export const CATEGORY_COLORS: Record<ConceptCategory, string> = {
    [ConceptCategory.PRODUCT]: "#6366f1",
    [ConceptCategory.PROCESS]: "#f59e0b",
    [ConceptCategory.ROLE]: "#10b981",
    [ConceptCategory.POLICY]: "#ef4444",
    [ConceptCategory.OTHER]: "#8b5cf6",
};

export const CATEGORY_LABELS: Record<ConceptCategory, string> = {
    [ConceptCategory.PRODUCT]: "Product",
    [ConceptCategory.PROCESS]: "Process",
    [ConceptCategory.ROLE]: "Role",
    [ConceptCategory.POLICY]: "Policy",
    [ConceptCategory.OTHER]: "Other",
};

// ── Process Visualization Module ──

export enum ProcessType {
    LINEAR = "LINEAR",
    DECISION = "DECISION",
    CYCLICAL = "CYCLICAL",
}

export interface DecisionOption {
    id: string;
    label: string;
    steps: Step[];
}

export interface Decision {
    question: string;
    options: DecisionOption[];
}

// Max branches per decision (product principle: low cognitive load)
export const MAX_DECISION_OPTIONS = 6;
export const MIN_DECISION_OPTIONS = 2;

// Max nesting depth for decisions-within-decisions
export const MAX_DECISION_DEPTH = 3;

// Color palette for decision branches (used in visualizations)
export const DECISION_BRANCH_COLORS = [
    "#10b981", // green
    "#ef4444", // red
    "#3b82f6", // blue
    "#f59e0b", // amber
    "#8b5cf6", // purple
    "#ec4899", // pink
];

// ── Tree helpers ──

/** Recursively count all steps (including nested branch steps) */
export function countAllSteps(steps: Step[]): number {
    let count = 0;
    for (const step of steps) {
        count += 1;
        if (step.decision) {
            for (const opt of step.decision.options) {
                count += countAllSteps(opt.steps);
            }
        }
    }
    return count;
}

/** Recursively collect all decision questions from a step tree */
export function collectDecisions(steps: Step[], depth = 0): { question: string; branchCount: number; depth: number }[] {
    const results: { question: string; branchCount: number; depth: number }[] = [];
    for (const step of steps) {
        if (step.decision) {
            results.push({ question: step.decision.question, branchCount: step.decision.options.length, depth });
            for (const opt of step.decision.options) {
                results.push(...collectDecisions(opt.steps, depth + 1));
            }
        }
    }
    return results;
}

export interface Step {
    id: string;
    order: number;
    action: string;
    actor?: string;
    decision?: Decision;
    notes?: string;
}

export interface Process {
    id: string;
    title: string;
    process_type: ProcessType;
    trigger: string;
    outcome: string;
    steps: Step[];
    exam_trap_alert: string | null;
    confused_with: string[];
    created_at: string;
    updated_at: string;
}

export type ProcessFormData = Omit<Process, "id" | "created_at" | "updated_at">;

export const PROCESS_TYPE_LABELS: Record<ProcessType, string> = {
    [ProcessType.LINEAR]: "Linear",
    [ProcessType.DECISION]: "Decision",
    [ProcessType.CYCLICAL]: "Cyclical",
};

export const PROCESS_TYPE_COLORS: Record<ProcessType, string> = {
    [ProcessType.LINEAR]: "#3b82f6",
    [ProcessType.DECISION]: "#f59e0b",
    [ProcessType.CYCLICAL]: "#10b981",
};

// ── Notes Module (Block-Based) ──

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

export const NOTE_CATEGORY_LABELS: Record<NoteCategory, string> = {
    [NoteCategory.PRODUCT]: "Product",
    [NoteCategory.PROCESS]: "Process",
    [NoteCategory.REGULATION]: "Regulation",
    [NoteCategory.ROLE]: "Role",
    [NoteCategory.DEFINITION]: "Definition",
    [NoteCategory.FORMULA]: "Formula",
    [NoteCategory.CASE_STUDY]: "Case Study",
    [NoteCategory.EXAM_TIP]: "Exam Tip",
    [NoteCategory.GENERAL]: "General",
};

export const NOTE_CATEGORY_COLORS: Record<NoteCategory, string> = {
    [NoteCategory.PRODUCT]: "#6366f1",
    [NoteCategory.PROCESS]: "#f59e0b",
    [NoteCategory.REGULATION]: "#ef4444",
    [NoteCategory.ROLE]: "#10b981",
    [NoteCategory.DEFINITION]: "#3b82f6",
    [NoteCategory.FORMULA]: "#a855f7",
    [NoteCategory.CASE_STUDY]: "#ec4899",
    [NoteCategory.EXAM_TIP]: "#f97316",
    [NoteCategory.GENERAL]: "#8b5cf6",
};

export type BlockType = "text" | "heading" | "callout" | "list" | "divider" | "reference" | "code";

export interface BlockMeta {
    level?: 2 | 3;
    style?: "info" | "warning" | "tip" | "important";
    listStyle?: "bullet" | "numbered";
    items?: string[];
    refType?: "concept" | "process";
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

export const BLOCK_TYPE_CONFIG: Record<BlockType, { label: string; icon: string; description: string }> = {
    text: { label: "Text", icon: "📝", description: "Plain text" },
    heading: { label: "Heading", icon: "📌", description: "Section header" },
    callout: { label: "Callout", icon: "💡", description: "Highlighted box" },
    list: { label: "List", icon: "📋", description: "Bullet or numbered" },
    divider: { label: "Divider", icon: "──", description: "Separator" },
    reference: { label: "Reference", icon: "🔗", description: "Link concept" },
    code: { label: "Code", icon: "💻", description: "Technical text" },
};

export const CALLOUT_STYLES = {
    info: { icon: "💡", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.08)", border: "rgba(59, 130, 246, 0.2)", label: "Info" },
    warning: { icon: "⚠️", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.08)", border: "rgba(245, 158, 11, 0.2)", label: "Warning" },
    tip: { icon: "✅", color: "#10b981", bg: "rgba(16, 185, 129, 0.08)", border: "rgba(16, 185, 129, 0.2)", label: "Tip" },
    important: { icon: "🔴", color: "#ef4444", bg: "rgba(239, 68, 68, 0.08)", border: "rgba(239, 68, 68, 0.2)", label: "Important" },
};
