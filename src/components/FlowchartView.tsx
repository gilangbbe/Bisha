"use client";

import { Step } from "@/types";
import { useMemo } from "react";

interface FlowchartViewProps {
    steps: Step[];
    title: string;
    zoomLevel: 1 | 2 | 3;
}

const NODE_W = 260;
const NODE_H = 56;
const DECISION_H = 60;
const GAP_Y = 48;
const BRANCH_X_OFFSET = 160;

interface LayoutNode {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    type: "step" | "decision";
    label: string;
    secondaryLabel?: string;
    actor?: string;
    notes?: string;
    optionALabel?: string;
    optionBLabel?: string;
    branchTargetA?: string;
    branchTargetB?: string;
}

interface LayoutEdge {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    label?: string;
    curved?: boolean;
    controlPoints?: { x: number; y: number }[];
}

function layoutNodes(steps: Step[], zoomLevel: 1 | 2 | 3): { nodes: LayoutNode[]; edges: LayoutEdge[]; totalHeight: number; totalWidth: number } {
    const nodes: LayoutNode[] = [];
    const edges: LayoutEdge[] = [];
    const centerX = 300;
    let y = 30;

    const filteredSteps = steps.filter((s) => {
        if (zoomLevel === 1) return !s.decision;
        return true;
    });

    for (let i = 0; i < filteredSteps.length; i++) {
        const step = filteredSteps[i];
        const hasDecision = step.decision && zoomLevel >= 2;

        const node: LayoutNode = {
            id: step.id,
            x: centerX - NODE_W / 2,
            y,
            width: NODE_W,
            height: hasDecision ? DECISION_H : NODE_H,
            type: hasDecision ? "decision" : "step",
            label: step.action,
            actor: step.actor,
            notes: zoomLevel >= 3 ? step.notes : undefined,
        };

        if (hasDecision && step.decision) {
            node.secondaryLabel = step.decision.question;
            node.optionALabel = step.decision.optionA.label;
            node.optionBLabel = step.decision.optionB.label;
            node.branchTargetA = step.decision.optionA.nextStepId;
            node.branchTargetB = step.decision.optionB.nextStepId;
        }

        nodes.push(node);

        // Notes node below step if zoom level 3
        if (zoomLevel >= 3 && step.notes) {
            y += node.height + 8;
            nodes.push({
                id: `${step.id}-notes`,
                x: centerX - NODE_W / 2 + 20,
                y,
                width: NODE_W - 40,
                height: 32,
                type: "step",
                label: step.notes,
            });
            y += 32;
        }

        // Edge to next node
        if (i < filteredSteps.length - 1) {
            const nextY = y + node.height + GAP_Y;

            if (hasDecision && step.decision) {
                // Branch edges
                edges.push({
                    fromX: centerX - NODE_W / 2,
                    fromY: y + node.height / 2,
                    toX: centerX - BRANCH_X_OFFSET,
                    toY: nextY,
                    label: step.decision.optionA.label,
                    curved: true,
                    controlPoints: [
                        { x: centerX - BRANCH_X_OFFSET, y: y + node.height / 2 },
                    ],
                });
                edges.push({
                    fromX: centerX + NODE_W / 2,
                    fromY: y + node.height / 2,
                    toX: centerX + BRANCH_X_OFFSET,
                    toY: nextY,
                    label: step.decision.optionB.label,
                    curved: true,
                    controlPoints: [
                        { x: centerX + BRANCH_X_OFFSET, y: y + node.height / 2 },
                    ],
                });
            }

            edges.push({
                fromX: centerX,
                fromY: y + node.height,
                toX: centerX,
                toY: nextY,
            });
        }

        y += node.height + GAP_Y;
    }

    return {
        nodes,
        edges,
        totalHeight: y + 20,
        totalWidth: centerX * 2,
    };
}

