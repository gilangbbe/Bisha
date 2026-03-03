"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProcessType, ProcessFormData, PROCESS_TYPE_LABELS, Step } from "@/types";
import { createProcess } from "@/lib/processes";
import StepEditor from "@/components/StepEditor";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";

export default function CreateProcessPage() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [processType, setProcessType] = useState<ProcessType>(ProcessType.LINEAR);
    const [trigger, setTrigger] = useState("");
    const [outcome, setOutcome] = useState("");
    const [steps, setSteps] = useState<Step[]>([
        { id: uuidv4(), order: 1, action: "" },
    ]);
    const [examTrapAlert, setExamTrapAlert] = useState("");
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = (): boolean => {
        const e: Record<string, string> = {};
        if (!title.trim()) e.title = "Title is required";
        const validSteps = steps.filter((s) => s.action.trim());
        if (validSteps.length === 0) e.steps = "At least one step is required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setSaving(true);
        try {
            const cleanSteps = steps
                .filter((s) => s.action.trim())
                .map((s, i) => ({ ...s, order: i + 1 }));

            const formData: ProcessFormData = {
                title,
                process_type: processType,
                trigger,
                outcome,
                steps: cleanSteps,
                exam_trap_alert: examTrapAlert.trim() || null,
                confused_with: [],
            };

            const created = await createProcess(formData);
            router.push(`/processes/${created.id}`);
        } catch (err) {
            console.error("Failed to save:", err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <div style={{ padding: "24px 0 20px" }}>
                <Link href="/processes" style={{ display: "flex", alignItems: "center", gap: "6px", color: "#9595b0", textDecoration: "none", fontSize: "14px", marginBottom: "12px" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                    Back
                </Link>
                <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "4px" }}>
                    Workshop Capture
                </h1>
                <p style={{ fontSize: "14px", color: "#9595b0" }}>
                    Record a process quickly — focus on steps, not formatting
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {/* Title */}
                    <div>
                        <label style={{ fontSize: "13px", fontWeight: 600, color: "#9595b0", display: "block", marginBottom: "6px" }}>
                            Process Title *
                        </label>
                        <textarea className="input-field" placeholder="e.g. Loan Approval Process" value={title} onChange={(e) => { setTitle(e.target.value); if (errors.title) setErrors((p) => ({ ...p, title: "" })); }} rows={1} />
                        {errors.title && <span style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px" }}>{errors.title}</span>}
                    </div>

                    {/* Process Type */}
                    <div>
                        <label style={{ fontSize: "13px", fontWeight: 600, color: "#9595b0", display: "block", marginBottom: "8px" }}>
                            Process Type
                        </label>
                        <div style={{ display: "flex", gap: "8px" }}>
                            {Object.values(ProcessType).map((t) => (
                                <button key={t} type="button" onClick={() => setProcessType(t)} className="btn btn-sm" style={{
                                    background: processType === t ? "var(--color-accent)" : "var(--color-bg-input)",
                                    color: processType === t ? "white" : "var(--color-text-secondary)",
                                    border: `1px solid ${processType === t ? "var(--color-accent)" : "var(--color-border)"}`,
                                }}>
                                    {PROCESS_TYPE_LABELS[t]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Trigger */}
                    <div>
                        <label style={{ fontSize: "13px", fontWeight: 600, color: "#9595b0", display: "block", marginBottom: "6px" }}>
                            Trigger
                            <span style={{ fontWeight: 400, color: "#5a5a78", marginLeft: "4px" }}>— What starts this process?</span>
                        </label>
                        <textarea className="input-field" placeholder="e.g. Customer submits loan application" value={trigger} onChange={(e) => setTrigger(e.target.value)} rows={2} />
                    </div>

                    {/* Outcome */}
                    <div>
                        <label style={{ fontSize: "13px", fontWeight: 600, color: "#9595b0", display: "block", marginBottom: "6px" }}>
                            Outcome
                            <span style={{ fontWeight: 400, color: "#5a5a78", marginLeft: "4px" }}>— What is the end result?</span>
                        </label>
                        <textarea className="input-field" placeholder="e.g. Loan approved and disbursed" value={outcome} onChange={(e) => setOutcome(e.target.value)} rows={2} />
                    </div>

                    {/* Steps */}
                    <div>
                        <label style={{ fontSize: "13px", fontWeight: 600, color: "#9595b0", display: "block", marginBottom: "8px" }}>
                            Steps *
                            <span style={{ fontWeight: 400, color: "#5a5a78", marginLeft: "4px" }}>— One action per step</span>
                        </label>
                        <StepEditor steps={steps} onChange={setSteps} />
                        {errors.steps && <span style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px", display: "block" }}>{errors.steps}</span>}
                    </div>

                    {/* Exam Trap Alert */}
                    <div>
                        <label style={{ fontSize: "13px", fontWeight: 600, color: "#f59e0b", display: "block", marginBottom: "6px" }}>
                            ⚠️ Exam Trap Alert
                            <span style={{ fontWeight: 400, color: "#5a5a78", marginLeft: "4px" }}>— Common mistake in exams</span>
                        </label>
                        <textarea className="input-field" placeholder="What do exams commonly trick you with?" value={examTrapAlert} onChange={(e) => setExamTrapAlert(e.target.value)} rows={2} />
                    </div>

                    {/* Submit */}
                    <button type="submit" className="btn btn-primary pulse-glow" disabled={saving} style={{ width: "100%", padding: "14px", fontSize: "16px", marginTop: "8px", opacity: saving ? 0.7 : 1 }}>
                        {saving ? "Saving..." : "Save Process"}
                    </button>
                </div>
            </form>
        </div>
    );
}
