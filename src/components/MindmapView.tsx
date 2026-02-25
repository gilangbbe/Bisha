"use client";

import { Step, DECISION_BRANCH_COLORS } from "@/types";
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
    type: "center" | "step" | "decision" | "option" | "note";
    actor?: string;
    color?: string;
    depth: number;
}

interface MindEdge {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    color: string;
}

/** Count how many visual nodes a step subtree will produce (for angular weight). */
function subtreeWeight(steps: Step[], zoomLevel: 1 | 2 | 3): number {
    let w = 0;
    for (const s of steps) {
        w += 1; // the step itself
        if (s.decision && zoomLevel >= 2) {
            for (const opt of s.decision.options) {
                w += 1; // option node
                w += subtreeWeight(opt.steps, zoomLevel);
            }
        }
        if (s.notes && zoomLevel >= 3) w += 1;
    }
    return Math.max(w, 1);
}

/**
 * Recursively lay out a subtree of steps emanating from a parent point
 * in a given angular slice [angleStart, angleEnd] at a given radius.
 */
function layoutSubtree(
    steps: Step[],
    parentX: number,
    parentY: number,
    angleStart: number,
    angleEnd: number,
    radius: number,
    zoomLevel: 1 | 2 | 3,
    depth: number,
    idPrefix: string,
    nodes: MindNode[],
    edges: MindEdge[],
) {
    if (steps.length === 0) return;

    // Calculate total weight for proportional angle allocation
    const weights = steps.map((s) => subtreeWeight([s], zoomLevel));
    const totalWeight = weights.reduce((a, b) => a + b, 0);

    let currentAngle = angleStart;

    steps.forEach((step, i) => {
        const stepSlice = ((angleEnd - angleStart) * weights[i]) / totalWeight;
        const midAngle = currentAngle + stepSlice / 2;
        const sx = parentX + radius * Math.cos(midAngle);
        const sy = parentY + radius * Math.sin(midAngle);
        const nodeId = `${idPrefix}-${step.id}`;

        nodes.push({
            id: nodeId,
            label: step.action,
            x: sx,
            y: sy,
            type: step.decision ? "decision" : "step",
            actor: step.actor,
            depth,
        });
        edges.push({
            fromX: parentX,
            fromY: parentY,
            toX: sx,
            toY: sy,
            color: step.decision ? "#f59e0b" : "#6366f1",
        });

        // Decision branches
        if (step.decision && zoomLevel >= 2) {
            const opts = step.decision.options;
            const numOpts = opts.length;
            const optWeights = opts.map((o) => 1 + subtreeWeight(o.steps, zoomLevel));
            const optTotalWeight = optWeights.reduce((a, b) => a + b, 0);
            // Spread branch options within this step's angular slice
            const branchSlice = stepSlice * 0.8;
            const branchStart = midAngle - branchSlice / 2;
            let optAngle = branchStart;
            const subRadius = Math.max(60, radius * 0.55);

            opts.forEach((opt, oi) => {
                const oSlice = (branchSlice * optWeights[oi]) / optTotalWeight;
                const oMid = optAngle + oSlice / 2;
                const ox = sx + subRadius * Math.cos(oMid);
                const oy = sy + subRadius * Math.sin(oMid);
                const branchColor = DECISION_BRANCH_COLORS[oi % DECISION_BRANCH_COLORS.length];

                nodes.push({
                    id: `${nodeId}-opt${oi}`,
                    label: opt.label || `Branch ${oi + 1}`,
                    x: ox,
                    y: oy,
                    type: "option",
                    color: branchColor,
                    depth: depth + 1,
                });
                edges.push({
                    fromX: sx,
                    fromY: sy,
                    toX: ox,
                    toY: oy,
                    color: branchColor,
                });

                // Recursively layout sub-steps of this branch
                if (opt.steps.length > 0) {
                    const childRadius = Math.max(50, subRadius * 0.65);
                    layoutSubtree(
                        opt.steps,
                        ox,
                        oy,
                        oMid - oSlice / 2,
                        oMid + oSlice / 2,
                        childRadius,
                        zoomLevel,
                        depth + 2,
                        `${nodeId}-b${oi}`,
                        nodes,
                        edges,
                    );
                }

                optAngle += oSlice;
            });
        }

        // Notes sub-node
        if (step.notes && zoomLevel >= 3) {
            const noteAngle = midAngle + stepSlice * 0.35;
            const noteRadius = radius * 0.45;
            const nx = sx + noteRadius * Math.cos(noteAngle);
            const ny = sy + noteRadius * Math.sin(noteAngle);
            nodes.push({
                id: `${nodeId}-note`,
                label: step.notes,
                x: nx,
                y: ny,
                type: "note",
                depth,
            });
            edges.push({ fromX: sx, fromY: sy, toX: nx, toY: ny, color: "#8b5cf6" });
        }

        currentAngle += stepSlice;
    });
}

