"use client";

import { useState } from "react";
import { NoteBlock, BlockType, BlockMeta, BLOCK_TYPE_CONFIG, CALLOUT_STYLES, Concept, Process } from "@/types";
import { v4 as uuidv4 } from "uuid";

interface NoteBlockEditorProps {
    blocks: NoteBlock[];
    onChange: (blocks: NoteBlock[]) => void;
    concepts?: Concept[];
    processes?: Process[];
}

export default function NoteBlockEditor({ blocks, onChange, concepts = [], processes = [] }: NoteBlockEditorProps) {
    const [showTypePicker, setShowTypePicker] = useState(false);
    const [refSearch, setRefSearch] = useState("");
    const [refPickerFor, setRefPickerFor] = useState<string | null>(null);

    const addBlock = (type: BlockType) => {
        const meta: BlockMeta = {};
        if (type === "heading") meta.level = 2;
        if (type === "callout") meta.style = "info";
        if (type === "list") { meta.listStyle = "bullet"; meta.items = [""]; }

        const newBlock: NoteBlock = {
            id: uuidv4(),
            type,
            content: "",
            meta,
        };
        onChange([...blocks, newBlock]);
        setShowTypePicker(false);
    };

    const updateBlock = (id: string, updates: Partial<NoteBlock>) => {
        onChange(blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)));
    };

    const removeBlock = (id: string) => {
        onChange(blocks.filter((b) => b.id !== id));
    };

    const moveBlock = (index: number, direction: -1 | 1) => {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= blocks.length) return;
        const updated = [...blocks];
        [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
        onChange(updated);
    };

    const updateMeta = (id: string, metaUpdates: Partial<BlockMeta>) => {
        onChange(
            blocks.map((b) =>
                b.id === id ? { ...b, meta: { ...b.meta, ...metaUpdates } } : b
            )
        );
    };

    const addListItem = (id: string) => {
        const block = blocks.find((b) => b.id === id);
        if (!block) return;
        updateMeta(id, { items: [...(block.meta.items || []), ""] });
    };

    const updateListItem = (blockId: string, itemIndex: number, value: string) => {
        const block = blocks.find((b) => b.id === blockId);
        if (!block) return;
        const items = [...(block.meta.items || [])];
        items[itemIndex] = value;
        updateMeta(blockId, { items });
    };

    const removeListItem = (blockId: string, itemIndex: number) => {
        const block = blocks.find((b) => b.id === blockId);
        if (!block || (block.meta.items?.length || 0) <= 1) return;
        const items = (block.meta.items || []).filter((_, i) => i !== itemIndex);
        updateMeta(blockId, { items });
    };

    const selectReference = (blockId: string, refType: "concept" | "process", refId: string) => {
        updateMeta(blockId, { refType, refId });
        setRefPickerFor(null);
        setRefSearch("");
    };

    const renderBlockEditor = (block: NoteBlock, index: number) => {
        const blockTypes = Object.entries(BLOCK_TYPE_CONFIG) as [BlockType, typeof BLOCK_TYPE_CONFIG[BlockType]][];

        return (
            <div key={block.id} className="glass-card animate-fade-in" style={{ padding: "12px", marginBottom: "8px" }}>
                {/* Toolbar */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "12px", color: "#9595b0", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        {BLOCK_TYPE_CONFIG[block.type].icon} {BLOCK_TYPE_CONFIG[block.type].label}
                    </span>
                    <div style={{ flex: 1 }} />
                    <button
                        type="button"
                        onClick={() => moveBlock(index, -1)}
                        disabled={index === 0}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: "2px 6px", opacity: index === 0 ? 0.3 : 1, fontSize: "14px" }}
                    >
                        ↑
                    </button>
                    <button
                        type="button"
                        onClick={() => moveBlock(index, 1)}
                        disabled={index === blocks.length - 1}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: "2px 6px", opacity: index === blocks.length - 1 ? 0.3 : 1, fontSize: "14px" }}
                    >
                        ↓
                    </button>
                    <button
                        type="button"
                        onClick={() => removeBlock(block.id)}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: "2px 6px", color: "#ef4444", fontSize: "14px" }}
                    >
                        ×
                    </button>
                </div>

                {/* Type-specific content */}
                {block.type === "text" && (
                    <textarea
                        className="input-field"
                        rows={3}
                        placeholder="Write something..."
                        value={block.content}
                        onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                        style={{ resize: "vertical" }}
                    />
                )}

                {block.type === "heading" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <div style={{ display: "flex", gap: "6px" }}>
                            <button
                                type="button"
                                onClick={() => updateMeta(block.id, { level: 2 })}
                                className="btn btn-sm"
                                style={{
                                    background: block.meta.level === 2 ? "var(--color-accent)" : "var(--color-bg-input)",
                                    color: block.meta.level === 2 ? "white" : "var(--color-text-secondary)",
                                    border: `1px solid ${block.meta.level === 2 ? "var(--color-accent)" : "var(--color-border)"}`,
                                }}
                            >
                                H2
                            </button>
                            <button
                                type="button"
                                onClick={() => updateMeta(block.id, { level: 3 })}
                                className="btn btn-sm"
                                style={{
                                    background: block.meta.level === 3 ? "var(--color-accent)" : "var(--color-bg-input)",
                                    color: block.meta.level === 3 ? "white" : "var(--color-text-secondary)",
                                    border: `1px solid ${block.meta.level === 3 ? "var(--color-accent)" : "var(--color-border)"}`,
                                }}
                            >
                                H3
                            </button>
                        </div>
                        <textarea
                            className="input-field"
                            rows={1}
                            placeholder="Heading text..."
                            value={block.content}
                            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                        />
                    </div>
                )}

                {block.type === "callout" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            {(Object.entries(CALLOUT_STYLES) as [string, typeof CALLOUT_STYLES.info][]).map(([key, cfg]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => updateMeta(block.id, { style: key as BlockMeta["style"] })}
                                    className="btn btn-sm"
                                    style={{
                                        background: block.meta.style === key ? cfg.bg : "var(--color-bg-input)",
                                        color: block.meta.style === key ? cfg.color : "var(--color-text-secondary)",
                                        border: `1px solid ${block.meta.style === key ? cfg.border : "var(--color-border)"}`,
                                        fontSize: "12px",
                                    }}
                                >
                                    {cfg.icon} {cfg.label}
                                </button>
                            ))}
                        </div>
                        <textarea
                            className="input-field"
                            rows={2}
                            placeholder="Callout content..."
                            value={block.content}
                            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                            style={{ resize: "vertical" }}
                        />
                    </div>
                )}

                {block.type === "list" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <div style={{ display: "flex", gap: "6px" }}>
                            <button
                                type="button"
                                onClick={() => updateMeta(block.id, { listStyle: "bullet" })}
                                className="btn btn-sm"
                                style={{
                                    background: block.meta.listStyle === "bullet" ? "var(--color-accent)" : "var(--color-bg-input)",
                                    color: block.meta.listStyle === "bullet" ? "white" : "var(--color-text-secondary)",
                                    border: `1px solid ${block.meta.listStyle === "bullet" ? "var(--color-accent)" : "var(--color-border)"}`,
                                }}
                            >
                                • Bullet
                            </button>
                            <button
                                type="button"
                                onClick={() => updateMeta(block.id, { listStyle: "numbered" })}
                                className="btn btn-sm"
                                style={{
                                    background: block.meta.listStyle === "numbered" ? "var(--color-accent)" : "var(--color-bg-input)",
                                    color: block.meta.listStyle === "numbered" ? "white" : "var(--color-text-secondary)",
                                    border: `1px solid ${block.meta.listStyle === "numbered" ? "var(--color-accent)" : "var(--color-border)"}`,
                                }}
                            >
                                1. Numbered
                            </button>
                        </div>
                        {(block.meta.items || [""]).map((item, i) => (
                            <div key={i} style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                <span style={{ color: "#6366f1", fontSize: "14px", fontWeight: 600, width: "20px", textAlign: "center", flexShrink: 0 }}>
                                    {block.meta.listStyle === "numbered" ? `${i + 1}.` : "•"}
                                </span>
                                <textarea
                                    className="input-field"
                                    rows={1}
                                    placeholder={`Item ${i + 1}...`}
                                    value={item}
                                    onChange={(e) => updateListItem(block.id, i, e.target.value)}
                                    style={{ flex: 1 }}
                                />
                                {(block.meta.items?.length || 0) > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeListItem(block.id, i)}
                                        className="btn btn-ghost btn-sm"
                                        style={{ padding: "2px 6px", color: "#ef4444", fontSize: "14px", flexShrink: 0 }}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => addListItem(block.id)}
                            className="btn btn-ghost btn-sm"
                            style={{ alignSelf: "flex-start", fontSize: "12px", color: "var(--color-accent)" }}
                        >
                            + Add item
                        </button>
                    </div>
                )}

                {block.type === "divider" && (
                    <div style={{ borderTop: "1px solid var(--color-border)", margin: "4px 0" }} />
                )}

                {block.type === "reference" && (
                    <div>
                        {block.meta.refId ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <div style={{ flex: 1, padding: "8px 12px", background: "rgba(99, 102, 241, 0.08)", borderRadius: "8px", border: "1px solid rgba(99, 102, 241, 0.2)" }}>
                                    <span style={{ fontSize: "10px", color: "#6366f1", fontWeight: 600, textTransform: "uppercase" }}>
                                        {block.meta.refType === "concept" ? "📋 Concept" : "🔄 Process"}
                                    </span>
                                    <p style={{ fontSize: "14px", fontWeight: 500, marginTop: "2px" }}>
                                        {block.meta.refType === "concept"
                                            ? concepts.find((c) => c.id === block.meta.refId)?.title || "Unknown concept"
                                            : processes.find((p) => p.id === block.meta.refId)?.title || "Unknown process"}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => { setRefPickerFor(block.id); setRefSearch(""); }}
                                    className="btn btn-ghost btn-sm"
                                    style={{ fontSize: "12px", color: "var(--color-accent)", flexShrink: 0 }}
                                >
                                    Change
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => { setRefPickerFor(block.id); setRefSearch(""); }}
                                className="btn btn-secondary btn-sm"
                                style={{ fontSize: "13px" }}
                            >
                                🔗 Select a concept or process...
                            </button>
                        )}

                        {/* Reference picker */}
                        {refPickerFor === block.id && (
                            <div className="animate-slide-up" style={{ marginTop: "8px", padding: "8px", background: "var(--color-bg-card)", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
                                <input
                                    className="input-field"
                                    placeholder="Search..."
                                    value={refSearch}
                                    onChange={(e) => setRefSearch(e.target.value)}
                                    autoFocus
                                    style={{ marginBottom: "6px", fontSize: "13px" }}
                                />
                                <div style={{ maxHeight: "180px", overflow: "auto" }}>
                                    {concepts.filter((c) => c.title.toLowerCase().includes(refSearch.toLowerCase())).slice(0, 5).map((c) => (
                                        <div
                                            key={c.id}
                                            onClick={() => selectReference(block.id, "concept", c.id)}
                                            style={{ padding: "8px", cursor: "pointer", borderBottom: "1px solid var(--color-border)", fontSize: "13px", display: "flex", gap: "6px", alignItems: "center" }}
                                        >
                                            <span style={{ color: "#6366f1", fontSize: "11px" }}>📋</span>
                                            {c.title}
                                        </div>
                                    ))}
                                    {processes.filter((p) => p.title.toLowerCase().includes(refSearch.toLowerCase())).slice(0, 5).map((p) => (
                                        <div
                                            key={p.id}
                                            onClick={() => selectReference(block.id, "process", p.id)}
                                            style={{ padding: "8px", cursor: "pointer", borderBottom: "1px solid var(--color-border)", fontSize: "13px", display: "flex", gap: "6px", alignItems: "center" }}
                                        >
                                            <span style={{ color: "#f59e0b", fontSize: "11px" }}>🔄</span>
                                            {p.title}
                                        </div>
                                    ))}
                                    {concepts.filter((c) => c.title.toLowerCase().includes(refSearch.toLowerCase())).length === 0 &&
                                     processes.filter((p) => p.title.toLowerCase().includes(refSearch.toLowerCase())).length === 0 && (
                                        <p style={{ padding: "12px", color: "#5a5a78", fontSize: "13px", textAlign: "center" }}>No items found</p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setRefPickerFor(null)}
                                    className="btn btn-ghost btn-sm"
                                    style={{ marginTop: "4px", fontSize: "12px", color: "#9595b0" }}
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {block.type === "code" && (
                    <textarea
                        className="input-field"
                        rows={3}
                        placeholder="Code, formula, or technical text..."
                        value={block.content}
                        onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                        style={{ fontFamily: "monospace", fontSize: "13px", resize: "vertical" }}
                    />
                )}
            </div>
        );
    };

    return (
        <div>
            {blocks.map((block, index) => renderBlockEditor(block, index))}

            {/* Add block button */}
            {showTypePicker ? (
                <div className="glass-card animate-slide-up" style={{ padding: "8px" }}>
                    <p style={{ fontSize: "12px", color: "#9595b0", fontWeight: 600, padding: "4px 8px", marginBottom: "4px" }}>
                        Choose block type
                    </p>
                    {(Object.entries(BLOCK_TYPE_CONFIG) as [BlockType, typeof BLOCK_TYPE_CONFIG[BlockType]][]).map(([type, cfg]) => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => addBlock(type)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                width: "100%",
                                padding: "10px 12px",
                                background: "transparent",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                                color: "var(--color-text-primary)",
                                fontSize: "14px",
                                textAlign: "left",
                                transition: "background 0.15s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                            <span style={{ fontSize: "16px", width: "24px", textAlign: "center" }}>{cfg.icon}</span>
                            <div>
                                <div style={{ fontWeight: 500 }}>{cfg.label}</div>
                                <div style={{ fontSize: "12px", color: "#5a5a78" }}>{cfg.description}</div>
                            </div>
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={() => setShowTypePicker(false)}
                        className="btn btn-ghost btn-sm"
                        style={{ width: "100%", marginTop: "4px", fontSize: "12px", color: "#9595b0" }}
                    >
                        Cancel
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => setShowTypePicker(true)}
                    className="btn btn-secondary"
                    style={{ width: "100%", padding: "12px", fontSize: "14px", borderStyle: "dashed" }}
                >
                    + Add Block
                </button>
            )}
        </div>
    );
}
