"use client";

import { tutorialTracks } from "@/lib/tutorials";
import Link from "next/link";

export default function LearnPage() {
    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div style={{ padding: "24px 0 16px" }}>
                <h1
                    style={{
                        fontSize: "28px",
                        fontWeight: 700,
                        background: "linear-gradient(135deg, #f0f0f5, #818cf8)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        marginBottom: "4px",
                    }}
                >
                    Learn
                </h1>
                <p style={{ fontSize: "14px", color: "#9595b0" }}>
                    Learn how to think with this app — not just use it
                </p>
            </div>

            {/* Philosophy banner */}
            <div
                className="glass-card"
                style={{
                    padding: "16px",
                    marginBottom: "20px",
                    borderColor: "rgba(99, 102, 241, 0.2)",
                    background: "linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.05))",
                }}
            >
                <p
                    style={{
                        fontSize: "14px",
                        lineHeight: 1.6,
                        color: "#c0c0d0",
                    }}
                >
                    Every tutorial uses <strong style={{ color: "#818cf8" }}>contrast</strong> to teach.
                    You&apos;ll see bad examples next to good ones — because that&apos;s exactly how exams test you.
                </p>
            </div>

            {/* Track cards */}
            <div
                className="stagger-children"
                style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
                {tutorialTracks.map((track, i) => (
                    <Link
                        key={track.id}
                        href={`/learn/${track.id}`}
                        style={{ textDecoration: "none", display: "block" }}
                    >
                        <div
                            className="glass-card"
                            style={{
                                padding: "18px",
                                display: "flex",
                                gap: "14px",
                                alignItems: "flex-start",
                                cursor: "pointer",
                            }}
                        >
                            <span
                                style={{
                                    fontSize: "28px",
                                    flexShrink: 0,
                                    width: "44px",
                                    height: "44px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    background: "rgba(99, 102, 241, 0.1)",
                                    borderRadius: "12px",
                                }}
                            >
                                {track.icon}
                            </span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        marginBottom: "4px",
                                    }}
                                >
                                    <h3
                                        style={{
                                            fontSize: "16px",
                                            fontWeight: 600,
                                            color: "#f0f0f5",
                                            lineHeight: 1.3,
                                        }}
                                    >
                                        {track.title}
                                    </h3>
                                    {i === 0 && (
                                        <span
                                            className="category-badge"
                                            style={{
                                                background: "rgba(99, 102, 241, 0.15)",
                                                color: "#818cf8",
                                                fontSize: "10px",
                                                padding: "2px 8px",
                                            }}
                                        >
                                            START HERE
                                        </span>
                                    )}
                                </div>
                                <p
                                    style={{
                                        fontSize: "13px",
                                        color: "#9595b0",
                                        lineHeight: 1.5,
                                    }}
                                >
                                    {track.description}
                                </p>
                                <span
                                    style={{
                                        fontSize: "12px",
                                        color: "#5a5a78",
                                        marginTop: "6px",
                                        display: "inline-block",
                                    }}
                                >
                                    {track.cards.length} cards · ~{track.cards.length * 30}s
                                </span>
                            </div>
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#5a5a78"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{ flexShrink: 0, marginTop: "14px" }}
                            >
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Help prompt */}
            <div
                style={{
                    textAlign: "center",
                    padding: "32px 16px",
                    color: "#5a5a78",
                    fontSize: "13px",
                }}
            >
                <p>Each tutorial takes under 2 minutes.</p>
                <p style={{ marginTop: "4px" }}>
                    Start with <strong style={{ color: "#9595b0" }}>&quot;How to Use This App&quot;</strong> if it&apos;s your first time.
                </p>
            </div>
        </div>
    );
}
