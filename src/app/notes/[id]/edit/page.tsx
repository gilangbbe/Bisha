"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Note, NoteCategory, NOTE_CATEGORY_LABELS, NoteBlock, NoteFormData, Concept, Process } from "@/types";
import { getNoteById, updateNote, getAllNotes } from "@/lib/notes";
import { getAllConcepts } from "@/lib/concepts";
import { getAllProcesses } from "@/lib/processes";
import NoteBlockEditor from "@/components/NoteBlockEditor";
import Link from "next/link";

export default function EditNotePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [concepts, setConcepts] = useState<Concept[]>([]);
    const [processes, setProcesses] = useState<Process[]>([]);
    const [allNotes, setAllNotes] = useState<Note[]>([]);

    const [title, setTitle] = useState("");
    const [category, setCategory] = useState<NoteCategory>(NoteCategory.GENERAL);
    const [tagsInput, setTagsInput] = useState("");
    const [blocks, setBlocks] = useState<NoteBlock[]>([]);

    useEffect(() => {
        async function load() {
            try {
                const [note, c, p, n] = await Promise.all([
                    getNoteById(id),
                    getAllConcepts(),
                    getAllProcesses(),
                    getAllNotes(),
                ]);
                if (note) {
                    setTitle(note.title);
                    setCategory(note.category as NoteCategory);
                    setTagsInput((note.tags || []).join(", "));
                    setBlocks(note.blocks || []);
                }
                setConcepts(c);
                setProcesses(p);
                // Exclude current note from reference picker
                setAllNotes(n.filter((item) => item.id !== id));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setSaving(true);
        try {
            const tags = tagsInput
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean);

            const cleanBlocks = blocks.filter((b) => {
                if (b.type === "divider") return true;
                if (b.type === "list") return (b.meta.items || []).some((item) => item.trim());
                if (b.type === "reference") return !!b.meta.refId;
                return b.content.trim() !== "";
            });

            const formData: NoteFormData = {
                title: title.trim(),
                blocks: cleanBlocks,
                category,
                tags,
            };

            await updateNote(id, formData);
            router.push(`/notes/${id}`);
        } catch (err) {
            console.error("Failed to update note:", err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: "24px 0" }}>
                <div className="skeleton" style={{ height: "24px", width: "120px", marginBottom: "16px" }} />
                <div className="skeleton" style={{ height: "48px", marginBottom: "16px" }} />
                <div className="skeleton" style={{ height: "120px", marginBottom: "16px" }} />
                <div className="skeleton" style={{ height: "200px" }} />
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "20px 0 12px",
                }}
            >
                <Link
                    href={`/notes/${id}`}
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
                    Cancel
                </Link>
            </div>

            <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "20px" }}>
                Edit Note
            </h1>

            <form onSubmit={handleSubmit}>
                {/* Title */}
                <div style={{ marginBottom: "16px" }}>
                    <label style={{ fontSize: "13px", fontWeight: 600, color: "#9595b0", display: "block", marginBottom: "6px" }}>
                        Title *
                    </label>
                    <input
                        className="input-field"
                        placeholder="Note title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                {/* Category */}
                <div style={{ marginBottom: "16px" }}>
                    <label style={{ fontSize: "13px", fontWeight: 600, color: "#9595b0", display: "block", marginBottom: "6px" }}>
                        Category
                    </label>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {Object.values(NoteCategory).map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setCategory(cat)}
                                className="btn btn-sm"
                                style={{
                                    background: category === cat ? "var(--color-accent)" : "var(--color-bg-input)",
                                    color: category === cat ? "white" : "var(--color-text-secondary)",
                                    border: `1px solid ${category === cat ? "var(--color-accent)" : "var(--color-border)"}`,
                                }}
                            >
                                {NOTE_CATEGORY_LABELS[cat]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tags */}
                <div style={{ marginBottom: "16px" }}>
                    <label style={{ fontSize: "13px", fontWeight: 600, color: "#9595b0", display: "block", marginBottom: "6px" }}>
                        Tags
                    </label>
                    <input
                        className="input-field"
                        placeholder="Comma-separated tags (e.g. exam, chapter3, risk)"
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                    />
                </div>

                {/* Block editor */}
                <div style={{ marginBottom: "20px" }}>
                    <label style={{ fontSize: "13px", fontWeight: 600, color: "#9595b0", display: "block", marginBottom: "8px" }}>
                        Content Blocks
                    </label>
                    <NoteBlockEditor
                        blocks={blocks}
                        onChange={setBlocks}
                        concepts={concepts}
                        processes={processes}
                        notes={allNotes}
                    />
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving || !title.trim()}
                    style={{
                        width: "100%",
                        padding: "14px",
                        fontSize: "15px",
                        fontWeight: 600,
                        marginBottom: "20px",
                    }}
                >
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </form>
        </div>
    );
}
