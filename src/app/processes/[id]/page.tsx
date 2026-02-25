"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Process, Step, PROCESS_TYPE_LABELS, PROCESS_TYPE_COLORS, DECISION_BRANCH_COLORS } from "@/types";
import { getProcessById, getProcessesByIds, deleteProcess } from "@/lib/processes";
import FlowchartView from "@/components/FlowchartView";
import MindmapView from "@/components/MindmapView";
import Link from "next/link";

type ViewMode = "flowchart" | "mindmap" | "steps";
type ZoomLevel = 1 | 2 | 3;

/** Recursively render a step list with nested branches */
function StepListView({ steps, depth = 0, prefix = "" }: { steps: Step[]; depth?: number; prefix?: string }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: depth === 0 ? "8px" : "6px", marginLeft: depth > 0 ? "16px" : 0 }}>
            {steps.map((step, i) => {
                const label = prefix ? `${prefix}.${i + 1}` : `${i + 1}`;
                return (
                    <div key={step.id} className={depth === 0 ? "glass-card" : undefined} style={{ padding: depth === 0 ? "14px" : "10px 12px", borderColor: step.decision ? "rgba(245, 158, 11, 0.3)" : undefined, background: depth > 0 ? "rgba(255,255,255,0.02)" : undefined, borderRadius: depth > 0 ? "8px" : undefined, border: depth > 0 ? "1px solid rgba(255,255,255,0.05)" : undefined }}>
                        <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                            <span style={{ width: "24px", height: "24px", borderRadius: "50%", background: step.decision ? "#f59e0b" : depth > 0 ? "#3a3a55" : "#6366f1", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: depth > 0 ? "10px" : "12px", fontWeight: 700, flexShrink: 0 }}>
                                {label}
                            </span>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: depth > 0 ? "13px" : "14px", lineHeight: 1.5, marginBottom: step.actor ? "4px" : 0 }}>{step.action}</p>
                                {step.actor && <span style={{ fontSize: "12px", color: "#5a5a78" }}>👤 {step.actor}</span>}
                                {step.decision && (
                                    <div style={{ marginTop: "8px", padding: "8px", background: "rgba(245, 158, 11, 0.08)", borderRadius: "8px", border: "1px solid rgba(245, 158, 11, 0.15)" }}>
                                        <p style={{ fontSize: "12px", color: "#fbbf24", fontWeight: 600, marginBottom: "6px" }}>◇ {step.decision.question}</p>
                                        {step.decision.options.map((opt, oi) => (
                                            <div key={opt.id} style={{ marginTop: oi > 0 ? "8px" : "4px" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: opt.steps.length > 0 ? "6px" : 0 }}>
                                                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: DECISION_BRANCH_COLORS[oi % DECISION_BRANCH_COLORS.length], flexShrink: 0 }} />
                                                    <span style={{ fontSize: "12px", fontWeight: 600, color: DECISION_BRANCH_COLORS[oi % DECISION_BRANCH_COLORS.length] }}>{opt.label}</span>
                                                    {opt.steps.length > 0 && <span style={{ fontSize: "10px", color: "#5a5a78" }}>({opt.steps.length} step{opt.steps.length !== 1 ? "s" : ""})</span>}
                                                </div>
                                                {opt.steps.length > 0 && (
                                                    <StepListView steps={opt.steps} depth={depth + 1} prefix={`${label}.${String.fromCharCode(65 + oi)}`} />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {step.notes && <p style={{ fontSize: "12px", color: "#9595b0", fontStyle: "italic", marginTop: "6px" }}>📝 {step.notes}</p>}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default function ProcessDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const [process, setProcess] = useState<Process | null>(null);
    const [confusedProcesses, setConfusedProcesses] = useState<Process[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>("flowchart");
    const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(2);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const p = await getProcessById(id);
                setProcess(p);
                if (p && p.confused_with.length > 0) {
                    const confused = await getProcessesByIds(p.confused_with);
                    setConfusedProcesses(confused);
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
        if (!process) return;
        setDeleting(true);
        try {
            await deleteProcess(process.id);
            router.push("/processes");
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
                <div className="skeleton" style={{ height: "300px" }} />
            </div>
        );
    }

    if (!process) {
        return (
            <div style={{ padding: "48px 0", textAlign: "center", color: "#5a5a78" }}>
                <p style={{ fontSize: "16px", marginBottom: "8px" }}>Process not found</p>
                <Link href="/processes" className="btn btn-secondary" style={{ textDecoration: "none" }}>Back to Processes</Link>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Back + Actions */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0 12px" }}>
                <Link href="/processes" style={{ display: "flex", alignItems: "center", gap: "6px", color: "#9595b0", textDecoration: "none", fontSize: "14px" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                    Back
                </Link>
                <div style={{ display: "flex", gap: "8px" }}>
                    <Link href={`/processes/${process.id}/edit`} className="btn btn-secondary btn-sm" style={{ textDecoration: "none" }}>Edit</Link>
                    <button onClick={() => setShowDeleteConfirm(true)} className="btn btn-danger btn-sm">Delete</button>
                </div>
            </div>

            {/* Title + Type */}
            <div style={{ marginBottom: "16px" }}>
                <span className="category-badge" style={{ background: `${PROCESS_TYPE_COLORS[process.process_type]}22`, color: PROCESS_TYPE_COLORS[process.process_type] }}>
                    {PROCESS_TYPE_LABELS[process.process_type]}
                </span>
                <h1 style={{ fontSize: "26px", fontWeight: 700, marginTop: "10px", lineHeight: 1.3 }}>
                    {process.title}
                </h1>
            </div>

            {/* Trigger & Outcome */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
                {process.trigger && (
                    <div className="glass-card" style={{ padding: "12px", flex: 1 }}>
                        <div style={{ fontSize: "11px", fontWeight: 600, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>▶ Trigger</div>
                        <p style={{ fontSize: "13px", lineHeight: 1.5 }}>{process.trigger}</p>
                    </div>
                )}
                {process.outcome && (
                    <div className="glass-card" style={{ padding: "12px", flex: 1 }}>
                        <div style={{ fontSize: "11px", fontWeight: 600, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>◉ Outcome</div>
                        <p style={{ fontSize: "13px", lineHeight: 1.5 }}>{process.outcome}</p>
                    </div>
                )}
            </div>

            {/* Exam Trap */}
            {process.exam_trap_alert && (
                <div className="trap-alert" style={{ marginBottom: "16px" }}>
                    <span style={{ fontSize: "18px", flexShrink: 0 }}>⚠️</span>
                    <div>
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Exam Trap</div>
                        <p style={{ fontSize: "14px", color: "#fbbf24", lineHeight: 1.5 }}>{process.exam_trap_alert}</p>
                    </div>
                </div>
            )}

            {/* View toggle */}
            <div style={{ display: "flex", gap: "6px", marginBottom: "12px", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: "4px" }}>
                    {(["flowchart", "mindmap", "steps"] as ViewMode[]).map((mode) => (
                        <button key={mode} onClick={() => setViewMode(mode)} className="btn btn-sm" style={{
                            background: viewMode === mode ? "var(--color-accent)" : "var(--color-bg-input)",
                            color: viewMode === mode ? "white" : "var(--color-text-secondary)",
                            border: `1px solid ${viewMode === mode ? "var(--color-accent)" : "var(--color-border)"}`,
                            textTransform: "capitalize",
                        }}>
                            {mode === "flowchart" ? "📊 Flow" : mode === "mindmap" ? "🧠 Mind" : "📝 Steps"}
                        </button>
                    ))}
                </div>
                {viewMode !== "steps" && (
                    <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                        <span style={{ fontSize: "11px", color: "#5a5a78", marginRight: "4px" }}>Zoom:</span>
                        {([1, 2, 3] as ZoomLevel[]).map((level) => (
                            <button key={level} onClick={() => setZoomLevel(level)} className="btn btn-sm" style={{
                                width: "28px", height: "28px", padding: 0,
                                background: zoomLevel === level ? "var(--color-accent)" : "var(--color-bg-input)",
                                color: zoomLevel === level ? "white" : "var(--color-text-secondary)",
                                border: `1px solid ${zoomLevel === level ? "var(--color-accent)" : "var(--color-border)"}`,
                                fontSize: "12px",
                            }}>
                                {level}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Visualization */}
            {viewMode === "flowchart" && (
                <FlowchartView steps={process.steps} title={process.title} zoomLevel={zoomLevel} />
            )}
            {viewMode === "mindmap" && (
                <MindmapView steps={process.steps} title={process.title} zoomLevel={zoomLevel} />
            )}
            {viewMode === "steps" && (
                <StepListView steps={process.steps} />
            )}

            {/* Confused With */}
            {confusedProcesses.length > 0 && (
                <div className="glass-card" style={{ padding: "16px", marginTop: "16px" }}>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "#9595b0", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>
                        Often Confused With
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {confusedProcesses.map((p) => (
                            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                                <Link href={`/processes/${p.id}`} className="chip" style={{ textDecoration: "none" }}>
                                    {p.title}
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                                </Link>
                                <Link href={`/processes/compare?ids=${process.id},${p.id}`} className="btn btn-secondary btn-sm" style={{ textDecoration: "none", fontSize: "11px", flexShrink: 0 }}>
                                    Compare
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Delete confirmation */}
            {showDeleteConfirm && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "16px" }} onClick={() => setShowDeleteConfirm(false)}>
                    <div className="glass-card animate-slide-up" style={{ padding: "24px", maxWidth: "340px", width: "100%" }} onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>Delete this process?</h3>
                        <p style={{ fontSize: "14px", color: "#9595b0", marginBottom: "20px" }}>&quot;{process.title}&quot; will be permanently removed.</p>
                        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                            <button onClick={() => setShowDeleteConfirm(false)} className="btn btn-secondary btn-sm">Cancel</button>
                            <button onClick={handleDelete} className="btn btn-danger btn-sm" disabled={deleting}>{deleting ? "Deleting..." : "Delete"}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
