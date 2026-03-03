"use client";

import { useState, useEffect } from "react";
import { NoteCategory, NOTE_CATEGORY_LABELS, NoteBlock, NoteFormData, Concept, Process, Note } from "@/types";
import { createNote, getAllNotes } from "@/lib/notes";
import { getAllConcepts } from "@/lib/concepts";
import { getAllProcesses } from "@/lib/processes";
import NoteBlockEditor from "@/components/NoteBlockEditor";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export default function CreateNotePage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [concepts, setConcepts] = useState<Concept[]>([]);
    const [processes, setProcesses] = useState<Process[]>([]);
    const [allNotes, setAllNotes] = useState<Note[]>([]);

    const [title, setTitle] = useState("");
    const [category, setCategory] = useState<NoteCategory>(NoteCategory.GENERAL);
    const [tagsInput, setTagsInput] = useState("");
    const [blocks, setBlocks] = useState<NoteBlock[]>([
        { id: uuidv4(), type: "text", content: "", meta: {} },
    ]);

    useEffect(() => {
        getAllConcepts().then(setConcepts).catch(console.error);
        getAllProcesses().then(setProcesses).catch(console.error);
        getAllNotes().then(setAllNotes).catch(console.error);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setSaving(true);
        try {
            const tags = tagsInput
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean);

            // Filter out empty blocks
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

            const created = await createNote(formData);
            router.push(`/notes/${created.id}`);
        } catch (err) {
            console.error("Failed to create note:", err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <div style={{ padding: "24px 0 20px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "4px" }}>
                    New Note
                </h1>
                <p style={{ fontSize: "14px", color: "#9595b0" }}>
                    Create a block-based note with rich content
                </p>
            </div>

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
                    {saving ? "Saving..." : "Create Note"}
                </button>
            </form>
        </div>
    );
}
