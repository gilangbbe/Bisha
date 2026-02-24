"use client";

import { ConceptCategory, CATEGORY_LABELS } from "@/types";

const CATEGORY_BG: Record<ConceptCategory, string> = {
    [ConceptCategory.PRODUCT]: "rgba(99, 102, 241, 0.15)",
    [ConceptCategory.PROCESS]: "rgba(245, 158, 11, 0.15)",
    [ConceptCategory.ROLE]: "rgba(16, 185, 129, 0.15)",
    [ConceptCategory.POLICY]: "rgba(239, 68, 68, 0.15)",
    [ConceptCategory.OTHER]: "rgba(139, 92, 246, 0.15)",
};

const CATEGORY_TEXT: Record<ConceptCategory, string> = {
    [ConceptCategory.PRODUCT]: "#818cf8",
    [ConceptCategory.PROCESS]: "#fbbf24",
    [ConceptCategory.ROLE]: "#34d399",
    [ConceptCategory.POLICY]: "#f87171",
    [ConceptCategory.OTHER]: "#a78bfa",
};

interface BadgeProps {
    category: ConceptCategory;
    size?: "sm" | "md";
}

export default function CategoryBadge({ category, size = "sm" }: BadgeProps) {
    return (
        <span
            className="category-badge"
            style={{
                background: CATEGORY_BG[category],
                color: CATEGORY_TEXT[category],
                fontSize: size === "sm" ? "11px" : "12px",
                padding: size === "sm" ? "3px 10px" : "4px 14px",
            }}
        >
            {CATEGORY_LABELS[category]}
        </span>
    );
}
