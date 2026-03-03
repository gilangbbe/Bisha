"use client";

import {
    Step,
    MAX_DECISION_OPTIONS,
    MIN_DECISION_OPTIONS,
    MAX_DECISION_DEPTH,
    DECISION_BRANCH_COLORS,
} from "@/types";
import { v4 as uuidv4 } from "uuid";
import { useCallback } from "react";

interface StepEditorProps {
    steps: Step[];
    onChange: (steps: Step[]) => void;
    /** Current nesting depth (0 = top level) */
    depth?: number;
    /** Label prefix for display (e.g. "1.A") */
    prefix?: string;
}

export default function StepEditor({
    steps,
    onChange,
    depth = 0,
    prefix = "",
}: StepEditorProps) {
    const addStep = useCallback(() => {
        const newStep: Step = {
            id: uuidv4(),
            order: steps.length + 1,
            action: "",
        };
        onChange([...steps, newStep]);
    }, [steps, onChange]);

    const updateStep = useCallback(
        (index: number, updates: Partial<Step>) => {
            const updated = steps.map((s, i) =>
                i === index ? { ...s, ...updates } : s
            );
            onChange(updated);
        },
        [steps, onChange]
    );

    const removeStep = useCallback(
        (index: number) => {
            const updated = steps
                .filter((_, i) => i !== index)
                .map((s, i) => ({ ...s, order: i + 1 }));
            onChange(updated);
        },
        [steps, onChange]
    );

    const moveStep = useCallback(
        (index: number, direction: "up" | "down") => {
            if (
                (direction === "up" && index === 0) ||
                (direction === "down" && index === steps.length - 1)
            )
                return;
            const updated = [...steps];
            const targetIndex = direction === "up" ? index - 1 : index + 1;
            [updated[index], updated[targetIndex]] = [
                updated[targetIndex],
                updated[index],
            ];
            onChange(updated.map((s, i) => ({ ...s, order: i + 1 })));
        },
        [steps, onChange]
    );

    const toggleDecision = useCallback(
        (index: number) => {
            const step = steps[index];
            if (step.decision) {
                updateStep(index, { decision: undefined });
            } else {
                updateStep(index, {
                    decision: {
                        question: "",
                        options: [
                            { id: uuidv4(), label: "Yes", steps: [] },
                            { id: uuidv4(), label: "No", steps: [] },
                        ],
                    },
                });
            }
        },
        [steps, updateStep]
    );

    const addDecisionOption = useCallback(
        (stepIndex: number) => {
            const step = steps[stepIndex];
            if (!step.decision || step.decision.options.length >= MAX_DECISION_OPTIONS) return;
            const newOption = { id: uuidv4(), label: "", steps: [] };
            updateStep(stepIndex, {
                decision: {
                    ...step.decision,
                    options: [...step.decision.options, newOption],
                },
            });
        },
        [steps, updateStep]
    );

    const removeDecisionOption = useCallback(
        (stepIndex: number, optionIndex: number) => {
            const step = steps[stepIndex];
            if (!step.decision || step.decision.options.length <= MIN_DECISION_OPTIONS) return;
            const newOptions = step.decision.options.filter((_, oi) => oi !== optionIndex);
            updateStep(stepIndex, {
                decision: { ...step.decision, options: newOptions },
            });
        },
        [steps, updateStep]
    );

    const updateDecisionOptionLabel = useCallback(
        (stepIndex: number, optionIndex: number, label: string) => {
            const step = steps[stepIndex];
            if (!step.decision) return;
            const newOptions = step.decision.options.map((o, oi) =>
                oi === optionIndex ? { ...o, label } : o
            );
            updateStep(stepIndex, {
                decision: { ...step.decision, options: newOptions },
            });
        },
        [steps, updateStep]
    );

    const updateBranchSteps = useCallback(
        (stepIndex: number, optionIndex: number, branchSteps: Step[]) => {
            const step = steps[stepIndex];
            if (!step.decision) return;
            const newOptions = step.decision.options.map((o, oi) =>
                oi === optionIndex ? { ...o, steps: branchSteps } : o
            );
            updateStep(stepIndex, {
                decision: { ...step.decision, options: newOptions },
            });
        },
        [steps, updateStep]
    );

    const canNestDeeper = depth < MAX_DECISION_DEPTH;

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: depth > 0 ? "8px" : "12px",
            }}
        >
            {steps.map((step, i) => {
                const stepLabel = prefix ? `${prefix}.${i + 1}` : `${i + 1}`;

                return (
                    <div
                        key={step.id}
                        className="glass-card"
                        style={{
                            padding: depth > 0 ? "10px" : "14px",
                            borderColor: step.decision ? "rgba(245, 158, 11, 0.3)" : undefined,
                            borderLeft: depth > 0 ? "3px solid rgba(99, 102, 241, 0.3)" : undefined,
                        }}
                    >
                        {/* Step header */}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                            <span
                                style={{
                                    minWidth: "24px",
                                    height: "24px",
                                    borderRadius: "12px",
                                    padding: "0 6px",
                                    background: step.decision ? "#f59e0b" : "#6366f1",
                                    color: "white",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: depth > 0 ? "9px" : "11px",
                                    fontWeight: 700,
                                    flexShrink: 0,
                                }}
                            >
                                {stepLabel}
                            </span>
                            <span style={{ flex: 1, fontSize: "12px", color: "#5a5a78", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                Step {stepLabel}
                                {step.decision && " · Decision"}
                            </span>
                            <button type="button" onClick={() => moveStep(i, "up")} className="btn btn-ghost btn-sm" style={{ padding: "4px", opacity: i === 0 ? 0.3 : 1 }} disabled={i === 0}>↑</button>
                            <button type="button" onClick={() => moveStep(i, "down")} className="btn btn-ghost btn-sm" style={{ padding: "4px", opacity: i === steps.length - 1 ? 0.3 : 1 }} disabled={i === steps.length - 1}>↓</button>
                            <button type="button" onClick={() => removeStep(i)} className="btn btn-ghost btn-sm" style={{ padding: "4px", color: "#ef4444" }}>✕</button>
                        </div>

                        {/* Action */}
                        <textarea className="input-field" placeholder="What happens in this step?" value={step.action} onChange={(e) => updateStep(i, { action: e.target.value })} rows={1} style={{ marginBottom: "8px", fontSize: depth > 0 ? "13px" : undefined }} />

                        {/* Actor */}
                        <textarea className="input-field" placeholder="Who does it? (optional)" value={step.actor || ""} onChange={(e) => updateStep(i, { actor: e.target.value || undefined })} rows={1} style={{ marginBottom: "8px", fontSize: "13px" }} />

                        {/* Decision toggle + Notes */}
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            {canNestDeeper && (
                                <button type="button" onClick={() => toggleDecision(i)} className="btn btn-sm" style={{ background: step.decision ? "rgba(245, 158, 11, 0.15)" : "var(--color-bg-input)", color: step.decision ? "#fbbf24" : "#5a5a78", border: `1px solid ${step.decision ? "rgba(245, 158, 11, 0.3)" : "var(--color-border)"}`, fontSize: "12px" }}>
                                    ◇ {step.decision ? "Remove Decision" : "Add Decision"}
                                </button>
                            )}
                            {!step.notes && !step.decision && (
                                <button type="button" onClick={() => updateStep(i, { notes: "" })} className="btn btn-sm" style={{ background: "var(--color-bg-input)", color: "#5a5a78", border: "1px solid var(--color-border)", fontSize: "12px" }}>+ Notes</button>
                            )}
                        </div>

                        {/* Decision: question + branches with nested editors */}
                        {step.decision && (
                            <div style={{ marginTop: "10px", padding: "10px", background: "rgba(245, 158, 11, 0.05)", borderRadius: "8px", border: "1px solid rgba(245, 158, 11, 0.15)" }}>
                                <textarea className="input-field" placeholder="Decision question (e.g., 'Is score above threshold?')" value={step.decision.question} onChange={(e) => updateStep(i, { decision: { ...step.decision!, question: e.target.value } })} rows={1} style={{ marginBottom: "10px", fontSize: "13px" }} />

                                {/* Branches */}
                                {step.decision.options.map((opt, oi) => {
                                    const branchColor = DECISION_BRANCH_COLORS[oi % DECISION_BRANCH_COLORS.length];
                                    return (
                                        <div key={opt.id} style={{ marginBottom: "10px", padding: "8px", borderRadius: "6px", border: `1px solid ${branchColor}33`, background: `${branchColor}08` }}>
                                            {/* Branch label header */}
                                            <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "6px" }}>
                                                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: branchColor, flexShrink: 0 }} />
                                                <textarea className="input-field" placeholder={`Branch ${oi + 1} label`} value={opt.label} onChange={(e) => updateDecisionOptionLabel(i, oi, e.target.value)} rows={1} style={{ flex: 1, fontSize: "13px" }} />
                                                <span style={{ fontSize: "10px", color: "#5a5a78", flexShrink: 0 }}>{opt.steps.length} step{opt.steps.length !== 1 ? "s" : ""}</span>
                                                {step.decision!.options.length > MIN_DECISION_OPTIONS && (
                                                    <button type="button" onClick={() => removeDecisionOption(i, oi)} className="btn btn-ghost btn-sm" style={{ padding: "2px 6px", color: "#ef4444", fontSize: "12px" }}>✕</button>
                                                )}
                                            </div>

                                            {/* Recursive nested step editor */}
                                            <StepEditor
                                                steps={opt.steps}
                                                onChange={(branchSteps) => updateBranchSteps(i, oi, branchSteps)}
                                                depth={depth + 1}
                                                prefix={`${stepLabel}.${String.fromCharCode(65 + oi)}`}
                                            />
                                        </div>
                                    );
                                })}

                                {step.decision.options.length < MAX_DECISION_OPTIONS && (
                                    <button type="button" onClick={() => addDecisionOption(i)} className="btn btn-sm" style={{ marginTop: "4px", background: "rgba(245, 158, 11, 0.1)", color: "#fbbf24", border: "1px solid rgba(245, 158, 11, 0.2)", fontSize: "12px", width: "100%" }}>
                                        + Add Branch ({step.decision.options.length}/{MAX_DECISION_OPTIONS})
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Notes */}
                        {step.notes !== undefined && step.notes !== null && (
                            <div style={{ marginTop: "8px" }}>
                                <textarea className="input-field" placeholder="Short note or clarification..." value={step.notes} onChange={(e) => updateStep(i, { notes: e.target.value })} rows={1} style={{ fontSize: "13px" }} />
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Add step button */}
            <button type="button" onClick={addStep} className="btn btn-secondary" style={{ width: "100%", borderStyle: "dashed", padding: depth > 0 ? "10px" : "14px", fontSize: depth > 0 ? "12px" : undefined }}>
                + Add Step{depth > 0 ? " to Branch" : ""}
            </button>
        </div>
    );
}
