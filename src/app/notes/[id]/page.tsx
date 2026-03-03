"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Note, NOTE_CATEGORY_LABELS, NOTE_CATEGORY_COLORS, NoteCategory, Concept, Process } from "@/types";
import { getNoteById, deleteNote } from "@/lib/notes";
import { getAllConcepts } from "@/lib/concepts";
import { getAllProcesses } from "@/lib/processes";
import NoteBlockView from "@/components/NoteBlockView";
import Link from "next/link";

export default function NoteDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const [note, setNote] = useState<Note | null>(null);
    const [concepts, setConcepts] = useState<Concept[]>([]);
    const [processes, setProcesses] = useState<Process[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const [n, c, p] = await Promise.all([
                    getNoteById(id),
                    getAllConcepts(),
                    getAllProcesses(),
                ]);
                setNote(n);
                setConcepts(c);
                setProcesses(p);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id]);

    const handleDelete = async () => {
        if (!note) return;
        setDeleting(true);
        try {
            await deleteNote(note.id);
            router.push("/notes");
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
                <div className="skeleton" style={{ height: "120px", marginBottom: "16px" }} />
                <div className="skeleton" style={{ height: "80px" }} />
            </div>
        );
    }

    if (!note) {
        return (
            <div style={{ padding: "48px 0", textAlign: "center", color: "#5a5a78" }}>
                <p style={{ fontSize: "16px", marginBottom: "8px" }}>Note not found</p>
                <Link href="/notes" className="btn btn-secondary" style={{ textDecoration: "none" }}>
                    Back to Notes
                </Link>
            </div>
        );
    }

    const categoryColor = NOTE_CATEGORY_COLORS[note.category as NoteCategory] || "#8b5cf6";

    return (
        <div className="animate-fade-in">
            {/* Back + Actions */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "20px 0 12px",
                }}
            >
                <Link
                    href="/notes"
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
                    Back
                </Link>
                <div style={{ display: "flex", gap: "8px" }}>
                    <Link
                        href={`/notes/${note.id}/edit`}
                        className="btn btn-secondary btn-sm"
                        style={{ textDecoration: "none" }}
                    >
                        Edit
                    </Link>
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="btn btn-danger btn-sm"
                    >
                        Delete
                    </button>
                </div>
            </div>

            {/* Title + Category */}
            <div style={{ marginBottom: "20px" }}>
                <span
                    className="category-badge"
                    style={{
                        background: `${categoryColor}20`,
                        color: categoryColor,
                        fontSize: "12px",
                        padding: "4px 14px",
                    }}
                >
                    {NOTE_CATEGORY_LABELS[note.category as NoteCategory] || note.category}
                </span>
                <h1
                    style={{
                        fontSize: "26px",
                        fontWeight: 700,
                        marginTop: "10px",
                        lineHeight: 1.3,
                    }}
                >
                    {note.title}
                </h1>
            </div>

            {/* Tags */}
            {note.tags && note.tags.length > 0 && (
                <div style={{ display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap" }}>
                    {note.tags.map((tag) => (
                        <span
                            key={tag}
                            style={{
                                fontSize: "12px",
                                color: "#6366f1",
                                background: "rgba(99, 102, 241, 0.1)",
                                padding: "3px 10px",
                                borderRadius: "6px",
                            }}
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Content blocks */}
            <div className="glass-card" style={{ padding: "16px", marginBottom: "20px" }}>
                <NoteBlockView
                    blocks={note.blocks}
                    concepts={concepts}
                    processes={processes}
                />
            </div>

            {/* Timestamps */}
            <div style={{ padding: "12px 0 20px", fontSize: "12px", color: "#5a5a78" }}>
                <p>Created: {new Date(note.created_at).toLocaleDateString()}</p>
                <p>Updated: {new Date(note.updated_at).toLocaleDateString()}</p>
            </div>

            {/* Delete confirmation */}
            {showDeleteConfirm && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0,0,0,0.6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000,
                        padding: "20px",
                    }}
                >
                    <div
                        className="glass-card animate-slide-up"
                        style={{
                            padding: "24px",
                            maxWidth: "320px",
                            width: "100%",
                            textAlign: "center",
                        }}
                    >
                        <p style={{ fontSize: "16px", fontWeight: 600, marginBottom: "8px" }}>
                            Delete this note?
                        </p>
                        <p style={{ fontSize: "13px", color: "#9595b0", marginBottom: "20px" }}>
                            This cannot be undone.
                        </p>
                        <div style={{ display: "flex", gap: "8px" }}>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="btn btn-secondary"
                                style={{ flex: 1 }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="btn btn-danger"
                                style={{ flex: 1 }}
                                disabled={deleting}
                            >
                                {deleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
