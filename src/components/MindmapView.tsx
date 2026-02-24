"use client";

import { Step } from "@/types";
import { useMemo } from "react";

interface MindmapViewProps {
    steps: Step[];
    title: string;
    zoomLevel: 1 | 2 | 3;
}

interface MindNode {
    id: string;
    label: string;
    x: number;
    y: number;
    type: "center" | "step" | "decision" | "note";
    actor?: string;
}

interface MindEdge {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    color: string;
}

function layoutMindmap(
    steps: Step[],
    title: string,
    zoomLevel: 1 | 2 | 3
): { nodes: MindNode[]; edges: MindEdge[]; totalWidth: number; totalHeight: number } {
    const nodes: MindNode[] = [];
    const edges: MindEdge[] = [];

    const centerX = 350;
    const centerY = 250;
    const branchRadius = 180;

    // Center node
    nodes.push({ id: "center", label: title, x: centerX, y: centerY, type: "center" });

    const filteredSteps = steps;
    const angleStep = filteredSteps.length > 0 ? (2 * Math.PI) / filteredSteps.length : 0;
    const startAngle = -Math.PI / 2;

    filteredSteps.forEach((step, i) => {
        const angle = startAngle + i * angleStep;
        const sx = centerX + branchRadius * Math.cos(angle);
        const sy = centerY + branchRadius * Math.sin(angle);

        nodes.push({
            id: step.id,
            label: step.action,
            x: sx,
            y: sy,
            type: step.decision ? "decision" : "step",
            actor: step.actor,
        });

        edges.push({
            fromX: centerX,
            fromY: centerY,
            toX: sx,
            toY: sy,
            color: step.decision ? "#f59e0b" : "#6366f1",
        });

        // Sub-branches for decisions
        if (step.decision && zoomLevel >= 2) {
            const subRadius = 90;
            const subAngleA = angle - 0.3;
            const subAngleB = angle + 0.3;
            const axX = sx + subRadius * Math.cos(subAngleA);
            const axY = sy + subRadius * Math.sin(subAngleA);
            const bxX = sx + subRadius * Math.cos(subAngleB);
            const bxY = sy + subRadius * Math.sin(subAngleB);

            nodes.push({
                id: `${step.id}-optA`,
                label: step.decision.optionA.label,
                x: axX,
                y: axY,
                type: "decision",
            });
            nodes.push({
                id: `${step.id}-optB`,
                label: step.decision.optionB.label,
                x: bxX,
                y: bxY,
                type: "decision",
            });
            edges.push({ fromX: sx, fromY: sy, toX: axX, toY: axY, color: "#10b981" });
            edges.push({ fromX: sx, fromY: sy, toX: bxX, toY: bxY, color: "#ef4444" });
        }

        // Notes sub-branch
        if (step.notes && zoomLevel >= 3) {
            const noteAngle = angle + (step.decision ? 0.5 : 0.3);
            const noteRadius = step.decision && zoomLevel >= 2 ? 120 : 90;
            const nxX = sx + noteRadius * Math.cos(noteAngle);
            const nxY = sy + noteRadius * Math.sin(noteAngle);
            nodes.push({
                id: `${step.id}-note`,
                label: step.notes,
                x: nxX,
                y: nxY,
                type: "note",
            });
            edges.push({ fromX: sx, fromY: sy, toX: nxX, toY: nxY, color: "#8b5cf6" });
        }
    });

    // Calculate bounds
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    nodes.forEach((n) => {
        minX = Math.min(minX, n.x - 80);
        maxX = Math.max(maxX, n.x + 80);
        minY = Math.min(minY, n.y - 30);
        maxY = Math.max(maxY, n.y + 30);
    });

    const padding = 40;
    const totalWidth = maxX - minX + padding * 2;
    const totalHeight = maxY - minY + padding * 2;

    // Offset all nodes and edges
    const offsetX = -minX + padding;
    const offsetY = -minY + padding;
    nodes.forEach((n) => { n.x += offsetX; n.y += offsetY; });
    edges.forEach((e) => {
        e.fromX += offsetX;
        e.fromY += offsetY;
        e.toX += offsetX;
        e.toY += offsetY;
    });

    return { nodes, edges, totalWidth, totalHeight };
}

