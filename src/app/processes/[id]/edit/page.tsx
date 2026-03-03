"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Process, ProcessType, PROCESS_TYPE_LABELS, Step } from "@/types";
import { getProcessById, updateProcess } from "@/lib/processes";
import StepEditor from "@/components/StepEditor";
import Link from "next/link";

export default function EditProcessPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const [process, setProcess] = useState<Process | null>(null);
    const [loading, setLoading] = useState(true);

    // Form state
    const [title, setTitle] = useState("");
    const [processType, setProcessType] = useState<ProcessType>(ProcessType.LINEAR);
    const [trigger, setTrigger] = useState("");
    const [outcome, setOutcome] = useState("");
    const [steps, setSteps] = useState<Step[]>([]);
    const [examTrapAlert, setExamTrapAlert] = useState("");
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        getProcessById(id)
            .then((p) => {
                if (p) {
                    setProcess(p);
                    setTitle(p.title);
                    setProcessType(p.process_type);
                    setTrigger(p.trigger);
                    setOutcome(p.outcome);
                    setSteps(p.steps);
                    setExamTrapAlert(p.exam_trap_alert || "");
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

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
        if (!validate() || !process) return;

        setSaving(true);
        try {
            const cleanSteps = steps.filter((s) => s.action.trim()).map((s, i) => ({ ...s, order: i + 1 }));
            await updateProcess(process.id, {
                title, process_type: processType, trigger, outcome,
                steps: cleanSteps,
                exam_trap_alert: examTrapAlert.trim() || null,
            });
            router.push(`/processes/${process.id}`);
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: "24px 0" }}>
                <div className="skeleton" style={{ height: "32px", width: "60%", marginBottom: "24px" }} />
                {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: "60px", marginBottom: "16px" }} />)}
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
            <div style={{ padding: "24px 0 20px" }}>
                <Link href={`/processes/${process.id}`} style={{ display: "flex", alignItems: "center", gap: "6px", color: "#9595b0", textDecoration: "none", fontSize: "14px", marginBottom: "12px" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                    Back
                </Link>
                <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "4px" }}>Edit Process</h1>
                <p style={{ fontSize: "14px", color: "#9595b0" }}>Update &quot;{process.title}&quot;</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div>
                        <label style={{ fontSize: "13px", fontWeight: 600, color: "#9595b0", display: "block", marginBottom: "6px" }}>Process Title *</label>
                        <textarea className="input-field" value={title} onChange={(e) => { setTitle(e.target.value); if (errors.title) setErrors((p) => ({ ...p, title: "" })); }} rows={1} />
                        {errors.title && <span style={{ fontSize: "12px", color: "#ef4444" }}>{errors.title}</span>}
                    </div>

                    <div>
                        <label style={{ fontSize: "13px", fontWeight: 600, color: "#9595b0", display: "block", marginBottom: "8px" }}>Process Type</label>
                        <div style={{ display: "flex", gap: "8px" }}>
                            {Object.values(ProcessType).map((t) => (
                                <button key={t} type="button" onClick={() => setProcessType(t)} className="btn btn-sm" style={{
                                    background: processType === t ? "var(--color-accent)" : "var(--color-bg-input)",
                                    color: processType === t ? "white" : "var(--color-text-secondary)",
                                    border: `1px solid ${processType === t ? "var(--color-accent)" : "var(--color-border)"}`,
                                }}>{PROCESS_TYPE_LABELS[t]}</button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: "13px", fontWeight: 600, color: "#9595b0", display: "block", marginBottom: "6px" }}>Trigger</label>
                        <textarea className="input-field" value={trigger} onChange={(e) => setTrigger(e.target.value)} rows={2} />
                    </div>

                    <div>
                        <label style={{ fontSize: "13px", fontWeight: 600, color: "#9595b0", display: "block", marginBottom: "6px" }}>Outcome</label>
                        <textarea className="input-field" value={outcome} onChange={(e) => setOutcome(e.target.value)} rows={2} />
                    </div>

                    <div>
                        <label style={{ fontSize: "13px", fontWeight: 600, color: "#9595b0", display: "block", marginBottom: "8px" }}>Steps *</label>
                        <StepEditor steps={steps} onChange={setSteps} />
                        {errors.steps && <span style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px", display: "block" }}>{errors.steps}</span>}
                    </div>

                    <div>
                        <label style={{ fontSize: "13px", fontWeight: 600, color: "#f59e0b", display: "block", marginBottom: "6px" }}>⚠️ Exam Trap Alert</label>
                        <textarea className="input-field" value={examTrapAlert} onChange={(e) => setExamTrapAlert(e.target.value)} rows={2} />
                    </div>

                    <button type="submit" className="btn btn-primary pulse-glow" disabled={saving} style={{ width: "100%", padding: "14px", fontSize: "16px", marginTop: "8px", opacity: saving ? 0.7 : 1 }}>
                        {saving ? "Saving..." : "Update Process"}
                    </button>
                </div>
            </form>
        </div>
    );
}
