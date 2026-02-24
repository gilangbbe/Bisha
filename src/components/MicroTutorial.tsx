"use client";

import { useState, useEffect } from "react";
import { MicroTutorialMessage } from "@/lib/tutorials";

interface MicroTutorialProps {
    tutorial: MicroTutorialMessage;
    onDismiss: (id: string) => void;
}

export default function MicroTutorial({ tutorial, onDismiss }: MicroTutorialProps) {
    const [visible, setVisible] = useState(false);
    const [hiding, setHiding] = useState(false);

    useEffect(() => {
        // Delay appearance for a more natural feel
        const timer = setTimeout(() => setVisible(true), 600);
        return () => clearTimeout(timer);
    }, []);

    const handleDismiss = () => {
        setHiding(true);
        setTimeout(() => onDismiss(tutorial.id), 300);
    };

    if (!visible) return null;

    return (
        <div
            className={`micro-tutorial ${hiding ? "hiding" : ""}`}
            style={{
                position: "fixed",
                bottom: "88px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "calc(100% - 32px)",
                maxWidth: "608px",
                zIndex: 45,
            }}
        >
            <div
                className="glass-card"
                style={{
                    padding: "14px 16px",
                    borderColor: "rgba(99, 102, 241, 0.3)",
                    display: "flex",
                    gap: "12px",
                    alignItems: "flex-start",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 16px rgba(99, 102, 241, 0.15)",
                }}
            >
                <span style={{ fontSize: "20px", flexShrink: 0, marginTop: "1px" }}>💡</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h4
                        style={{
                            fontSize: "14px",
                            fontWeight: 600,
                            color: "#f0f0f5",
                            marginBottom: "4px",
                        }}
                    >
                        {tutorial.title}
                    </h4>
                    <p
                        style={{
                            fontSize: "13px",
                            color: "#9595b0",
                            lineHeight: 1.5,
                        }}
                    >
                        {tutorial.message}
                    </p>
                </div>
                <button
                    onClick={handleDismiss}
                    className="btn btn-ghost btn-sm"
                    style={{
                        padding: "4px",
                        color: "#5a5a78",
                        flexShrink: 0,
                    }}
                >
                    ✕
                </button>
            </div>
        </div>
    );
}
