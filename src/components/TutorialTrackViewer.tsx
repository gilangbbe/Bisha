"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TutorialTrack } from "@/types";
import TutorialCardView from "./TutorialCardView";

interface TutorialTrackViewerProps {
    track: TutorialTrack;
}

export default function TutorialTrackViewer({ track }: TutorialTrackViewerProps) {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    const card = track.cards[currentIndex];
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === track.cards.length - 1;

    const goNext = useCallback(() => {
        if (isLast || isAnimating) return;
        setSlideDirection("left");
        setIsAnimating(true);
        setTimeout(() => {
            setCurrentIndex((prev) => prev + 1);
            setSlideDirection(null);
            setIsAnimating(false);
        }, 250);
    }, [isLast, isAnimating]);

    const goPrev = useCallback(() => {
        if (isFirst || isAnimating) return;
        setSlideDirection("right");
        setIsAnimating(true);
        setTimeout(() => {
            setCurrentIndex((prev) => prev - 1);
            setSlideDirection(null);
            setIsAnimating(false);
        }, 250);
    }, [isFirst, isAnimating]);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        const diff = touchStartX.current - touchEndX.current;
        const threshold = 50;

        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                goNext();
            } else {
                goPrev();
            }
        }
    };

    const handleCta = () => {
        if (card.ctaAction) {
            router.push(card.ctaAction);
        }
    };

    return (
        <div
            className="tutorial-track-viewer"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px 0",
                }}
            >
                <button
                    onClick={() => router.push("/learn")}
                    className="btn btn-ghost btn-sm"
                    style={{ color: "#9595b0" }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Back
                </button>
                <span style={{ fontSize: "13px", color: "#5a5a78", fontWeight: 600 }}>
                    {track.icon} {track.title}
                </span>
                <button
                    onClick={() => router.push("/learn")}
                    className="btn btn-ghost btn-sm"
                    style={{ color: "#9595b0", fontSize: "13px" }}
                >
                    Skip
                </button>
            </div>

            {/* Card container with animation */}
            <div
                className={`tutorial-slide ${slideDirection === "left" ? "slide-out-left" : slideDirection === "right" ? "slide-out-right" : "slide-in"}`}
                style={{ flex: 1, overflow: "auto" }}
            >
                <TutorialCardView
                    card={card}
                    current={currentIndex}
                    total={track.cards.length}
                />
            </div>

            {/* Navigation */}
            <div
                style={{
                    display: "flex",
                    gap: "10px",
                    padding: "16px 0 24px",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <button
                    onClick={goPrev}
                    className="btn btn-secondary btn-sm"
                    disabled={isFirst}
                    style={{
                        opacity: isFirst ? 0.3 : 1,
                        minWidth: "80px",
                    }}
                >
                    ← Prev
                </button>

                {/* CTA button (if card has one) */}
                {card.ctaLabel && card.ctaAction && (
                    <button
                        onClick={handleCta}
                        className="btn btn-sm"
                        style={{
                            background: "rgba(99, 102, 241, 0.15)",
                            color: "#818cf8",
                            border: "1px solid rgba(99, 102, 241, 0.3)",
                            fontSize: "12px",
                        }}
                    >
                        {card.ctaLabel} →
                    </button>
                )}

                {isLast ? (
                    <button
                        onClick={() => router.push("/learn")}
                        className="btn btn-primary btn-sm"
                        style={{ minWidth: "80px" }}
                    >
                        Done ✓
                    </button>
                ) : (
                    <button
                        onClick={goNext}
                        className="btn btn-primary btn-sm"
                        style={{ minWidth: "80px" }}
                    >
                        Next →
                    </button>
                )}
            </div>

            {/* Swipe hint (only on first card) */}
            {currentIndex === 0 && (
                <p
                    style={{
                        textAlign: "center",
                        fontSize: "12px",
                        color: "#5a5a78",
                        paddingBottom: "8px",
                    }}
                >
                    Swipe left/right or use buttons
                </p>
            )}
        </div>
    );
}
