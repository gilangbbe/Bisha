"use client";

import ConceptForm from "@/components/ConceptForm";

export default function CreatePage() {
    return (
        <div className="animate-fade-in">
            <div style={{ padding: "24px 0 20px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "4px" }}>
                    New Concept
                </h1>
                <p style={{ fontSize: "14px", color: "#9595b0" }}>
                    Fill the template to capture a banking concept clearly
                </p>
            </div>
            <ConceptForm />
        </div>
    );
}