export default function MindmapView({ steps, title, zoomLevel }: MindmapViewProps) {
    const { nodes, edges, totalWidth, totalHeight } = useMemo(
        () => layoutMindmap(steps, title, zoomLevel),
        [steps, title, zoomLevel]
    );

    if (steps.length === 0) {
        return (
            <div style={{ textAlign: "center", padding: "32px", color: "#5a5a78" }}>
                No steps to visualize
            </div>
        );
    }

    return (
        <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: "60vh", borderRadius: "12px", border: "1px solid var(--color-border)", background: "var(--color-bg-secondary)" }}>
            <svg
                width={totalWidth}
                height={totalHeight}
                viewBox={`0 0 ${totalWidth} ${totalHeight}`}
                style={{ display: "block" }}
            >
                {/* Edges */}
                {edges.map((edge, i) => (
                    <line
                        key={`edge-${i}`}
                        x1={edge.fromX}
                        y1={edge.fromY}
                        x2={edge.toX}
                        y2={edge.toY}
                        stroke={edge.color}
                        strokeWidth="2"
                        opacity={0.3}
                    />
                ))}

                {/* Nodes */}
                {nodes.map((node) => {
                    if (node.type === "center") {
                        return (
                            <g key={node.id}>
                                <circle cx={node.x} cy={node.y} r={40} fill="#6366f1" opacity={0.15} stroke="#6366f1" strokeWidth="2" />
                                <circle cx={node.x} cy={node.y} r={36} fill="var(--color-bg-card)" />
                                <text x={node.x} y={node.y + 1} textAnchor="middle" dominantBaseline="middle" fill="#f0f0f5" fontSize="11" fontWeight="700" fontFamily="var(--font-sans)">
                                    {node.label.length > 20 ? node.label.slice(0, 17) + "..." : node.label}
                                </text>
                            </g>
                        );
                    }

                    if (node.type === "note") {
                        return (
                            <g key={node.id}>
                                <rect x={node.x - 55} y={node.y - 14} width={110} height={28} rx={6} fill="rgba(139, 92, 246, 0.1)" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="1" />
                                <text x={node.x} y={node.y + 1} textAnchor="middle" dominantBaseline="middle" fill="#a78bfa" fontSize="9" fontStyle="italic" fontFamily="var(--font-sans)">
                                    {node.label.length > 20 ? node.label.slice(0, 17) + "..." : node.label}
                                </text>
                            </g>
                        );
                    }

                    const isDecision = node.type === "decision";
                    const isSubOption = node.id.includes("-opt");
                    const w = isSubOption ? 60 : 130;
                    const h = isSubOption ? 26 : 44;

                    return (
                        <g key={node.id}>
                            <rect
                                x={node.x - w / 2}
                                y={node.y - h / 2}
                                width={w}
                                height={h}
                                rx={isDecision ? 6 : 10}
                                fill={isDecision ? "rgba(245, 158, 11, 0.1)" : "var(--color-bg-card)"}
                                stroke={isDecision ? "#f59e0b" : "#2a2a45"}
                                strokeWidth={isSubOption ? 1 : 1.5}
                            />
                            <text
                                x={node.x}
                                y={node.actor && !isSubOption ? node.y - 4 : node.y + 1}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill={isSubOption ? "#fbbf24" : "#f0f0f5"}
                                fontSize={isSubOption ? "9" : "10"}
                                fontWeight={isSubOption ? "600" : "500"}
                                fontFamily="var(--font-sans)"
                            >
                                {node.label.length > (isSubOption ? 10 : 18)
                                    ? node.label.slice(0, isSubOption ? 7 : 15) + "..."
                                    : node.label}
                            </text>
                            {node.actor && !isSubOption && (
                                <text
                                    x={node.x}
                                    y={node.y + 12}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fill="#5a5a78"
                                    fontSize="8"
                                    fontFamily="var(--font-sans)"
                                >
                                    👤 {node.actor}
                                </text>
                            )}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}