export default function FlowchartView({ steps, title, zoomLevel }: FlowchartViewProps) {
    const { nodes, edges, totalHeight, totalWidth } = useMemo(
        () => layoutNodes(steps, zoomLevel),
        [steps, zoomLevel]
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
                {edges.map((edge, i) => (
                    <g key={`edge-${i}`}>
                        {edge.curved && edge.controlPoints ? (
                            <path
                                d={`M ${edge.fromX} ${edge.fromY} Q ${edge.controlPoints[0].x} ${edge.controlPoints[0].y} ${edge.toX} ${edge.toY}`}
                                fill="none"
                                stroke="#6366f1"
                                strokeWidth="1.5"
                                opacity={0.4}
                                markerEnd="url(#arrowhead)"
                            />
                        ) : (
                            <line
                                x1={edge.fromX}
                                y1={edge.fromY}
                                x2={edge.toX}
                                y2={edge.toY}
                                stroke="#6366f1"
                                strokeWidth="1.5"
                                opacity={0.4}
                                markerEnd="url(#arrowhead)"
                            />
                        )}
                        {edge.label && (
                            <text
                                x={(edge.fromX + edge.toX) / 2 + (edge.toX > edge.fromX ? 8 : -8)}
                                y={(edge.fromY + edge.toY) / 2}
                                textAnchor="middle"
                                fill="#f59e0b"
                                fontSize="10"
                                fontWeight="600"
                                fontFamily="var(--font-sans)"
                            >
                                {edge.label}
                            </text>
                        )}
                    </g>
                ))}

                {/* Nodes */}
                {nodes.map((node) => (
                    <g key={node.id}>
                        {node.type === "decision" ? (
                            <>
                                <rect
                                    x={node.x}
                                    y={node.y}
                                    width={node.width}
                                    height={node.height}
                                    rx={12}
                                    fill="url(#decisionGrad)"
                                    stroke="#f59e0b"
                                    strokeWidth="1.5"
                                    opacity={0.9}
                                />
                                <text x={node.x + 12} y={node.y + 20} fill="#f0f0f5" fontSize="12" fontWeight="600" fontFamily="var(--font-sans)">
                                    {node.label.length > 40 ? node.label.slice(0, 37) + "..." : node.label}
                                </text>
                                {node.secondaryLabel && (
                                    <text x={node.x + 12} y={node.y + 38} fill="#fbbf24" fontSize="10" fontFamily="var(--font-sans)">
                                        ◇ {node.secondaryLabel.length > 45 ? node.secondaryLabel.slice(0, 42) + "..." : node.secondaryLabel}
                                    </text>
                                )}
                                {node.actor && (
                                    <text x={node.x + node.width - 8} y={node.y + 20} textAnchor="end" fill="#5a5a78" fontSize="9" fontFamily="var(--font-sans)">
                                        {node.actor}
                                    </text>
                                )}
                            </>
                        ) : node.id.endsWith("-notes") ? (
                            <>
                                <rect x={node.x} y={node.y} width={node.width} height={node.height} rx={6} fill="rgba(99, 102, 241, 0.08)" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="1" />
                                <text x={node.x + 8} y={node.y + 20} fill="#9595b0" fontSize="10" fontStyle="italic" fontFamily="var(--font-sans)">
                                    📝 {node.label.length > 50 ? node.label.slice(0, 47) + "..." : node.label}
                                </text>
                            </>
                        ) : (
                            <>
                                <rect
                                    x={node.x}
                                    y={node.y}
                                    width={node.width}
                                    height={node.height}
                                    rx={12}
                                    fill="url(#nodeGrad)"
                                    stroke="#2a2a45"
                                    strokeWidth="1.5"
                                />
                                <text x={node.x + 12} y={node.y + 22} fill="#f0f0f5" fontSize="12" fontWeight="500" fontFamily="var(--font-sans)">
                                    {node.label.length > 40 ? node.label.slice(0, 37) + "..." : node.label}
                                </text>
                                {node.actor && (
                                    <text x={node.x + 12} y={node.y + 40} fill="#5a5a78" fontSize="10" fontFamily="var(--font-sans)">
                                        👤 {node.actor}
                                    </text>
                                )}
                            </>
                        )}
                    </g>
                ))}
            </svg>
        </div>
    );
}
