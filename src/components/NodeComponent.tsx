import React from 'react';
import type { NodeData, Port, PortType } from '../types';
import { PORT_COLORS, CATEGORY_COLORS } from '../types';

interface NodeComponentProps {
  node: NodeData;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent, nodeId: string) => void;
  onPortMouseDown: (e: React.MouseEvent, nodeId: string, portId: string, type: PortType, direction: 'input' | 'output') => void;
  onPortMouseUp: (e: React.MouseEvent, nodeId: string, portId: string, type: PortType, direction: 'input' | 'output') => void;
  onNodeDataChange: (nodeId: string, data: Record<string, any>) => void;
}

const NodeComponent: React.FC<NodeComponentProps> = ({
  node, isSelected, onMouseDown, onPortMouseDown, onPortMouseUp, onNodeDataChange
}) => {
  const color = CATEGORY_COLORS[node.category] || '#6366f1';

  const renderPort = (port: Port) => {
    const isExec = port.type === 'exec';
    const portColor = PORT_COLORS[port.type] || '#94a3b8';

    return (
      <div key={port.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '28px' }}>
        {port.direction === 'input' && (
          <div
            style={{ marginLeft: '-6px', zIndex: 10, cursor: 'crosshair', width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseDown={(e) => onPortMouseDown(e, node.id, port.id, port.type, 'input')}
            onMouseUp={(e) => onPortMouseUp(e, node.id, port.id, port.type, 'input')}
          >
            {isExec ? (
              <svg viewBox="0 0 10 10" width="10" height="10" style={{ color: portColor }}>
                <polygon points="0,0 10,5 0,10" fill="currentColor"/>
              </svg>
            ) : (
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: portColor, outline: `1px solid ${portColor}`, outlineOffset: '1px' }} />
            )}
          </div>
        )}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0, alignItems: port.direction === 'input' ? 'flex-start' : 'flex-end' }}>
          <span style={{ fontSize: '10px', fontWeight: 500, color: '#cbd5e1', letterSpacing: '0.025em' }}>{port.label}</span>
        </div>

        {port.direction === 'output' && (
          <div
            style={{ marginRight: '-6px', zIndex: 10, cursor: 'crosshair', width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseDown={(e) => onPortMouseDown(e, node.id, port.id, port.type, 'output')}
            onMouseUp={(e) => onPortMouseUp(e, node.id, port.id, port.type, 'output')}
          >
            {isExec ? (
              <svg viewBox="0 0 10 10" width="10" height="10" style={{ color: portColor }}>
                <polygon points="0,0 10,5 0,10" fill="currentColor"/>
              </svg>
            ) : (
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: portColor, outline: `1px solid ${portColor}`, outlineOffset: '1px' }} />
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        position: 'absolute', left: node.x, top: node.y, width: '200px',
        background: 'linear-gradient(180deg, #16162a 0%, #0e0e1a 100%)',
        border: `1px solid ${isSelected ? color : '#2a2a4a'}`,
        borderRadius: '10px',
        boxShadow: isSelected ? `0 0 0 1px ${color}` : '0 8px 32px rgba(0,0,0,0.6)',
        userSelect: 'none', zIndex: isSelected ? 40 : 10,
        transition: 'box-shadow 0.2s',
      }}
      onMouseDown={(e) => onMouseDown(e, node.id)}
    >

      <div style={{
        height: '36px', background: `${color}15`, borderBottom: `1px solid ${color}30`,
        borderTopLeftRadius: '10px', borderTopRightRadius: '10px',
        display: 'flex', alignItems: 'center', gap: '8px', padding: '0 12px',
      }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color, boxShadow: `0 0 6px ${color}` }} />
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'white', letterSpacing: '0.05em' }}>{node.label}</span>
      </div>

      <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {node.data?.varName !== undefined && (
          <input
            style={{ width: '100%', padding: '4px 8px', fontSize: '10px', borderRadius: '4px', background: '#0a0a14', border: '1px solid #2a2a4a', color: '#cbd5e1', outline: 'none', boxSizing: 'border-box' }}
            placeholder="Variable name"
            value={node.data.varName}
            onChange={(e) => onNodeDataChange(node.id, { varName: e.target.value })}
            onMouseDown={(e) => e.stopPropagation()}
          />
        )}
        {node.data?.value !== undefined && (node.type === 'string_literal' || node.type === 'number_literal' || node.type === 'array_literal') && (
          <input
            type={node.type === 'number_literal' ? 'number' : 'text'}
            style={{ width: '100%', padding: '4px 8px', fontSize: '10px', borderRadius: '4px', background: '#0a0a14', border: '1px solid #2a2a4a', color: '#cbd5e1', outline: 'none', boxSizing: 'border-box' }}
            value={node.data.value}
            onChange={(e) => onNodeDataChange(node.id, { value: node.type === 'number_literal' ? Number(e.target.value) : e.target.value })}
            onMouseDown={(e) => e.stopPropagation()}
          />
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>{node.inputs.map(renderPort)}</div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>{node.outputs.map(renderPort)}</div>
        </div>
      </div>
    </div>
  );
};
export default React.memo(NodeComponent);