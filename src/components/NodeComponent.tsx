import React from 'react';
import type { NodeData, Port } from '../types';
import { PORT_COLORS, CATEGORY_COLORS } from '../types';

interface NodeComponentProps {
  node: NodeData;
  onPortMouseDown: (e: React.MouseEvent, nodeId: string, portId: string, type: string, direction: 'input' | 'output') => void;
  onPortMouseUp: (e: React.MouseEvent, nodeId: string, portId: string) => void;
}

const NodeComponent: React.FC<NodeComponentProps> = ({ node, onPortMouseDown, onPortMouseUp }) => {
  const color = CATEGORY_COLORS[node.category] || '#6366f1';

  const renderPort = (port: Port) => {
    const isExec = port.type === 'exec';
    const portColor = PORT_COLORS[port.type] || '#94a3b8';

    return (
      <div key={port.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '28px' }}>
        {port.direction === 'input' && (
          <div style={{ marginLeft: '-6px', zIndex: 10, cursor: 'crosshair' }} onMouseDown={(e) => onPortMouseDown(e, node.id, port.id, port.type, 'input')} onMouseUp={(e) => onPortMouseUp(e, node.id, port.id)}>
            {isExec ? (
              <svg viewBox="0 0 10 10" width="10" height="10" style={{ color: portColor }}>
                <polygon points="0,0 10,5 0,10" fill="currentColor"/>
              </svg>
            ) : (
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: portColor }} />
            )}
          </div>
        )}
        <div style={{ flex: 1, fontSize: '10px', color: '#cbd5e1', fontWeight: 500, textAlign: port.direction === 'input' ? 'left' : 'right' }}>
          {port.label}
        </div>
        {port.direction === 'output' && (
          <div style={{ marginRight: '-6px', zIndex: 10, cursor: 'crosshair' }} onMouseDown={(e) => onPortMouseDown(e, node.id, port.id, port.type, 'output')} onMouseUp={(e) => onPortMouseUp(e, node.id, port.id)}>
            {isExec ? (
              <svg viewBox="0 0 10 10" width="10" height="10" style={{ color: portColor }}>
                <polygon points="0,0 10,5 0,10" fill="currentColor"/>
              </svg>
            ) : (
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: portColor }} />
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
        position: 'absolute', left: node.x, top: node.y, width: '200px',
        backgroundColor: 'var(--bg-card)', border: `1px solid var(--border-dim)`,
        borderRadius: '10px', boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        userSelect: 'none', zIndex: 10,
    }}>
      <div style={{
          height: '36px', backgroundColor: `${color}15`, borderBottom: `1px solid ${color}30`,
          borderTopLeftRadius: '10px', borderTopRightRadius: '10px',
          display: 'flex', alignItems: 'center', gap: '8px', padding: '0 12px',
      }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color }} />
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'white' }}>{node.label}</span>
      </div>
      <div style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>{node.inputs.map(renderPort)}</div>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>{node.outputs.map(renderPort)}</div>
      </div>
    </div>
  );
};
export default React.memo(NodeComponent);
