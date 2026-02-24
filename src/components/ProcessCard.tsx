"use client";

import { Process, PROCESS_TYPE_LABELS, PROCESS_TYPE_COLORS } from "@/types";
import Link from "next/link";

interface ProcessCardProps {
    process: Process;
    selectable?: boolean;
    selected?: boolean;
    onToggleSelect?: (id: string) => void;
}

export default function ProcessCard({
    process,
    selectable = false,
    selected = false,
    onToggleSelect,
}: ProcessCardProps) {
    const handleCheckClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onToggleSelect?.(process.id);
    };

    return (
        <Link
            href={`/processes/${process.id}`}
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
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        )}
                    </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
                        <span
                            className="category-badge"
                            style={{
                                background: `${PROCESS_TYPE_COLORS[process.process_type]}22`,
                                color: PROCESS_TYPE_COLORS[process.process_type],
                            }}
                        >
                            {PROCESS_TYPE_LABELS[process.process_type]}
                        </span>
                        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#f0f0f5", lineHeight: 1.3 }}>
                            {process.title}
                        </h3>
                    </div>
                    <p style={{ fontSize: "13px", color: "#9595b0", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {process.trigger || "No trigger defined"}
                    </p>
                    <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                        <span style={{ fontSize: "12px", color: "#5a5a78" }}>
                            {process.steps.length} step{process.steps.length !== 1 ? "s" : ""}
                        </span>
                        {process.steps.some((s) => s.decision) && (
                            <span style={{ fontSize: "12px", color: "#f59e0b" }}>
                                ◇ Has decisions
                            </span>
                        )}
                    </div>
                </div>
                {!selectable && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5a5a78" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "4px" }}>
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                )}
            </div>
        </Link>
    );
}
