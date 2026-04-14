import React, { useMemo } from 'react';
import type { Wire, NodeData } from '../types';
import { PORT_COLORS } from '../types';

interface WireLayerProps {
  wires: Wire[];
  nodes: NodeData[];
  drawingWire: {
    isDrawing: boolean;
    fromNodeId: string | null;
    fromPortId: string | null;
    fromType: string | null;
    fromDirection: string | null;
    mouseX: number;
    mouseY: number;
  };
}

function getPortPosition(nodes: NodeData[], nodeId: string, portId: string): { x: number; y: number } | null {
  const node = nodes.find(n => n.id === nodeId);
  if (!node) return null;
  const inputIdx = node.inputs.findIndex(p => p.id === portId);
  const outputIdx = node.outputs.findIndex(p => p.id === portId);
  const nodeWidth = 200;
  const headerHeight = 36;
  const bodyPadTop = 8;
  const bodyGap = 8;
  const portRowHeight = 28;
  const portCenter = 14;
  const inlineInputHeight = 20;

  let inlineOffset = 0;
  if (node.data?.varName !== undefined) {
    inlineOffset += inlineInputHeight + bodyGap;
  }
  if (node.data?.value !== undefined &&
      (node.type === 'string_literal' || node.type === 'number_literal' || node.type === 'array_literal')) {
    inlineOffset += inlineInputHeight + bodyGap;
  }

  const portStartY = headerHeight + bodyPadTop + inlineOffset + portCenter;

  if (inputIdx >= 0) {
    return { x: node.x + 6, y: node.y + portStartY + inputIdx * portRowHeight };
  }
  if (outputIdx >= 0) {
    return { x: node.x + nodeWidth - 6, y: node.y + portStartY + outputIdx * portRowHeight };
  }
  return null;
}


function buildBezierPath(x1: number, y1: number, x2: number, y2: number): string {
  const dx = Math.abs(x2 - x1);
  const controlOffset = Math.max(50, dx * 0.5);
  return `M ${x1} ${y1} C ${x1 + controlOffset} ${y1}, ${x2 - controlOffset} ${y2}, ${x2} ${y2}`;
}

const WireLayer: React.FC<WireLayerProps> = ({ wires, nodes, drawingWire }) => {
  const wireElements = useMemo(() => {
    return wires.map(wire => {
      const from = getPortPosition(nodes, wire.fromNodeId, wire.fromPortId);
      const to = getPortPosition(nodes, wire.toNodeId, wire.toPortId);
      if (!from || !to) return null;
      const color = PORT_COLORS[wire.type] || '#6366f1';
      const isExec = wire.type === 'exec';
      const path = buildBezierPath(from.x, from.y, to.x, to.y);
      return (
        <g key={wire.id}>
          <path d={path} fill="none" stroke={color} strokeWidth={isExec ? 4 : 3} strokeOpacity={0.1} filter="url(#glow)" />
          <path d={path} fill="none" stroke={color} strokeWidth={isExec ? 3 : 2} strokeOpacity={0.7} strokeLinecap="round" />
        </g>
      );
    });
  }, [wires, nodes]);

  const drawingWireElement = useMemo(() => {
    if (!drawingWire.isDrawing || !drawingWire.fromNodeId || !drawingWire.fromPortId) return null;
    const from = getPortPosition(nodes, drawingWire.fromNodeId, drawingWire.fromPortId);
    if (!from) return null;
    const isOutput = drawingWire.fromDirection === 'output';
    const x1 = isOutput ? from.x : drawingWire.mouseX;
    const y1 = isOutput ? from.y : drawingWire.mouseY;
    const x2 = isOutput ? drawingWire.mouseX : from.x;
    const y2 = isOutput ? drawingWire.mouseY : from.y;
    const path = buildBezierPath(x1, y1, x2, y2);
    const color = PORT_COLORS[(drawingWire.fromType as keyof typeof PORT_COLORS) || 'any'] || '#94a3b8';
    return <path d={path} fill="none" stroke={color} strokeWidth={2} strokeOpacity={0.5} strokeDasharray="6 4" />;
  }, [drawingWire, nodes]);

  return (
    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}>
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {wireElements}
      {drawingWireElement}
    </svg>
  );
};
export default React.memo(WireLayer);