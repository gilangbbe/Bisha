"use client";

import { Step, DECISION_BRANCH_COLORS } from "@/types";
import { useMemo } from "react";

interface FlowchartViewProps {
    steps: Step[];
    title: string;
    zoomLevel: 1 | 2 | 3;
}

const NODE_W = 220;
const NODE_H = 52;
const DECISION_H = 58;
const GAP_Y = 40;
const BRANCH_GAP_X = 40;
const NOTE_H = 28;

interface LayoutNode {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    type: "step" | "decision" | "notes" | "branchLabel";
    label: string;
    secondaryLabel?: string;
    actor?: string;
    color?: string;
    depth: number;
}

interface LayoutEdge {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    label?: string;
    color?: string;
    curved?: boolean;
    dashed?: boolean;
}

interface LayoutResult {
    nodes: LayoutNode[];
    edges: LayoutEdge[];
    width: number;
    height: number;
}

/**
 * Recursively layout a sequence of steps as a vertical column.
 * Returns the nodes, edges, bounding width, and height consumed.
 * The column is laid out starting at (left, top) with centerX calculated internally.
 */
function layoutStepSequence(
    steps: Step[],
    startX: number,
    startY: number,
    zoomLevel: 1 | 2 | 3,
    depth: number,
    idPrefix: string,
): LayoutResult {
    const nodes: LayoutNode[] = [];
    const edges: LayoutEdge[] = [];
    let y = startY;
    let maxWidth = NODE_W;

    const filteredSteps = steps.filter((s) => {
        if (zoomLevel === 1 && depth === 0) return !s.decision;
        return true;
    });

    for (let i = 0; i < filteredSteps.length; i++) {
        const step = filteredSteps[i];
        const hasDecision = step.decision && zoomLevel >= 2;
        const nodeId = `${idPrefix}-${step.id}`;

        // Place the step node (will be repositioned once we know column width)
        const nodeH = hasDecision ? DECISION_H : NODE_H;
        const stepNode: LayoutNode = {
            id: nodeId,
            x: 0, // placeholder — repositioned later
            y,
            width: NODE_W,
            height: nodeH,
            type: hasDecision ? "decision" : "step",
            label: step.action,
            secondaryLabel: hasDecision ? step.decision!.question : undefined,
            actor: step.actor,
            depth,
        };
        nodes.push(stepNode);

        const stepBottomY = y + nodeH;

        // Notes
        if (zoomLevel >= 3 && step.notes) {
            const noteY = stepBottomY + 6;
            nodes.push({
                id: `${nodeId}-notes`,
                x: 0,
                y: noteY,
                width: NODE_W - 30,
                height: NOTE_H,
                type: "notes",
                label: step.notes,
                depth,
            });
            y = noteY + NOTE_H + GAP_Y;
        } else {
            y = stepBottomY + GAP_Y;
        }

        // Branches for decisions
        if (hasDecision && step.decision) {
            const branchResults: LayoutResult[] = [];
            const options = step.decision.options;

            // Layout each branch
            for (let oi = 0; oi < options.length; oi++) {
                const opt = options[oi];
                if (opt.steps.length > 0) {
                    const branchResult = layoutStepSequence(
                        opt.steps,
                        0, // x offset computed later
                        y + 24, // leave room for branch label
                        zoomLevel,
                        depth + 1,
                        `${nodeId}-b${oi}`,
                    );
                    branchResults.push(branchResult);
                } else {
                    branchResults.push({ nodes: [], edges: [], width: NODE_W * 0.6, height: 0 });
                }
            }

            // Calculate total branches width
            const totalBranchWidth = branchResults.reduce((sum, r) => sum + r.width, 0) + BRANCH_GAP_X * (branchResults.length - 1);
            maxWidth = Math.max(maxWidth, totalBranchWidth);

            // Position branches side by side, centered under the decision
            let branchX = 0;
            for (let oi = 0; oi < options.length; oi++) {
                const opt = options[oi];
                const br = branchResults[oi];
                const branchColor = DECISION_BRANCH_COLORS[oi % DECISION_BRANCH_COLORS.length];
                const branchCenterX = branchX + br.width / 2;

                // Branch label
                nodes.push({
                    id: `${nodeId}-blabel${oi}`,
                    x: branchCenterX - 40,
                    y: y,
                    width: 80,
                    height: 20,
                    type: "branchLabel",
                    label: opt.label || `Branch ${oi + 1}`,
                    color: branchColor,
                    depth: depth + 1,
                });

                // Edge from decision node to branch label
                edges.push({
                    fromX: 0, // repositioned later
                    fromY: stepBottomY,
                    toX: branchCenterX,
                    toY: y,
                    label: undefined,
                    color: branchColor,
                    curved: true,
                });

                // Add branch nodes/edges (offset by branchX)
                for (const n of br.nodes) {
                    nodes.push({ ...n, x: n.x + branchX });
                }
                for (const e of br.edges) {
                    edges.push({ ...e, fromX: e.fromX + branchX, toX: e.toX + branchX });
                }

                // Edge from branch label to first branch step
                if (br.nodes.length > 0) {
                    edges.push({
                        fromX: branchCenterX,
                        fromY: y + 20,
                        toX: branchCenterX,
                        toY: y + 24,
                        color: branchColor,
                    });
                }

                branchX += br.width + BRANCH_GAP_X;
            }

            // Calculate max branch depth
            const maxBranchHeight = Math.max(...branchResults.map((r) => r.height), 0);
            y = y + 24 + maxBranchHeight + GAP_Y;

            // Reconnect edge: dashed line to next node after branches
            if (i < filteredSteps.length - 1) {
                // Will be handled below
            }
        }

        // Edge to next step
        if (i < filteredSteps.length - 1) {
            edges.push({
                fromX: 0, // repositioned later (centered)
                fromY: y - GAP_Y,
                toX: 0,
                toY: y,
                dashed: !!hasDecision,
            });
        }
    }

    // Now center all nodes/edges horizontally within maxWidth
    const centerX = maxWidth / 2;
    for (const node of nodes) {
        if (node.type === "branchLabel") {
            // Already positioned
        } else if (node.id.includes("-b")) {
            // Branch nodes — already positioned
        } else {
            node.x = centerX - node.width / 2;
        }
    }
    // Fix edge endpoints that were left at 0 (decision → branch, step → step)
    for (const edge of edges) {
        if (edge.fromX === 0 && !edge.curved) edge.fromX = centerX;
        if (edge.toX === 0 && !edge.curved) edge.toX = centerX;
        if (edge.curved && edge.fromX === 0) edge.fromX = centerX;
    }

    return {
        nodes,
        edges,
        width: maxWidth,
        height: y - startY,
    };
}

