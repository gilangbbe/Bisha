"use client";

import { TutorialCard } from "@/types";

interface TutorialCardViewProps {
    card: TutorialCard;
    current: number;
    total: number;
}

export default function TutorialCardView({ card, current, total }: TutorialCardViewProps) {
    return (
        <div className="tutorial-card-content">
            {/* Progress indicator */}
            <div style={{ display: "flex", gap: "4px", marginBottom: "24px" }}>
                {Array.from({ length: total }).map((_, i) => (
                    <div
                        key={i}
                        style={{
                            flex: 1,
                            height: "3px",
                            borderRadius: "2px",
                            background: i <= current ? "#6366f1" : "rgba(99, 102, 241, 0.2)",
                            transition: "background 0.3s ease",
                        }}
                    />
                ))}
            </div>

            {/* Card number */}
            <span
                style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#5a5a78",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                }}
            >
                {current + 1} of {total}
            </span>

            {/* Title */}
            <h2
                style={{
                    fontSize: "22px",
                    fontWeight: 700,
                    lineHeight: 1.3,
                    marginTop: "8px",
                    marginBottom: "12px",
                    background: "linear-gradient(135deg, #f0f0f5, #818cf8)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                }}
            >
                {card.title}
            </h2>

            {/* Message */}
            <p
                style={{
                    fontSize: "15px",
                    lineHeight: 1.7,
                    color: "#c0c0d0",
                    marginBottom: "24px",
                }}
            >
                {card.message}
            </p>

            {/* Examples */}
            {(card.exampleBad || card.exampleGood) && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {/* Bad example first */}
                    {card.exampleBad && (
                        <div className="tutorial-example tutorial-example-bad">
                            <div className="tutorial-example-header">
                                <span className="tutorial-example-badge bad">✗ Bad</span>
                            </div>
                            <p className="tutorial-example-content">
                                {card.exampleBad.content}
                            </p>
                            {card.exampleBad.explanation && (
                                <p className="tutorial-example-explanation">
                                    {card.exampleBad.explanation}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Good example */}
                    {card.exampleGood && (
                        <div className="tutorial-example tutorial-example-good">
                            <div className="tutorial-example-header">
                                <span className="tutorial-example-badge good">✓ Good</span>
                            </div>
                            <p className="tutorial-example-content">
                                {card.exampleGood.content}
                            </p>
                            {card.exampleGood.explanation && (
                                <p className="tutorial-example-explanation">
                                    {card.exampleGood.explanation}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
