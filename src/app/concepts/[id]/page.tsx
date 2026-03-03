"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Concept } from "@/types";
import { getConceptById, getConceptsByIds, deleteConcept } from "@/lib/concepts";
import CategoryBadge from "@/components/CategoryBadge";
import Link from "next/link";

export default function ConceptDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const [concept, setConcept] = useState<Concept | null>(null);
    const [confusedConcepts, setConfusedConcepts] = useState<Concept[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const c = await getConceptById(id);
                setConcept(c);
                if (c && c.confused_with.length > 0) {
                    const confused = await getConceptsByIds(c.confused_with);
                    setConfusedConcepts(confused);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id]);

    const handleDelete = async () => {
        if (!concept) return;
        setDeleting(true);
        try {
            await deleteConcept(concept.id);
            router.push("/");
        } catch (err) {
            console.error(err);
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: "24px 0" }}>
                <div className="skeleton" style={{ height: "24px", width: "120px", marginBottom: "16px" }} />
                <div className="skeleton" style={{ height: "32px", width: "80%", marginBottom: "24px" }} />
                <div className="skeleton" style={{ height: "120px", marginBottom: "16px" }} />
                <div className="skeleton" style={{ height: "120px", marginBottom: "16px" }} />
                <div className="skeleton" style={{ height: "80px" }} />
            </div>
        );
    }

    if (!concept) {
        return (
            <div style={{ padding: "48px 0", textAlign: "center", color: "#5a5a78" }}>
                <p style={{ fontSize: "16px", marginBottom: "8px" }}>Concept not found</p>
                <Link href="/" className="btn btn-secondary" style={{ textDecoration: "none" }}>
                    Back to Browse
                </Link>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Back + Actions */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "20px 0 12px",
                }}
            >
                <Link
                    href="/"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "#9595b0",
                        textDecoration: "none",
                        fontSize: "14px",
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Back
                </Link>
                <div style={{ display: "flex", gap: "8px" }}>
                    <Link
                        href={`/concepts/${concept.id}/edit`}
                        className="btn btn-secondary btn-sm"
                        style={{ textDecoration: "none" }}
                    >
                        Edit
                    </Link>
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="btn btn-danger btn-sm"
                    >
                        Delete
                    </button>
                </div>
            </div>

            {/* Title + Category */}
            <div style={{ marginBottom: "24px" }}>
                <CategoryBadge category={concept.category} size="md" />
                <h1
                    style={{
                        fontSize: "26px",
                        fontWeight: 700,
                        marginTop: "10px",
                        lineHeight: 1.3,
                    }}
                >
                    {concept.title}
                </h1>
            </div>

            {/* Memory Hook (shown FIRST per spec) */}
            <div className="memory-hook" style={{ marginBottom: "16px" }}>
                <div
                    style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#818cf8",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: "6px",
                    }}
                >
                    💡 Memory Hook
                </div>
                <p style={{ fontSize: "15px", lineHeight: 1.6, fontWeight: 500, whiteSpace: "pre-line" }}>
                    {concept.exam_memory_hook}
                </p>
            </div>

            {/* Exam Trap Alert */}
            {concept.exam_trap_alert && (
                <div className="trap-alert" style={{ marginBottom: "16px" }}>
                    <span style={{ fontSize: "18px", flexShrink: 0 }}>⚠️</span>
                    <div>
                        <div
                            style={{
                                fontSize: "12px",
                                fontWeight: 600,
                                color: "#f59e0b",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                marginBottom: "4px",
                            }}
                        >
                            Exam Trap
                        </div>
                        <p style={{ fontSize: "14px", color: "#fbbf24", lineHeight: 1.5, whiteSpace: "pre-line" }}>
                            {concept.exam_trap_alert}
                        </p>
                    </div>
                </div>
            )}

            {/* Info sections */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Purpose */}
                <div className="glass-card" style={{ padding: "16px" }}>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "#9595b0", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                        Purpose
                    </div>
                    <p style={{ fontSize: "14px", lineHeight: 1.6, whiteSpace: "pre-line" }}>{concept.purpose}</p>
                </div>

                {/* Used When */}
                {concept.used_when && (
                    <div className="glass-card" style={{ padding: "16px" }}>
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "#9595b0", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                            Used When
                        </div>
                        <p style={{ fontSize: "14px", lineHeight: 1.6, whiteSpace: "pre-line" }}>{concept.used_when}</p>
                    </div>
                )}

                {/* Key Characteristics */}
                {concept.key_characteristics.length > 0 && (
                    <div className="glass-card" style={{ padding: "16px" }}>
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "#9595b0", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                            Key Characteristics
                        </div>
                        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "6px" }}>
                            {concept.key_characteristics.map((char, i) => (
                                <li
                                    key={i}
                                    style={{
                                        fontSize: "14px",
                                        lineHeight: 1.5,
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: "8px",
                                    }}
                                >
                                    <span style={{ color: "#6366f1", flexShrink: 0 }}>•</span>
                                    {char}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Key Difference */}
                <div className="glass-card" style={{ padding: "16px", borderColor: "rgba(99, 102, 241, 0.3)" }}>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                        Key Difference
                    </div>
                    <p style={{ fontSize: "14px", lineHeight: 1.6, whiteSpace: "pre-line" }}>{concept.key_difference}</p>
                </div>

                {/* Confused With */}
                {confusedConcepts.length > 0 && (
                    <div className="glass-card" style={{ padding: "16px" }}>
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "#9595b0", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>
                            Often Confused With
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {confusedConcepts.map((c) => (
                                <div
                                    key={c.id}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        gap: "8px",
                                    }}
                                >
                                    <Link
                                        href={`/concepts/${c.id}`}
                                        className="chip"
                                        style={{ textDecoration: "none" }}
                                    >
                                        {c.title}
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="9 18 15 12 9 6" />
                                        </svg>
                                    </Link>
                                    <Link
                                        href={`/compare?ids=${concept.id},${c.id}`}
                                        className="btn btn-secondary btn-sm"
                                        style={{
                                            textDecoration: "none",
                                            fontSize: "11px",
                                            flexShrink: 0,
                                        }}
                                    >
                                        Compare
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Delete confirmation modal */}
            {showDeleteConfirm && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.7)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 100,
                        padding: "16px",
                    }}
                    onClick={() => setShowDeleteConfirm(false)}
                >
                    <div
                        className="glass-card animate-slide-up"
                        style={{ padding: "24px", maxWidth: "340px", width: "100%" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>
                            Delete this concept?
                        </h3>
                        <p style={{ fontSize: "14px", color: "#9595b0", marginBottom: "20px" }}>
                            &quot;{concept.title}&quot; will be permanently removed.
                        </p>
                        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="btn btn-secondary btn-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="btn btn-danger btn-sm"
                                disabled={deleting}
                            >
                                {deleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
