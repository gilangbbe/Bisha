"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Concept, ConceptCategory, ConceptFormData, CATEGORY_LABELS } from "@/types";
import { getAllConcepts, createConcept, updateConcept } from "@/lib/concepts";

interface ConceptFormProps {
    existingConcept?: Concept;
}

const EMPTY_FORM: ConceptFormData = {
    title: "",
    category: ConceptCategory.PRODUCT,
    purpose: "",
    used_when: "",
    key_characteristics: [""],
    key_difference: "",
    exam_memory_hook: "",
    exam_trap_alert: null,
    confused_with: [],
};

export default function ConceptForm({ existingConcept }: ConceptFormProps) {
    const router = useRouter();
    const [form, setForm] = useState<ConceptFormData>(
        existingConcept
            ? {
                title: existingConcept.title,
                category: existingConcept.category,
                purpose: existingConcept.purpose,
                used_when: existingConcept.used_when,
                key_characteristics:
                    existingConcept.key_characteristics.length > 0
                        ? existingConcept.key_characteristics
                        : [""],
                key_difference: existingConcept.key_difference,
                exam_memory_hook: existingConcept.exam_memory_hook,
                exam_trap_alert: existingConcept.exam_trap_alert,
                confused_with: existingConcept.confused_with,
            }
            : EMPTY_FORM
    );
    const [allConcepts, setAllConcepts] = useState<Concept[]>([]);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [confusedSearch, setConfusedSearch] = useState("");
    const [showConfusedDropdown, setShowConfusedDropdown] = useState(false);

    useEffect(() => {
        getAllConcepts().then(setAllConcepts).catch(console.error);
    }, []);

    const validate = useCallback((): boolean => {
        const e: Record<string, string> = {};
        if (!form.title.trim()) e.title = "Title is required";
        if (!form.purpose.trim()) e.purpose = "Purpose is required";
        if (!form.key_difference.trim()) e.key_difference = "Key difference is required";
        if (!form.exam_memory_hook.trim()) e.exam_memory_hook = "Memory hook is required";
        setErrors(e);
        return Object.keys(e).length === 0;
    }, [form]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setSaving(true);
        try {
            const cleanForm = {
                ...form,
                key_characteristics: form.key_characteristics.filter((k) => k.trim()),
                exam_trap_alert: form.exam_trap_alert?.trim() || null,
            };

            if (existingConcept) {
                await updateConcept(existingConcept.id, cleanForm);
                router.push(`/concepts/${existingConcept.id}`);
            } else {
                const created = await createConcept(cleanForm);
                router.push(`/concepts/${created.id}`);
            }
        } catch (err) {
            console.error("Failed to save:", err);
        } finally {
            setSaving(false);
        }
    };

    const updateField = <K extends keyof ConceptFormData>(
        key: K,
        value: ConceptFormData[K]
    ) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
    };

    const addCharacteristic = () => {
        updateField("key_characteristics", [...form.key_characteristics, ""]);
    };

    const updateCharacteristic = (index: number, value: string) => {
        const updated = [...form.key_characteristics];
        updated[index] = value;
        updateField("key_characteristics", updated);
    };

    const removeCharacteristic = (index: number) => {
        const updated = form.key_characteristics.filter((_, i) => i !== index);
        updateField("key_characteristics", updated.length ? updated : [""]);
    };

    const toggleConfusedWith = (id: string) => {
        const updated = form.confused_with.includes(id)
            ? form.confused_with.filter((cid) => cid !== id)
            : [...form.confused_with, id];
        updateField("confused_with", updated);
    };

    const availableConcepts = allConcepts.filter(
        (c) =>
            c.id !== existingConcept?.id &&
            c.title.toLowerCase().includes(confusedSearch.toLowerCase())
    );

    const selectedConfusedConcepts = allConcepts.filter((c) =>
        form.confused_with.includes(c.id)
    );

    return (
        <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Title */}
                <div>
                    <label
                        style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#9595b0",
                            display: "block",
                            marginBottom: "6px",
                        }}
                    >
                        Title *
                    </label>
                    <textarea
                        className="input-field"
                        placeholder="e.g. Savings Account"
                        value={form.title}
                        onChange={(e) => updateField("title", e.target.value)}
                        rows={1}
                    />
                    {errors.title && (
                        <span style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px" }}>
                            {errors.title}
                        </span>
                    )}
                </div>

                {/* Category */}
                <div>
                    <label
                        style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#9595b0",
                            display: "block",
                            marginBottom: "8px",
                        }}
                    >
                        Category *
                    </label>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {Object.values(ConceptCategory).map((cat) => (
                            <button
                                type="button"
                                key={cat}
                                onClick={() => updateField("category", cat)}
                                className="btn btn-sm"
                                style={{
                                    background:
                                        form.category === cat
                                            ? "var(--color-accent)"
                                            : "var(--color-bg-input)",
                                    color:
                                        form.category === cat ? "white" : "var(--color-text-secondary)",
                                    border: `1px solid ${form.category === cat
                                            ? "var(--color-accent)"
                                            : "var(--color-border)"
                                        }`,
                                }}
                            >
                                {CATEGORY_LABELS[cat]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Purpose */}
                <div>
                    <label
                        style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#9595b0",
                            display: "block",
                            marginBottom: "6px",
                        }}
                    >
                        Purpose *
                        <span style={{ fontWeight: 400, color: "#5a5a78", marginLeft: "4px" }}>
                            — What is this concept for?
                        </span>
                    </label>
                    <textarea
                        className="input-field"
                        placeholder="A deposit account that earns interest..."
                        value={form.purpose}
                        onChange={(e) => updateField("purpose", e.target.value)}
                        rows={3}
                    />
                    {errors.purpose && (
                        <span style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px" }}>
                            {errors.purpose}
                        </span>
                    )}
                </div>

                {/* Used When */}
                <div>
                    <label
                        style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#9595b0",
                            display: "block",
                            marginBottom: "6px",
                        }}
                    >
                        Used When
                        <span style={{ fontWeight: 400, color: "#5a5a78", marginLeft: "4px" }}>
                            — When does this apply?
                        </span>
                    </label>
                    <textarea
                        className="input-field"
                        placeholder="When a customer wants to save money safely..."
                        value={form.used_when}
                        onChange={(e) => updateField("used_when", e.target.value)}
                        rows={2}
                    />
                </div>

                {/* Key Characteristics */}
                <div>
                    <label
                        style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#9595b0",
                            display: "block",
                            marginBottom: "6px",
                        }}
                    >
                        Key Characteristics
                        <span style={{ fontWeight: 400, color: "#5a5a78", marginLeft: "4px" }}>
                            — Add as many as needed
                        </span>
                    </label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {form.key_characteristics.map((char, i) => (
                            <div
                                key={i}
                                style={{ display: "flex", gap: "8px", alignItems: "center" }}
                            >
                                <textarea
                                    className="input-field"
                                    placeholder={`Characteristic ${i + 1}`}
                                    value={char}
                                    onChange={(e) => updateCharacteristic(i, e.target.value)}
                                    rows={1}
                                />
                                {form.key_characteristics.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeCharacteristic(i)}
                                        className="btn btn-ghost btn-sm"
                                        style={{ color: "#ef4444", flexShrink: 0 }}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addCharacteristic}
                            className="btn btn-secondary btn-sm"
                            style={{ alignSelf: "flex-start" }}
                        >
                            + Add characteristic
                        </button>
                    </div>
                </div>

                {/* Key Difference */}
                <div>
                    <label
                        style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#9595b0",
                            display: "block",
                            marginBottom: "6px",
                        }}
                    >
                        Key Difference *
                        <span style={{ fontWeight: 400, color: "#5a5a78", marginLeft: "4px" }}>
                            — What makes this unique?
                        </span>
                    </label>
                    <textarea
                        className="input-field"
                        placeholder="Unlike fixed deposits, this allows withdrawals..."
                        value={form.key_difference}
                        onChange={(e) => updateField("key_difference", e.target.value)}
                        rows={3}
                    />
                    {errors.key_difference && (
                        <span style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px" }}>
                            {errors.key_difference}
                        </span>
                    )}
                </div>

                {/* Exam Memory Hook */}
                <div>
                    <label
                        style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#9595b0",
                            display: "block",
                            marginBottom: "6px",
                        }}
                    >
                        💡 Exam Memory Hook *
                        <span style={{ fontWeight: 400, color: "#5a5a78", marginLeft: "4px" }}>
                            — Quick recall phrase
                        </span>
                    </label>
                    <textarea
                        className="input-field"
                        placeholder='Think: "Savings = Safety + Small returns"'
                        value={form.exam_memory_hook}
                        onChange={(e) => updateField("exam_memory_hook", e.target.value)}
                        rows={2}
                    />
                    {errors.exam_memory_hook && (
                        <span style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px" }}>
                            {errors.exam_memory_hook}
                        </span>
                    )}
                </div>

                {/* Exam Trap Alert */}
                <div>
                    <label
                        style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#f59e0b",
                            display: "block",
                            marginBottom: "6px",
                        }}
                    >
                        ⚠️ Exam Trap Alert
                        <span style={{ fontWeight: 400, color: "#5a5a78", marginLeft: "4px" }}>
                            — Common mistake in exams
                        </span>
                    </label>
                    <textarea
                        className="input-field"
                        placeholder="Don't confuse X with Y..."
                        value={form.exam_trap_alert || ""}
                        onChange={(e) =>
                            updateField("exam_trap_alert", e.target.value || null)
                        }
                        rows={2}
                    />
                </div>

                {/* Confused With */}
                <div>
                    <label
                        style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#9595b0",
                            display: "block",
                            marginBottom: "6px",
                        }}
                    >
                        Often Confused With
                        <span style={{ fontWeight: 400, color: "#5a5a78", marginLeft: "4px" }}>
                            — Link related concepts
                        </span>
                    </label>

                    {/* Selected chips */}
                    {selectedConfusedConcepts.length > 0 && (
                        <div
                            style={{
                                display: "flex",
                                gap: "6px",
                                flexWrap: "wrap",
                                marginBottom: "8px",
                            }}
                        >
                            {selectedConfusedConcepts.map((c) => (
                                <span
                                    key={c.id}
                                    className="chip"
                                    onClick={() => toggleConfusedWith(c.id)}
                                >
                                    {c.title}
                                    <span style={{ opacity: 0.6 }}>✕</span>
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Search dropdown */}
                    <div style={{ position: "relative" }}>
                        <input
                            className="input-field"
                            placeholder="Search concepts to link..."
                            value={confusedSearch}
                            onChange={(e) => {
                                setConfusedSearch(e.target.value);
                                setShowConfusedDropdown(true);
                            }}
                            onFocus={() => setShowConfusedDropdown(true)}
                            onBlur={() => setTimeout(() => setShowConfusedDropdown(false), 200)}
                        />
                        {showConfusedDropdown && availableConcepts.length > 0 && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: "100%",
                                    left: 0,
                                    right: 0,
                                    background: "var(--color-bg-secondary)",
                                    border: "1px solid var(--color-border)",
                                    borderRadius: "10px",
                                    marginTop: "4px",
                                    maxHeight: "200px",
                                    overflow: "auto",
                                    zIndex: 10,
                                }}
                            >
                                {availableConcepts.slice(0, 10).map((c) => (
                                    <div
                                        key={c.id}
                                        onClick={() => {
                                            toggleConfusedWith(c.id);
                                            setConfusedSearch("");
                                        }}
                                        style={{
                                            padding: "10px 14px",
                                            cursor: "pointer",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            borderBottom: "1px solid var(--color-border)",
                                            fontSize: "14px",
                                            color: form.confused_with.includes(c.id)
                                                ? "var(--color-accent)"
                                                : "var(--color-text-primary)",
                                        }}
                                    >
                                        <span>{c.title}</span>
                                        {form.confused_with.includes(c.id) && (
                                            <span style={{ color: "var(--color-accent)" }}>✓</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    className="btn btn-primary pulse-glow"
                    disabled={saving}
                    style={{
                        width: "100%",
                        padding: "14px",
                        fontSize: "16px",
                        marginTop: "8px",
                        opacity: saving ? 0.7 : 1,
                    }}
                >
                    {saving
                        ? "Saving..."
                        : existingConcept
                            ? "Update Concept"
                            : "Create Concept"}
                </button>
            </div>
        </form>
    );
}
