"use client";

import { Note, NOTE_CATEGORY_LABELS, NOTE_CATEGORY_COLORS, NoteCategory } from "@/types";
import Link from "next/link";

interface NoteCardProps {
    note: Note;
}

export default function NoteCard({ note }: NoteCardProps) {
    // Get a text preview from the first text/heading/callout block
    const previewBlock = note.blocks.find(
        (b) => b.type === "text" || b.type === "heading" || b.type === "callout"
    );
    const preview = previewBlock?.content || "";

    const categoryColor = NOTE_CATEGORY_COLORS[note.category as NoteCategory] || "#8b5cf6";

    return (
        <Link
            href={`/notes/${note.id}`}
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
                }}
            >
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
                        {/* Category badge */}
                        <span
                            className="category-badge"
                            style={{
                                background: `${categoryColor}20`,
                                color: categoryColor,
                                fontSize: "11px",
                                padding: "3px 10px",
                            }}
                        >
                            {NOTE_CATEGORY_LABELS[note.category as NoteCategory] || note.category}
                        </span>
                        <h3
                            style={{
                                fontSize: "16px",
                                fontWeight: 600,
                                color: "#f0f0f5",
                                lineHeight: 1.3,
                            }}
                        >
                            {note.title}
                        </h3>
                    </div>

                    {/* Preview text */}
                    {preview && (
                        <p
                            style={{
                                fontSize: "13px",
                                color: "#9595b0",
                                lineHeight: 1.5,
                                whiteSpace: "pre-line",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                            }}
                        >
                            {preview}
                        </p>
                    )}

                    {/* Tags + block count */}
                    <div style={{ display: "flex", gap: "6px", marginTop: "8px", flexWrap: "wrap", alignItems: "center" }}>
                        {note.tags && note.tags.length > 0 && note.tags.slice(0, 3).map((tag) => (
                            <span
                                key={tag}
                                style={{
                                    fontSize: "11px",
                                    color: "#6366f1",
                                    background: "rgba(99, 102, 241, 0.1)",
                                    padding: "2px 8px",
                                    borderRadius: "4px",
                                }}
                            >
                                #{tag}
                            </span>
                        ))}
                        <span style={{ fontSize: "11px", color: "#5a5a78" }}>
                            {note.blocks.length} block{note.blocks.length !== 1 ? "s" : ""}
                        </span>
                    </div>
                </div>

                {/* Arrow */}
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
            </div>
        </Link>
    );
}
