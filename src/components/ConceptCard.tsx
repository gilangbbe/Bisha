"use client";

import { Concept } from "@/types";
import CategoryBadge from "./CategoryBadge";
import Link from "next/link";

interface ConceptCardProps {
    concept: Concept;
    selectable?: boolean;
    selected?: boolean;
    onToggleSelect?: (id: string) => void;
}

export default function ConceptCard({
    concept,
    selectable = false,
    selected = false,
    onToggleSelect,
}: ConceptCardProps) {
    const handleCheckClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onToggleSelect?.(concept.id);
    };

    return (
        <Link
            href={`/concepts/${concept.id}`}
            style={{ textDecoration: "none", display: "block" }}
        >
            <div
                className="glass-card"
                style={{
                    padding: "16px",
                    display: "flex",
                    gap: "12px",
                    alignItems: "flex-start",
                    cursor: "pointer",
                    borderColor: selected ? "#6366f1" : undefined,
                    boxShadow: selected ? "0 0 16px rgba(99, 102, 241, 0.2)" : undefined,
                }}
            >
                {selectable && (
                    <div
                        className={`select-check ${selected ? "checked" : ""}`}
                        onClick={handleCheckClick}
                        style={{ marginTop: "2px" }}
                    >
                        {selected && (
                            <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        )}
                    </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "8px",
                            flexWrap: "wrap",
                        }}
                    >
                        <CategoryBadge category={concept.category} />
                        <h3
                            style={{
                                fontSize: "16px",
                                fontWeight: 600,
                                color: "#f0f0f5",
                                lineHeight: 1.3,
                            }}
                        >
                            {concept.title}
                        </h3>
                    </div>
                    <p
                        style={{
                            fontSize: "13px",
                            color: "#9595b0",
                            lineHeight: 1.5,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                        }}
                    >
                        {concept.key_difference}
                    </p>
                </div>
                {!selectable && (
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#5a5a78"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ flexShrink: 0, marginTop: "4px" }}
                    >
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                )}
            </div>
        </Link>
    );
}
