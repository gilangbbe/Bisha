"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Concept } from "@/types";
import { getConceptsByIds, getAllConcepts } from "@/lib/concepts";
import CategoryBadge from "@/components/CategoryBadge";
import Link from "next/link";

function CompareContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const idsParam = searchParams.get("ids");
    const [concepts, setConcepts] = useState<Concept[]>([]);
    const [allConcepts, setAllConcepts] = useState<Concept[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPicker, setShowPicker] = useState(false);
    const [pickerSearch, setPickerSearch] = useState("");

    useEffect(() => {
        async function load() {
            try {
                const all = await getAllConcepts();
                setAllConcepts(all);

                if (idsParam) {
                    const ids = idsParam.split(",").filter(Boolean);
                    const results = await getConceptsByIds(ids);
                    setConcepts(results);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [idsParam]);

    const addConcept = (id: string) => {
        const currentIds = concepts.map((c) => c.id);
        if (!currentIds.includes(id) && currentIds.length < 4) {
            const newIds = [...currentIds, id];
            router.push(`/compare?ids=${newIds.join(",")}`);
        }
        setShowPicker(false);
        setPickerSearch("");
    };

    const removeConcept = (id: string) => {
        const newIds = concepts.filter((c) => c.id !== id).map((c) => c.id);
        if (newIds.length > 0) {
            router.push(`/compare?ids=${newIds.join(",")}`);
        } else {
            router.push("/compare");
        }
    };

    const dimensions = [
        { label: "Purpose", key: "purpose" as const },
        { label: "Used When", key: "used_when" as const },
        { label: "Key Characteristics", key: "key_characteristics" as const },
        { label: "Key Difference", key: "key_difference" as const },
        { label: "Exam Memory Hook", key: "exam_memory_hook" as const },
        { label: "Exam Trap", key: "exam_trap_alert" as const },
    ];

    const getCellClass = (key: string, value: string | string[] | null, allValues: (string | string[] | null)[]) => {
        if (!value || (Array.isArray(value) && value.length === 0)) return "empty-value";
        const stringified = Array.isArray(value) ? value.join(", ") : value;
        const allStringified = allValues.map((v) =>
            Array.isArray(v) ? v.join(", ") : v || ""
        );
        const allSame = allStringified.every((v) => v === stringified);
        return allSame ? "same-value" : "diff-value";
    };

    const renderValue = (key: string, value: string | string[] | null) => {
        if (!value || (Array.isArray(value) && value.length === 0)) return "—";
        if (key === "key_characteristics" && Array.isArray(value)) {
            return (
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "4px" }}>
                    {value.map((v, i) => (
                        <li key={i} style={{ display: "flex", gap: "6px", alignItems: "flex-start" }}>
                            <span style={{ color: "#6366f1" }}>•</span>
                            <span style={{ whiteSpace: "pre-line" }}>{v}</span>
                        </li>
                    ))}
                </ul>
            );
        }
        return <span style={{ whiteSpace: "pre-line" }}>{value}</span>;
    };

    const filteredPicker = allConcepts.filter(
        (c) =>
            !concepts.find((sel) => sel.id === c.id) &&
            c.title.toLowerCase().includes(pickerSearch.toLowerCase())
    );

    if (loading) {
        return (
            <div style={{ padding: "24px 0" }}>
                <div className="skeleton" style={{ height: "32px", width: "50%", marginBottom: "24px" }} />
                <div className="skeleton" style={{ height: "400px" }} />
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div style={{ padding: "24px 0 16px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "4px" }}>
                    Compare Concepts
                </h1>
                <p style={{ fontSize: "14px", color: "#9595b0" }}>
                    See differences side by side
                </p>
            </div>

            {/* Selected concepts */}
            <div
                style={{
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                    marginBottom: "16px",
                    alignItems: "center",
                }}
            >
                {concepts.map((c) => (
                    <span key={c.id} className="chip" onClick={() => removeConcept(c.id)}>
                        {c.title}
                        <span style={{ opacity: 0.6 }}>✕</span>
                    </span>
                ))}
                {concepts.length < 4 && (
                    <button
                        onClick={() => setShowPicker(!showPicker)}
                        className="btn btn-secondary btn-sm"
                        style={{ borderRadius: "999px" }}
                    >
                        + Add
                    </button>
                )}
            </div>

            {/* Picker */}
            {showPicker && (
                <div
                    className="glass-card animate-slide-up"
                    style={{ padding: "12px", marginBottom: "16px" }}
                >
                    <input
                        className="input-field"
                        placeholder="Search concepts..."
                        value={pickerSearch}
                        onChange={(e) => setPickerSearch(e.target.value)}
                        autoFocus
                        style={{ marginBottom: "8px" }}
                    />
                    <div style={{ maxHeight: "200px", overflow: "auto" }}>
                        {filteredPicker.length === 0 ? (
                            <p style={{ padding: "12px", color: "#5a5a78", fontSize: "14px", textAlign: "center" }}>
                                No concepts found
                            </p>
                        ) : (
                            filteredPicker.slice(0, 10).map((c) => (
                                <div
                                    key={c.id}
                                    onClick={() => addConcept(c.id)}
                                    style={{
                                        padding: "10px 12px",
                                        cursor: "pointer",
                                        borderBottom: "1px solid var(--color-border)",
                                        fontSize: "14px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                    }}
                                >
                                    <CategoryBadge category={c.category} />
                                    <span>{c.title}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Comparison table */}
            {concepts.length < 2 ? (
                <div
                    style={{
                        textAlign: "center",
                        padding: "48px 16px",
                        color: "#5a5a78",
                    }}
                >
                    <p style={{ fontSize: "16px", marginBottom: "8px" }}>
                        Select at least 2 concepts to compare
                    </p>
                    <p style={{ fontSize: "13px" }}>
                        Use the + Add button above, or go to Browse and select concepts there
                    </p>
                </div>
            ) : (
                <div
                    style={{
                        overflowX: "auto",
                        borderRadius: "16px",
                        border: "1px solid var(--color-border)",
                    }}
                >
                    <table className="compare-table">
                        {/* Header row with concept titles */}
                        <thead>
                            <tr>
                                <th style={{ background: "var(--color-bg-card)" }}>Dimension</th>
                                {concepts.map((c) => (
                                    <th
                                        key={c.id}
                                        style={{
                                            background: "var(--color-bg-card)",
                                            color: "var(--color-text-primary)",
                                            minWidth: "180px",
                                        }}
                                    >
                                        <Link
                                            href={`/concepts/${c.id}`}
                                            style={{ textDecoration: "none", color: "inherit" }}
                                        >
                                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                                <CategoryBadge category={c.category} />
                                                <span style={{ fontSize: "14px", fontWeight: 600 }}>
                                                    {c.title}
                                                </span>
                                            </div>
                                        </Link>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {dimensions.map((dim) => {
                                const allValues = concepts.map(
                                    (c) => c[dim.key] as string | string[] | null
                                );
                                return (
                                    <tr key={dim.key}>
                                        <th>{dim.label}</th>
                                        {concepts.map((c, i) => {
                                            const value = c[dim.key] as string | string[] | null;
                                            return (
                                                <td
                                                    key={c.id}
                                                    className={getCellClass(dim.key, value, allValues)}
                                                    style={
                                                        dim.key === "exam_trap_alert" && value
                                                            ? {
                                                                background: "var(--color-warning-bg)",
                                                                color: "#fbbf24",
                                                            }
                                                            : dim.key === "exam_memory_hook"
                                                                ? {
                                                                    background: "rgba(99, 102, 241, 0.05)",
                                                                    fontWeight: 500,
                                                                }
                                                                : undefined
                                                    }
                                                >
                                                    {dim.key === "exam_trap_alert" && value && (
                                                        <span style={{ marginRight: "6px" }}>⚠️</span>
                                                    )}
                                                    {dim.key === "exam_memory_hook" && value && (
                                                        <span style={{ marginRight: "6px" }}>💡</span>
                                                    )}
                                                    {renderValue(dim.key, value)}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default function ComparePage() {
    return (
        <Suspense
            fallback={
                <div style={{ padding: "24px 0" }}>
                    <div className="skeleton" style={{ height: "32px", width: "50%", marginBottom: "24px" }} />
                    <div className="skeleton" style={{ height: "400px" }} />
                </div>
            }
        >
            <CompareContent />
        </Suspense>
    );
}
