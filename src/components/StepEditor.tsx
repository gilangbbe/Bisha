"use client";

import { Step } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { useCallback } from "react";

interface StepEditorProps {
    steps: Step[];
    onChange: (steps: Step[]) => void;
}

export default function StepEditor({ steps, onChange }: StepEditorProps) {
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
            const updated = steps.map((s, i) => (i === index ? { ...s, ...updates } : s));
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
            [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
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
                        optionA: { label: "Yes", nextStepId: "" },
                        optionB: { label: "No", nextStepId: "" },
                    },
                });
            }
        },
        [steps, updateStep]
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {steps.map((step, i) => (
                <div
                    key={step.id}
                    className="glass-card"
                    style={{
                        padding: "14px",
                        borderColor: step.decision ? "rgba(245, 158, 11, 0.3)" : undefined,
                    }}
                >
                    {/* Step header */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "10px",
                        }}
                    >
                        <span
                            style={{
                                width: "24px",
                                height: "24px",
                                borderRadius: "50%",
                                background: step.decision ? "#f59e0b" : "#6366f1",
                                color: "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "12px",
                                fontWeight: 700,
                                flexShrink: 0,
                            }}
                        >
                            {i + 1}
                        </span>
                        <span
                            style={{
                                flex: 1,
                                fontSize: "12px",
                                color: "#5a5a78",
                                fontWeight: 600,
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                            }}
                        >
                            Step {i + 1}
                            {step.decision && " · Decision"}
                        </span>
                        {/* Move buttons */}
                        <button
                            type="button"
                            onClick={() => moveStep(i, "up")}
                            className="btn btn-ghost btn-sm"
                            style={{ padding: "4px", opacity: i === 0 ? 0.3 : 1 }}
                            disabled={i === 0}
                        >
                            ↑
                        </button>
                        <button
                            type="button"
                            onClick={() => moveStep(i, "down")}
                            className="btn btn-ghost btn-sm"
                            style={{ padding: "4px", opacity: i === steps.length - 1 ? 0.3 : 1 }}
                            disabled={i === steps.length - 1}
                        >
                            ↓
                        </button>
                        <button
                            type="button"
                            onClick={() => removeStep(i)}
                            className="btn btn-ghost btn-sm"
                            style={{ padding: "4px", color: "#ef4444" }}
                        >
                            ✕
                        </button>
                    </div>

                    {/* Action */}
                    <input
                        className="input-field"
                        placeholder="What happens in this step? (one sentence)"
                        value={step.action}
                        onChange={(e) => updateStep(i, { action: e.target.value })}
                        maxLength={150}
                        style={{ marginBottom: "8px" }}
                    />

                    {/* Actor */}
                    <input
                        className="input-field"
                        placeholder="Who does it? (optional)"
                        value={step.actor || ""}
                        onChange={(e) => updateStep(i, { actor: e.target.value || undefined })}
                        maxLength={50}
                        style={{ marginBottom: "8px", fontSize: "13px" }}
                    />

                    {/* Decision toggle */}
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <button
                            type="button"
                            onClick={() => toggleDecision(i)}
                            className="btn btn-sm"
                            style={{
                                background: step.decision
                                    ? "rgba(245, 158, 11, 0.15)"
                                    : "var(--color-bg-input)",
                                color: step.decision ? "#fbbf24" : "#5a5a78",
                                border: `1px solid ${step.decision ? "rgba(245, 158, 11, 0.3)" : "var(--color-border)"}`,
                                fontSize: "12px",
                            }}
                        >
                            ◇ {step.decision ? "Remove Decision" : "Add Decision"}
                        </button>
                        {!step.notes && !step.decision && (
                            <button
                                type="button"
                                onClick={() => updateStep(i, { notes: "" })}
                                className="btn btn-sm"
                                style={{
                                    background: "var(--color-bg-input)",
                                    color: "#5a5a78",
                                    border: "1px solid var(--color-border)",
                                    fontSize: "12px",
                                }}
                            >
                                + Notes
                            </button>
                        )}
                    </div>

                    {/* Decision fields */}
                    {step.decision && (
                        <div
                            style={{
                                marginTop: "10px",
                                padding: "10px",
                                background: "rgba(245, 158, 11, 0.05)",
                                borderRadius: "8px",
                                border: "1px solid rgba(245, 158, 11, 0.15)",
                            }}
                        >
                            <input
                                className="input-field"
                                placeholder="Decision question (e.g., 'Is score above threshold?')"
                                value={step.decision.question}
                                onChange={(e) =>
                                    updateStep(i, {
                                        decision: { ...step.decision!, question: e.target.value },
                                    })
                                }
                                maxLength={120}
                                style={{ marginBottom: "8px", fontSize: "13px" }}
                            />
                            <div style={{ display: "flex", gap: "8px" }}>
                                <input
                                    className="input-field"
                                    placeholder="Option A (e.g., Yes)"
                                    value={step.decision.optionA.label}
                                    onChange={(e) =>
                                        updateStep(i, {
                                            decision: {
                                                ...step.decision!,
                                                optionA: { ...step.decision!.optionA, label: e.target.value },
                                            },
                                        })
                                    }
                                    maxLength={30}
                                    style={{ flex: 1, fontSize: "13px" }}
                                />
                                <input
                                    className="input-field"
                                    placeholder="Option B (e.g., No)"
                                    value={step.decision.optionB.label}
                                    onChange={(e) =>
                                        updateStep(i, {
                                            decision: {
                                                ...step.decision!,
                                                optionB: { ...step.decision!.optionB, label: e.target.value },
                                            },
                                        })
                                    }
                                    maxLength={30}
                                    style={{ flex: 1, fontSize: "13px" }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    {step.notes !== undefined && step.notes !== null && (
                        <div style={{ marginTop: "8px" }}>
                            <input
                                className="input-field"
                                placeholder="Short note or clarification..."
                                value={step.notes}
                                onChange={(e) => updateStep(i, { notes: e.target.value })}
                                maxLength={120}
                                style={{ fontSize: "13px" }}
                            />
                        </div>
                    )}
                </div>
            ))}

            {/* Add step button */}
            <button
                type="button"
                onClick={addStep}
                className="btn btn-secondary"
                style={{
                    width: "100%",
                    borderStyle: "dashed",
                    padding: "14px",
                }}
            >
                + Add Step
            </button>
        </div>
    );
}