function layoutMindmap(
    steps: Step[],
    title: string,
    zoomLevel: 1 | 2 | 3
): { nodes: MindNode[]; edges: MindEdge[]; totalWidth: number; totalHeight: number } {
    const nodes: MindNode[] = [];
    const edges: MindEdge[] = [];

    const centerX = 400;
    const centerY = 300;
    const branchRadius = 180;

    nodes.push({ id: "center", label: title, x: centerX, y: centerY, type: "center", depth: 0 });

    layoutSubtree(
        steps,
        centerX,
        centerY,
        -Math.PI / 2,
        -Math.PI / 2 + 2 * Math.PI,
        branchRadius,
        zoomLevel,
        1,
        "root",
        nodes,
        edges,
    );

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
                                    {node.label.length > 20 ? node.label.slice(0, 17) + "…" : node.label}
                                </text>
                            </g>
                        );
                    }

                    if (node.type === "note") {
                        return (
                            <g key={node.id}>
                                <rect x={node.x - 55} y={node.y - 14} width={110} height={28} rx={6} fill="rgba(139, 92, 246, 0.1)" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="1" />
                                <text x={node.x} y={node.y + 1} textAnchor="middle" dominantBaseline="middle" fill="#a78bfa" fontSize="9" fontStyle="italic" fontFamily="var(--font-sans)">
                                    {node.label.length > 20 ? node.label.slice(0, 17) + "…" : node.label}
                                </text>
                            </g>
                        );
                    }

                    if (node.type === "option") {
                        const w = 68;
                        const h = 24;
                        return (
                            <g key={node.id}>
                                <rect x={node.x - w / 2} y={node.y - h / 2} width={w} height={h} rx={6} fill={`${node.color}18`} stroke={node.color} strokeWidth="1" />
                                <text x={node.x} y={node.y + 1} textAnchor="middle" dominantBaseline="middle" fill={node.color} fontSize="9" fontWeight="600" fontFamily="var(--font-sans)">
                                    {node.label.length > 10 ? node.label.slice(0, 8) + "…" : node.label}
                                </text>
                            </g>
                        );
                    }

                    // Step or decision node
                    const isDecision = node.type === "decision";
                    const scale = Math.max(0.7, 1 - (node.depth - 1) * 0.1);
                    const w = Math.round(130 * scale);
                    const h = Math.round(44 * scale);

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
                                strokeWidth="1.5"
                            />
                            <text
                                x={node.x}
                                y={node.actor ? node.y - 4 : node.y + 1}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="#f0f0f5"
                                fontSize={Math.round(10 * scale).toString()}
                                fontWeight="500"
                                fontFamily="var(--font-sans)"
                            >
                                {node.label.length > 18 ? node.label.slice(0, 15) + "…" : node.label}
                            </text>
                            {node.actor && (
                                <text x={node.x} y={node.y + 12} textAnchor="middle" dominantBaseline="middle" fill="#5a5a78" fontSize="8" fontFamily="var(--font-sans)">
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
