"use client";

import { useState, useEffect } from "react";
import { Concept, ConceptCategory, CATEGORY_LABELS } from "@/types";
import { getAllConcepts } from "@/lib/concepts";
import ConceptCard from "@/components/ConceptCard";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HomePage() {
    const router = useRouter();
    const [concepts, setConcepts] = useState<Concept[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<ConceptCategory | "ALL">("ALL");
    const [selectMode, setSelectMode] = useState(false);
    const [selected, setSelected] = useState<string[]>([]);

    useEffect(() => {
        getAllConcepts()
            .then(setConcepts)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = concepts.filter((c) => {
        const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
        const matchCategory = categoryFilter === "ALL" || c.category === categoryFilter;
        return matchSearch && matchCategory;
    });

    const toggleSelect = (id: string) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
        );
    };

    const handleCompare = () => {
        if (selected.length >= 2) {
            router.push(`/compare?ids=${selected.join(",")}`);
        }
    };

    const categories = ["ALL", ...Object.values(ConceptCategory)] as const;

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div style={{ padding: "24px 0 16px" }}>
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
                    Bisha
                </h1>
                <p style={{ fontSize: "14px", color: "#9595b0" }}>
                    Banking concepts, clearly differentiated
                </p>
                <Link
                    href="/learn"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        marginTop: "8px",
                        fontSize: "13px",
                        color: "#818cf8",
                        textDecoration: "none",
                    }}
                >
                    💡 Help me study better →
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
                        placeholder="Search concepts..."
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
                            border: `1px solid ${categoryFilter === cat
                                    ? "var(--color-accent)"
                                    : "var(--color-border)"
                                }`,
                            flexShrink: 0,
                        }}
                    >
                        {cat === "ALL" ? "All" : CATEGORY_LABELS[cat]}
                    </button>
                ))}
            </div>

            {/* Select mode toggle */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                }}
            >
                <span style={{ fontSize: "13px", color: "#5a5a78" }}>
                    {filtered.length} concept{filtered.length !== 1 ? "s" : ""}
                </span>
                <button
                    onClick={() => {
                        setSelectMode(!selectMode);
                        setSelected([]);
                    }}
                    className="btn btn-ghost btn-sm"
                    style={{
                        color: selectMode ? "var(--color-accent)" : "var(--color-text-secondary)",
                    }}
                >
                    {selectMode ? "Cancel" : "Select to Compare"}
                </button>
            </div>

            {/* Concept list */}
            {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="skeleton" style={{ height: "88px" }} />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div
                    style={{
                        textAlign: "center",
                        padding: "48px 16px",
                        color: "#5a5a78",
                    }}
                >
                    <p style={{ fontSize: "16px", marginBottom: "8px" }}>
                        {concepts.length === 0
                            ? "No concepts yet"
                            : "No concepts match your search"}
                    </p>
                    <p style={{ fontSize: "13px" }}>
                        {concepts.length === 0
                            ? "Tap \"Create\" to add your first banking concept"
                            : "Try a different search or category"}
                    </p>
                </div>
            ) : (
                <div
                    className="stagger-children"
                    style={{ display: "flex", flexDirection: "column", gap: "10px" }}
                >
                    {filtered.map((concept) => (
                        <ConceptCard
                            key={concept.id}
                            concept={concept}
                            selectable={selectMode}
                            selected={selected.includes(concept.id)}
                            onToggleSelect={toggleSelect}
                        />
                    ))}
                </div>
            )}

            {/* Compare FAB */}
            {selectMode && selected.length >= 2 && (
                <button
                    onClick={handleCompare}
                    className="btn btn-primary pulse-glow"
                    style={{
                        position: "fixed",
                        bottom: "88px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        zIndex: 40,
                        padding: "12px 28px",
                        fontSize: "15px",
                        borderRadius: "999px",
                        boxShadow: "0 4px 24px rgba(99, 102, 241, 0.4)",
                    }}
                >
                    Compare {selected.length} concepts
                </button>
            )}
        </div>
    );
}
