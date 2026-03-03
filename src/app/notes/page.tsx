"use client";

import { useState, useEffect } from "react";
import { Note, NoteCategory, NOTE_CATEGORY_LABELS } from "@/types";
import { getAllNotes } from "@/lib/notes";
import NoteCard from "@/components/NoteCard";
import Link from "next/link";

export default function NotesPage() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<NoteCategory | "ALL">("ALL");

    useEffect(() => {
        getAllNotes()
            .then(setNotes)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = notes.filter((n) => {
        const matchSearch =
            n.title.toLowerCase().includes(search.toLowerCase()) ||
            (n.tags && n.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())));
        const matchCategory = categoryFilter === "ALL" || n.category === categoryFilter;
        return matchSearch && matchCategory;
    });

    const categories = ["ALL", ...Object.values(NoteCategory)] as const;

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div style={{ padding: "24px 0 16px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <h1
                        style={{
                            fontSize: "28px",
                            fontWeight: 700,
                            background: "linear-gradient(135deg, #f0f0f5, #818cf8)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            marginBottom: "4px",
                        }}
                    >
                        Notes
                    </h1>
                    <p style={{ fontSize: "14px", color: "#9595b0" }}>
                        Block-based notes &amp; study material
                    </p>
                </div>
                <Link href="/notes/create">
                    <button className="btn btn-primary btn-sm" style={{ fontSize: "13px" }}>
                        + New
                    </button>
                </Link>
            </div>

            {/* Search */}
            <div style={{ marginBottom: "12px" }}>
                <div style={{ position: "relative" }}>
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#5a5a78"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                            position: "absolute",
                            left: "14px",
                            top: "50%",
                            transform: "translateY(-50%)",
                        }}
                    >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        className="input-field"
                        placeholder="Search notes or tags..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ paddingLeft: "40px" }}
                    />
                </div>
            </div>

            {/* Category filter tabs */}
            <div
                style={{
                    display: "flex",
                    gap: "6px",
                    overflowX: "auto",
                    paddingBottom: "12px",
                    scrollbarWidth: "none",
                }}
            >
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className="btn btn-sm"
                        style={{
                            background:
                                categoryFilter === cat
                                    ? "var(--color-accent)"
                                    : "var(--color-bg-input)",
                            color:
                                categoryFilter === cat ? "white" : "var(--color-text-secondary)",
                            border: `1px solid ${
                                categoryFilter === cat
                                    ? "var(--color-accent)"
                                    : "var(--color-border)"
                            }`,
                            flexShrink: 0,
                        }}
                    >
                        {cat === "ALL" ? "All" : NOTE_CATEGORY_LABELS[cat]}
                    </button>
                ))}
            </div>

            {/* Count */}
            <div style={{ marginBottom: "12px" }}>
                <span style={{ fontSize: "13px", color: "#5a5a78" }}>
                    {filtered.length} note{filtered.length !== 1 ? "s" : ""}
                </span>
            </div>

            {/* Notes list */}
            {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="skeleton"
                            style={{ height: "88px", borderRadius: "12px" }}
                        />
                    ))}
                </div>
            ) : filtered.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {filtered.map((note) => (
                        <NoteCard key={note.id} note={note} />
                    ))}
                </div>
            ) : (
                <div
                    style={{
                        textAlign: "center",
                        padding: "48px 0",
                        color: "#5a5a78",
                    }}
                >
                    <p style={{ fontSize: "36px", marginBottom: "8px" }}>📝</p>
                    <p style={{ fontSize: "16px", fontWeight: 500, marginBottom: "4px" }}>
                        {search || categoryFilter !== "ALL" ? "No notes found" : "No notes yet"}
                    </p>
                    <p style={{ fontSize: "13px" }}>
                        {search || categoryFilter !== "ALL"
                            ? "Try a different search or filter"
                            : "Create your first block-based note"}
                    </p>
                </div>
            )}
        </div>
    );
}
