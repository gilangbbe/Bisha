"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Process, PROCESS_TYPE_COLORS, PROCESS_TYPE_LABELS, collectDecisions } from "@/types";
import { getProcessesByIds, getAllProcesses } from "@/lib/processes";
import Link from "next/link";

function CompareContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const idsParam = searchParams.get("ids");
    const [processes, setProcesses] = useState<Process[]>([]);
    const [allProcesses, setAllProcesses] = useState<Process[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPicker, setShowPicker] = useState(false);
    const [pickerSearch, setPickerSearch] = useState("");

    useEffect(() => {
        async function load() {
            try {
                const all = await getAllProcesses();
                setAllProcesses(all);
                if (idsParam) {
                    const ids = idsParam.split(",").filter(Boolean);
                    const results = await getProcessesByIds(ids);
                    setProcesses(results);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [idsParam]);

    const addProcess = (id: string) => {
        const currentIds = processes.map((p) => p.id);
        if (!currentIds.includes(id) && currentIds.length < 3) {
            router.push(`/processes/compare?ids=${[...currentIds, id].join(",")}`);
        }
        setShowPicker(false);
        setPickerSearch("");
    };

    const removeProcess = (id: string) => {
        const newIds = processes.filter((p) => p.id !== id).map((p) => p.id);
        router.push(newIds.length > 0 ? `/processes/compare?ids=${newIds.join(",")}` : "/processes/compare");
    };

    const filteredPicker = allProcesses.filter(
        (p) => !processes.find((sel) => sel.id === p.id) && p.title.toLowerCase().includes(pickerSearch.toLowerCase())
    );

    const dimensions = [
        { label: "Trigger", key: "trigger" as const },
        {
            label: "Key Steps",
            render: (p: Process) =>
                p.steps.length > 0
                    ? p.steps.map((s) => s.action).join(" → ")
                    : null,
        },
        {
            label: "Decision Points",
            render: (p: Process) => {
                const decisions = collectDecisions(p.steps);
                return decisions.length > 0
                    ? decisions.map((d) => {
                          const depthLabel = d.depth > 0 ? ` [depth ${d.depth}]` : "";
                          return `◇ ${d.question} (${d.branchCount} branch${d.branchCount !== 1 ? "es" : ""})${depthLabel}`;
                      }).join("\n")
                    : null;
            },
        },
        { label: "Outcome", key: "outcome" as const },
        { label: "Exam Trap", key: "exam_trap_alert" as const },
    ];

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
                <Link href="/processes" style={{ display: "flex", alignItems: "center", gap: "6px", color: "#9595b0", textDecoration: "none", fontSize: "14px", marginBottom: "12px" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                    Back
                </Link>
                <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "4px" }}>Compare Processes</h1>
                <p style={{ fontSize: "14px", color: "#9595b0" }}>See workflow differences side by side</p>
            </div>

            {/* Selected */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px", alignItems: "center" }}>
                {processes.map((p) => (
                    <span key={p.id} className="chip" onClick={() => removeProcess(p.id)}>
                        {p.title} <span style={{ opacity: 0.6 }}>✕</span>
                    </span>
                ))}
                {processes.length < 3 && (
                    <button onClick={() => setShowPicker(!showPicker)} className="btn btn-secondary btn-sm" style={{ borderRadius: "999px" }}>+ Add</button>
                )}
            </div>

            {/* Picker */}
            {showPicker && (
                <div className="glass-card animate-slide-up" style={{ padding: "12px", marginBottom: "16px" }}>
                    <input className="input-field" placeholder="Search processes..." value={pickerSearch} onChange={(e) => setPickerSearch(e.target.value)} autoFocus style={{ marginBottom: "8px" }} />
                    <div style={{ maxHeight: "200px", overflow: "auto" }}>
                        {filteredPicker.length === 0 ? (
                            <p style={{ padding: "12px", color: "#5a5a78", fontSize: "14px", textAlign: "center" }}>No processes found</p>
                        ) : (
                            filteredPicker.slice(0, 10).map((p) => (
                                <div key={p.id} onClick={() => addProcess(p.id)} style={{ padding: "10px 12px", cursor: "pointer", borderBottom: "1px solid var(--color-border)", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                                    <span className="category-badge" style={{ background: `${PROCESS_TYPE_COLORS[p.process_type]}22`, color: PROCESS_TYPE_COLORS[p.process_type], fontSize: "10px" }}>
                                        {PROCESS_TYPE_LABELS[p.process_type]}
                                    </span>
                                    <span>{p.title}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Comparison table */}
            {processes.length < 2 ? (
                <div style={{ textAlign: "center", padding: "48px 16px", color: "#5a5a78" }}>
                    <p style={{ fontSize: "16px", marginBottom: "8px" }}>Select at least 2 processes to compare</p>
                    <p style={{ fontSize: "13px" }}>Use the + Add button above</p>
                </div>
            ) : (
                <div style={{ overflowX: "auto", borderRadius: "16px", border: "1px solid var(--color-border)" }}>
                    <table className="compare-table">
                        <thead>
                            <tr>
                                <th style={{ background: "var(--color-bg-card)" }}>Dimension</th>
                                {processes.map((p) => (
                                    <th key={p.id} style={{ background: "var(--color-bg-card)", color: "var(--color-text-primary)", minWidth: "200px" }}>
                                        <Link href={`/processes/${p.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                                <span className="category-badge" style={{ background: `${PROCESS_TYPE_COLORS[p.process_type]}22`, color: PROCESS_TYPE_COLORS[p.process_type], alignSelf: "flex-start" }}>
                                                    {PROCESS_TYPE_LABELS[p.process_type]}
                                                </span>
                                                <span style={{ fontSize: "14px", fontWeight: 600 }}>{p.title}</span>
                                            </div>
                                        </Link>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {dimensions.map((dim) => {
                                const values = processes.map((p) =>
                                    "key" in dim
                                        ? (p[dim.key as keyof Process] as string | null)
                                        : dim.render(p)
                                );
                                const allSame = values.every((v) => v === values[0]);

                                return (
                                    <tr key={dim.label}>
                                        <th>{dim.label}</th>
                                        {processes.map((p, i) => {
                                            const value = values[i];
                                            const isEmpty = !value;
                                            const isExamTrap = dim.label === "Exam Trap" && value;

                                            return (
                                                <td
                                                    key={p.id}
                                                    className={isEmpty ? "empty-value" : allSame ? "same-value" : "diff-value"}
                                                    style={isExamTrap ? { background: "var(--color-warning-bg)", color: "#fbbf24" } : undefined}
                                                >
                                                    {isExamTrap && <span style={{ marginRight: "6px" }}>⚠️</span>}
                                                    {isEmpty ? "—" : dim.label === "Key Steps" ? (
                                                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                                            {(value as string).split(" → ").map((step, si) => (
                                                                <span key={si} style={{ display: "flex", gap: "6px", alignItems: "flex-start" }}>
                                                                    <span style={{ color: "#6366f1", flexShrink: 0 }}>{si + 1}.</span>
                                                                    <span style={{ whiteSpace: "pre-line" }}>{step}</span>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : dim.label === "Decision Points" ? (
                                                        <div style={{ whiteSpace: "pre-line" }}>{value}</div>
                                                    ) : <span style={{ whiteSpace: "pre-line" }}>{value}</span>}
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

export default function ProcessComparePage() {
    return (
        <Suspense fallback={
            <div style={{ padding: "24px 0" }}>
                <div className="skeleton" style={{ height: "32px", width: "50%", marginBottom: "24px" }} />
                <div className="skeleton" style={{ height: "400px" }} />
            </div>
        }>
            <CompareContent />
        </Suspense>
    );
}
