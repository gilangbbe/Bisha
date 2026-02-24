"use client";

import { useState, useEffect, use } from "react";
import { Concept } from "@/types";
import { getConceptById } from "@/lib/concepts";
import ConceptForm from "@/components/ConceptForm";
import Link from "next/link";

export default function EditConceptPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const [concept, setConcept] = useState<Concept | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getConceptById(id)
            .then(setConcept)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div style={{ padding: "24px 0" }}>
                <div className="skeleton" style={{ height: "32px", width: "60%", marginBottom: "24px" }} />
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="skeleton" style={{ height: "60px", marginBottom: "16px" }} />
                ))}
            </div>
        );
    }

    if (!concept) {
        return (
            <div style={{ padding: "48px 0", textAlign: "center", color: "#5a5a78" }}>
                <p style={{ fontSize: "16px", marginBottom: "8px" }}>Concept not found</p>
                <Link href="/" className="btn btn-secondary" style={{ textDecoration: "none" }}>
                    Back to Browse
                </Link>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div style={{ padding: "24px 0 20px" }}>
                <Link
                    href={`/concepts/${concept.id}`}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "#9595b0",
                        textDecoration: "none",
                        fontSize: "14px",
                        marginBottom: "12px",
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Back
                </Link>
                <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "4px" }}>
                    Edit Concept
                </h1>
                <p style={{ fontSize: "14px", color: "#9595b0" }}>
                    Update &quot;{concept.title}&quot;
                </p>
            </div>
            <ConceptForm existingConcept={concept} />
        </div>
    );
}
