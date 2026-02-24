"use client";

import { use } from "react";
import { getTrackById } from "@/lib/tutorials";
import TutorialTrackViewer from "@/components/TutorialTrackViewer";
import Link from "next/link";

export default function TrackPage({
    params,
}: {
    params: Promise<{ trackId: string }>;
}) {
    const { trackId } = use(params);
    const track = getTrackById(trackId);

    if (!track) {
        return (
            <div style={{ padding: "48px 0", textAlign: "center", color: "#5a5a78" }}>
                <p style={{ fontSize: "16px", marginBottom: "8px" }}>Track not found</p>
                <Link href="/learn" className="btn btn-secondary" style={{ textDecoration: "none" }}>
                    Back to Learn
                </Link>
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", minHeight: "calc(100dvh - 88px)" }}>
            <TutorialTrackViewer track={track} />
        </div>
    );
}
