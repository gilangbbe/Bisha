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
