"use client";

import { NoteBlock, CALLOUT_STYLES, Concept, Process } from "@/types";
import Link from "next/link";

interface NoteBlockViewProps {
    blocks: NoteBlock[];
    concepts?: Concept[];
    processes?: Process[];
}

export default function NoteBlockView({ blocks, concepts = [], processes = [] }: NoteBlockViewProps) {
    const renderBlock = (block: NoteBlock) => {
        switch (block.type) {
            case "text":
                return (
                    <p style={{ fontSize: "14px", lineHeight: 1.7, color: "#e0e0ea", whiteSpace: "pre-line" }}>
                        {block.content}
                    </p>
                );

            case "heading": {
                const isH2 = block.meta.level === 2;
                return isH2 ? (
                    <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#f0f0f5", marginTop: "8px" }}>
                        {block.content}
                    </h2>
                ) : (
                    <h3 style={{ fontSize: "17px", fontWeight: 600, color: "#e0e0ea", marginTop: "4px" }}>
                        {block.content}
                    </h3>
                );
            }

            case "callout": {
                const style = CALLOUT_STYLES[block.meta.style as keyof typeof CALLOUT_STYLES] || CALLOUT_STYLES.info;
                return (
                    <div
                        style={{
                            padding: "12px 14px",
                            borderRadius: "8px",
                            background: style.bg,
                            borderLeft: `3px solid ${style.border}`,
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                            <span style={{ fontSize: "14px" }}>{style.icon}</span>
                            <span style={{ fontSize: "12px", fontWeight: 600, color: style.color, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                {style.label}
                            </span>
                        </div>
                        <p style={{ fontSize: "14px", lineHeight: 1.6, color: "#e0e0ea", whiteSpace: "pre-line" }}>
                            {block.content}
                        </p>
                    </div>
                );
            }

            case "list": {
                const isNumbered = block.meta.listStyle === "numbered";
                const items = block.meta.items || [];
                const ListTag = isNumbered ? "ol" : "ul";
                return (
                    <ListTag
                        style={{
                            paddingLeft: "20px",
                            margin: 0,
                            listStyleType: isNumbered ? "decimal" : "disc",
                        }}
                    >
                        {items.map((item, i) => (
                            <li key={i} style={{ fontSize: "14px", lineHeight: 1.7, color: "#e0e0ea", whiteSpace: "pre-line", marginBottom: "2px" }}>
                                {item}
                            </li>
                        ))}
                    </ListTag>
                );
            }

            case "divider":
                return (
                    <hr style={{ border: "none", borderTop: "1px solid var(--color-border)", margin: "4px 0" }} />
                );

            case "reference": {
                if (!block.meta.refId) return null;
                const isConcept = block.meta.refType === "concept";
                const item = isConcept
                    ? concepts.find((c) => c.id === block.meta.refId)
                    : processes.find((p) => p.id === block.meta.refId);

                if (!item) {
                    return (
                        <div style={{ padding: "10px 12px", borderRadius: "8px", background: "rgba(90, 90, 120, 0.1)", border: "1px solid var(--color-border)", fontSize: "13px", color: "#5a5a78" }}>
                            🔗 Referenced item not found
                        </div>
                    );
                }

                const href = isConcept ? `/concepts/${item.id}` : `/processes/${item.id}`;
                return (
                    <Link href={href} style={{ textDecoration: "none" }}>
                        <div
                            style={{
                                padding: "10px 12px",
                                borderRadius: "8px",
                                background: isConcept ? "rgba(99, 102, 241, 0.08)" : "rgba(245, 158, 11, 0.08)",
                                border: `1px solid ${isConcept ? "rgba(99, 102, 241, 0.2)" : "rgba(245, 158, 11, 0.2)"}`,
                                cursor: "pointer",
                                transition: "background 0.15s",
                            }}
                        >
                            <span style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: isConcept ? "#6366f1" : "#f59e0b" }}>
                                {isConcept ? "📋 Concept" : "🔄 Process"}
                            </span>
                            <p style={{ fontSize: "14px", fontWeight: 500, color: "#f0f0f5", marginTop: "2px" }}>
                                {item.title}
                            </p>
                        </div>
                    </Link>
                );
            }

            case "code":
                return (
                    <pre
                        style={{
                            padding: "12px 14px",
                            borderRadius: "8px",
                            background: "rgba(0, 0, 0, 0.3)",
                            border: "1px solid var(--color-border)",
                            overflow: "auto",
                            fontFamily: "monospace",
                            fontSize: "13px",
                            lineHeight: 1.6,
                            color: "#e0e0ea",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                        }}
                    >
                        {block.content}
                    </pre>
                );

            default:
                return null;
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {blocks.map((block) => (
                <div key={block.id}>{renderBlock(block)}</div>
            ))}
            {blocks.length === 0 && (
                <p style={{ textAlign: "center", color: "#5a5a78", fontSize: "14px", padding: "24px 0" }}>
                    No content yet.
                </p>
            )}
        </div>
    );
}
