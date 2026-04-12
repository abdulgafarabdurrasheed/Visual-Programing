import React, { useMemo } from 'react';
import type { Wire, NodeData } from '../types';
import { PORT_COLORS } from '../types';

interface WireLayerProps {
    wires: Wire[];
    nodes: NodeData[];
    drawingWire: any;
}

function getPortPosition(nodes: NodeData[], nodeId: string, portId: string): { x: number; y: number } | null {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return null;

    const inputIdx = node.inputs.findIndex(p => p.id === portId);
    const outputIdx = node.outputs.findIndex(p => p.id === portId);

    const nodeWidth = 200;
    const headerHeight = 36;
    const portSpacing = 28;
    const portStartY = headerHeight + 16;

    if (inputIdx >= 0) {
        return { x: node.x + 6, y: node.y + portStartY + inputIdx * portSpacing };
    }
    if (outputIdx >= 0) {
        return { x: node.x + nodeWidth - 6, y: node.y + portStartY + outputIdx * portSpacing };
    }
    return null;
}

function buildBeizierPath(x1: number, y1: number, x2: number, y2: number): string {
    const dx = Math.abs(x2 - x1);
    const controlOffset = Math.max(50, dx * 0.5);
    return `M ${x1} ${y1} C ${x1 + controlOffset} ${y1}, ${x2 - controlOffset} ${y2}, ${x2} ${y2}`;
}

const WireLayer: React.FC<WireLayerProps> = ({ wires, nodes, drawingWire }) => {
    return (
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}>
            {wires.map(wire => {
                const from = getPortPosition(nodes, wire.fromNodeId, wire.fromPortId);
                const to = getPortPosition(nodes, wire.toNodeId, wire.toPortId);
                if (!from || !to) return null;

                const path = buildBeizierPath(from.x, from.y, to.x, to.y);
                const color = PORT_COLORS[wire.type] || '#6366f1'

                return <path key={wire.id} d={path} fill="none" stroke={color} strokeWidth={wire.type === 'exec' ? 3 : 2} />;
            })}

            {drawingWire.isDrawing && drawingWire.fromNodeId && drawingWire.fromPortId && (
                (() => {
                    const from = getPortPosition(nodes, drawingWire.fromNodeId, drawingWire.fromPortId);
                    if (!from) return null

                    const isOutput = drawingWire.fromDirection === 'output';
                    const x1 = isOutput ? from.x : drawingWire.mouseX;
                    const y1 = isOutput ? from.y : drawingWire.mouseY;
                    const x2 = isOutput ? drawingWire.mouseX : from.x;
                    const y2 = isOutput ? drawingWire.mouseY : from.y;

                    const path = buildBeizierPath(x1, y1, x2, y2);
                    const color = PORT_COLORS[drawingWire.fromType as keyof typeof PORT_COLORS] || '#94a3b8';

                    return <path d={path} fill="none" stroke={color} strokeWidth={2} strokeOpacity={0.6} strokeDasharray="6 4" />;
                })()
            )}
        </svg>
    )
}

export default React.memo(WireLayer);