export default function FlowchartView({ steps, title, zoomLevel }: FlowchartViewProps) {
    const { nodes, edges, totalWidth, totalHeight } = useMemo(() => {
        const result = layoutStepSequence(steps, 0, 40, zoomLevel, 0, "root");
        const padding = 40;
        // Find actual bounds
        let minX = Infinity, maxX = -Infinity, minY = 0, maxY = -Infinity;
        for (const n of result.nodes) {
            minX = Math.min(minX, n.x);
            maxX = Math.max(maxX, n.x + n.width);
            maxY = Math.max(maxY, n.y + n.height);
        }
        if (result.nodes.length === 0) {
            return { nodes: [], edges: [], totalWidth: 600, totalHeight: 100 };
        }
        // Offset everything so it fits within the SVG
        const offsetX = -minX + padding;
        const offsetY = padding;
        for (const n of result.nodes) {
            n.x += offsetX;
            n.y += offsetY;
        }
        for (const e of result.edges) {
            e.fromX += offsetX;
            e.fromY += offsetY;
            e.toX += offsetX;
            e.toY += offsetY;
        }
        return {
            nodes: result.nodes,
            edges: result.edges,
            totalWidth: maxX - minX + padding * 2,
            totalHeight: maxY + padding * 2,
        };
    }, [steps, zoomLevel]);

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
                style={{ display: "block", minWidth: "100%" }}
            >
                <defs>
                    <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                        <polygon points="0 0, 8 3, 0 6" fill="#6366f1" opacity="0.6" />
                    </marker>
                    <linearGradient id="nodeGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#1a1a2e" />
                        <stop offset="100%" stopColor="#22223a" />
                    </linearGradient>
                    <linearGradient id="decisionGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#2a2010" />
                        <stop offset="100%" stopColor="#1a1a2e" />
                    </linearGradient>
                </defs>

                {/* Title */}
                <text x={totalWidth / 2} y={20} textAnchor="middle" fill="#5a5a78" fontSize="11" fontWeight="600" fontFamily="var(--font-sans)">
                    {title}
                </text>

                {/* Edges */}
                {edges.map((edge, i) => {
                    const midY = (edge.fromY + edge.toY) / 2;
                    return (
                        <g key={`edge-${i}`}>
                            {edge.curved ? (
                                <path
                                    d={`M ${edge.fromX} ${edge.fromY} C ${edge.fromX} ${midY}, ${edge.toX} ${midY}, ${edge.toX} ${edge.toY}`}
                                    fill="none"
                                    stroke={edge.color || "#6366f1"}
                                    strokeWidth="1.5"
                                    opacity={0.5}
                                    markerEnd="url(#arrowhead)"
                                />
                            ) : (
                                <line
                                    x1={edge.fromX}
                                    y1={edge.fromY}
                                    x2={edge.toX}
                                    y2={edge.toY}
                                    stroke={edge.color || "#6366f1"}
                                    strokeWidth="1.5"
                                    opacity={0.4}
                                    strokeDasharray={edge.dashed ? "4 3" : undefined}
                                    markerEnd="url(#arrowhead)"
                                />
                            )}
                        </g>
                    );
                })}

                {/* Nodes */}
                {nodes.map((node) => {
                    if (node.type === "branchLabel") {
                        return (
                            <g key={node.id}>
                                <rect x={node.x} y={node.y} width={node.width} height={node.height} rx={10} fill={`${node.color}20`} stroke={node.color} strokeWidth="1" />
                                <text x={node.x + node.width / 2} y={node.y + 14} textAnchor="middle" fill={node.color} fontSize="9" fontWeight="700" fontFamily="var(--font-sans)">
                                    {node.label.length > 12 ? node.label.slice(0, 10) + "…" : node.label}
                                </text>
                            </g>
                        );
                    }
                    if (node.type === "notes") {
                        return (
                            <g key={node.id}>
                                <rect x={node.x} y={node.y} width={node.width} height={node.height} rx={6} fill="rgba(99, 102, 241, 0.08)" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="1" />
                                <text x={node.x + 8} y={node.y + 18} fill="#9595b0" fontSize="9" fontStyle="italic" fontFamily="var(--font-sans)">
                                    📝 {node.label.length > 40 ? node.label.slice(0, 37) + "…" : node.label}
                                </text>
                            </g>
                        );
                    }
                    if (node.type === "decision") {
                        return (
                            <g key={node.id}>
                                <rect x={node.x} y={node.y} width={node.width} height={node.height} rx={12} fill="url(#decisionGrad)" stroke="#f59e0b" strokeWidth="1.5" opacity={0.9} />
                                <text x={node.x + 10} y={node.y + 18} fill="#f0f0f5" fontSize="11" fontWeight="600" fontFamily="var(--font-sans)">
                                    {node.label.length > 32 ? node.label.slice(0, 29) + "…" : node.label}
                                </text>
                                {node.secondaryLabel && (
                                    <text x={node.x + 10} y={node.y + 36} fill="#fbbf24" fontSize="9" fontFamily="var(--font-sans)">
                                        ◇ {node.secondaryLabel.length > 38 ? node.secondaryLabel.slice(0, 35) + "…" : node.secondaryLabel}
                                    </text>
                                )}
                                {node.actor && (
                                    <text x={node.x + node.width - 6} y={node.y + 18} textAnchor="end" fill="#5a5a78" fontSize="8" fontFamily="var(--font-sans)">
                                        {node.actor}
                                    </text>
                                )}
                            </g>
                        );
                    }
                    // Regular step
                    return (
                        <g key={node.id}>
                            <rect x={node.x} y={node.y} width={node.width} height={node.height} rx={12} fill="url(#nodeGrad)" stroke={node.depth > 0 ? "#3a3a55" : "#2a2a45"} strokeWidth="1.5" />
                            <text x={node.x + 10} y={node.y + 20} fill="#f0f0f5" fontSize={node.depth > 0 ? "10" : "11"} fontWeight="500" fontFamily="var(--font-sans)">
                                {node.label.length > 32 ? node.label.slice(0, 29) + "…" : node.label}
                            </text>
                            {node.actor && (
                                <text x={node.x + 10} y={node.y + 38} fill="#5a5a78" fontSize="9" fontFamily="var(--font-sans)">
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
