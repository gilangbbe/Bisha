"use client";

import { useState, useEffect } from "react";
import { Process, ProcessType, PROCESS_TYPE_LABELS } from "@/types";
import { getAllProcesses } from "@/lib/processes";
import ProcessCard from "@/components/ProcessCard";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProcessesPage() {
    const router = useRouter();
    const [processes, setProcesses] = useState<Process[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<ProcessType | "ALL">("ALL");
    const [selectMode, setSelectMode] = useState(false);
    const [selected, setSelected] = useState<string[]>([]);

    useEffect(() => {
        getAllProcesses()
            .then(setProcesses)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = processes.filter((p) => {
        const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
        const matchType = typeFilter === "ALL" || p.process_type === typeFilter;
        return matchSearch && matchType;
    });

    const toggleSelect = (id: string) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
        );
    };

    const handleCompare = () => {
        if (selected.length >= 2) {
            router.push(`/processes/compare?ids=${selected.join(",")}`);
        }
    };

    const types = ["ALL", ...Object.values(ProcessType)] as const;

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div style={{ padding: "24px 0 16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                    <h1 style={{ fontSize: "28px", fontWeight: 700, background: "linear-gradient(135deg, #f0f0f5, #3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "4px" }}>
                        Processes
                    </h1>
                    <p style={{ fontSize: "14px", color: "#9595b0" }}>
                        Banking workflows, visualized
                    </p>
                </div>
                <Link href="/processes/create" className="btn btn-primary btn-sm" style={{ textDecoration: "none", marginTop: "8px" }}>
                    + New
                </Link>
            </div>

            {/* Search */}
            <div style={{ marginBottom: "12px", position: "relative" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5a5a78" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}>
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input className="input-field" placeholder="Search processes..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: "40px" }} />
            </div>

            {/* Type filter */}
            <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "12px", scrollbarWidth: "none" }}>
                {types.map((t) => (
                    <button key={t} onClick={() => setTypeFilter(t)} className="btn btn-sm" style={{
                        background: typeFilter === t ? "var(--color-accent)" : "var(--color-bg-input)",
                        color: typeFilter === t ? "white" : "var(--color-text-secondary)",
                        border: `1px solid ${typeFilter === t ? "var(--color-accent)" : "var(--color-border)"}`,
                        flexShrink: 0,
                    }}>
                        {t === "ALL" ? "All" : PROCESS_TYPE_LABELS[t]}
                    </button>
                ))}
            </div>

            {/* Select mode */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "13px", color: "#5a5a78" }}>
                    {filtered.length} process{filtered.length !== 1 ? "es" : ""}
                </span>
                <button onClick={() => { setSelectMode(!selectMode); setSelected([]); }} className="btn btn-ghost btn-sm" style={{ color: selectMode ? "var(--color-accent)" : "var(--color-text-secondary)" }}>
                    {selectMode ? "Cancel" : "Select to Compare"}
                </button>
            </div>

            {/* Process list */}
            {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: "100px" }} />)}
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 16px", color: "#5a5a78" }}>
                    <p style={{ fontSize: "16px", marginBottom: "8px" }}>
                        {processes.length === 0 ? "No processes yet" : "No matches"}
                    </p>
                    <p style={{ fontSize: "13px" }}>
                        {processes.length === 0 ? 'Tap "+ New" to capture your first process' : "Try a different search or type"}
                    </p>
                </div>
            ) : (
                <div className="stagger-children" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {filtered.map((process) => (
                        <ProcessCard key={process.id} process={process} selectable={selectMode} selected={selected.includes(process.id)} onToggleSelect={toggleSelect} />
                    ))}
                </div>
            )}

            {/* Compare FAB */}
            {selectMode && selected.length >= 2 && (
                <button onClick={handleCompare} className="btn btn-primary pulse-glow" style={{ position: "fixed", bottom: "88px", left: "50%", transform: "translateX(-50%)", zIndex: 40, padding: "12px 28px", fontSize: "15px", borderRadius: "999px", boxShadow: "0 4px 24px rgba(99, 102, 241, 0.4)" }}>
                    Compare {selected.length} processes
                </button>
            )}
        </div>
    );
}
