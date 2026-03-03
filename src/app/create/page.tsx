"use client";

import Link from "next/link";

export default function CreatePage() {
    const options = [
        {
            href: "/notes/create",
            icon: "📝",
            title: "New Note",
            description: "Block-based note with rich content types",
            color: "#6366f1",
        },
        {
            href: "/create/concept",
            icon: "📋",
            title: "New Concept",
            description: "Structured banking concept with template fields",
            color: "#818cf8",
        },
        {
            href: "/processes/create",
            icon: "🔄",
            title: "New Process",
            description: "Step-by-step process with branching support",
            color: "#f59e0b",
        },
    ];

    return (
        <div className="animate-fade-in">
            <div style={{ padding: "24px 0 20px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "4px" }}>
                    Create
                </h1>
                <p style={{ fontSize: "14px", color: "#9595b0" }}>
                    What would you like to create?
                </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {options.map((opt) => (
                    <Link key={opt.href} href={opt.href} style={{ textDecoration: "none" }}>
                        <div
                            className="glass-card"
                            style={{
                                padding: "20px",
                                display: "flex",
                                alignItems: "center",
                                gap: "16px",
                                cursor: "pointer",
                            }}
                        >
                            <span style={{ fontSize: "28px" }}>{opt.icon}</span>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#f0f0f5", marginBottom: "2px" }}>
                                    {opt.title}
                                </h3>
                                <p style={{ fontSize: "13px", color: "#9595b0" }}>
                                    {opt.description}
                                </p>
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
                            >
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
