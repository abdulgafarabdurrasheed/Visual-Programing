import React from 'react';
import type { NodeData, Port, PortType } from '../types';
import { PORT_COLORS, CATEGORY_COLORS } from '../types';

export interface NodeComponentProps {
  node: NodeData;
  isActive: boolean;
  isSelected?: boolean;
  onMouseDown: (e: React.MouseEvent, nodeId: string) => void;
  onPortMouseDown: (e: React.MouseEvent, nodeId: string, portId: string, portType: PortType, direction: 'input' | 'output') => void;
  onPortMouseUp: (e: React.MouseEvent, nodeId: string, portId: string, portType: PortType, direction: 'input' | 'output') => void;
  onNodeDataChange: (nodeId: string, key: string, value: any) => void;
}

const NodeComponent: React.FC<NodeComponentProps> = ({
  node, isActive, isSelected, onMouseDown, onPortMouseDown, onPortMouseUp, onNodeDataChange
}) => {
  const color = CATEGORY_COLORS[node.category] || '#6366f1';
  const width = node.width || 200;

  const renderPort = (port: Port) => {
    const isExec = port.type === 'exec';
    return (
      <div key={port.id} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 28, position: 'relative' }}>
        {port.direction === 'input' && (
          <div
            style={{ 
              width: 16, height: 16, cursor: 'crosshair',
              marginLeft: isExec ? -10 : -8,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            onMouseDown={(e) => onPortMouseDown(e, node.id, port.id, port.type, 'input')}
            onMouseUp={(e) => onPortMouseUp(e, node.id, port.id, port.type, 'input')}
          >
            {isExec ? (
               <svg viewBox="0 0 10 10" width="10" height="10" style={{ color: PORT_COLORS[port.type], transition: 'transform 0.2s' }}>
                 <polygon points="0,0 10,5 0,10" fill="currentColor"/>
               </svg>
            ) : (
               <div 
                 style={{ 
                   width: 10, height: 10, borderRadius: '50%', 
                   backgroundColor: PORT_COLORS[port.type] || '#334155',
                   border: `1.5px solid ${PORT_COLORS[port.type]}40`,
                   transition: 'transform 0.2s'
                 }} 
               />
            )}
          </div>
        )}

        <div style={{ 
          flex: 1, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', minWidth: 0,
          alignItems: port.direction === 'input' ? 'flex-start' : 'flex-end',
          textAlign: port.direction === 'input' ? 'left' : 'right'
        }}>
          <span style={{ 
            fontSize: 10, fontWeight: 600, letterSpacing: '0.02em', 
            color: '#334155', whiteSpace: 'nowrap',
            overflow: 'hidden', textOverflow: 'ellipsis', width: '100%'
          }}>
            {port.label}
          </span>
          {port.direction === 'input' && port.type !== 'exec' && (
            <input
              type={port.type === 'number' ? 'number' : 'text'}
              style={{
                marginTop: 2, width: 64, padding: '2px 6px',
                fontSize: 9, borderRadius: 4,
                background: 'rgba(0,0,0,0.05)',
                border: '1px solid #cbd5e1',
                color: '#0f172a', outline: 'none',
                transition: 'border-color 0.2s'
              }}
              value={port.value ?? ''}
              onChange={(e) => {
                const val = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
                onNodeDataChange(node.id, `__port__${port.id}`, val);
              }}
              onMouseDown={(e) => e.stopPropagation()}
            />
          )}
        </div>

        {port.direction === 'output' && (
           <div
             style={{ 
               width: 16, height: 16, cursor: 'crosshair',
               marginRight: isExec ? -10 : -8,
               display: 'flex', alignItems: 'center', justifyContent: 'center'
             }}
             onMouseDown={(e) => onPortMouseDown(e, node.id, port.id, port.type, 'output')}
             onMouseUp={(e) => onPortMouseUp(e, node.id, port.id, port.type, 'output')}
           >
             {isExec ? (
                <svg viewBox="0 0 10 10" width="10" height="10" style={{ color: PORT_COLORS[port.type], transition: 'transform 0.2s' }}>
                  <polygon points="0,0 10,5 0,10" fill="currentColor"/>
                </svg>
             ) : (
                <div 
                  style={{ 
                    width: 10, height: 10, borderRadius: '50%', 
                    backgroundColor: PORT_COLORS[port.type] || '#334155',
                    border: `1.5px solid ${PORT_COLORS[port.type]}40`,
                    transition: 'transform 0.2s'
                  }} 
                />
             )}
           </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="node-enter"
      style={{
        position: 'absolute',
        left: node.x, top: node.y, width,
        borderRadius: 12,
        userSelect: 'none',
        zIndex: isActive ? 100 : isSelected ? 50 : 10,
        background: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)',
        border: `1px solid ${isSelected ? color : '#cbd5e1'}`,
        boxShadow: isActive 
          ? `0 4px 16px rgba(0,0,0,0.15), 0 0 0 1px ${color}` 
          : isSelected 
            ? `0 4px 16px rgba(0,0,0,0.1), 0 0 0 1px ${color}` 
            : '0 4px 16px rgba(255,255,255,0.7)',
        transition: 'box-shadow 0.2s, border-color 0.2s',
        overflow: 'visible',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseDown={(e) => onMouseDown(e, node.id)}
    >
      <div
        style={{ 
          height: 36, padding: '0 12px', gap: 8,
          display: 'flex', alignItems: 'center',
          background: `${color}15`, 
          borderBottom: `1px solid ${color}30`,
          borderTopLeftRadius: 11, borderTopRightRadius: 11
        }}
      >
        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: color }} />
        <span style={{ 
          fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', color: '#0f172a',
          textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
        }}>
          {node.label}
        </span>
      </div>

      <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {node.data?.varName !== undefined && (
          <input
            style={{
              width: '100%', padding: '6px 10px', fontSize: 10, borderRadius: 6,
              background: 'rgba(255,255,255,0.7)', border: '1px solid #cbd5e1',
              color: '#0f172a', outline: 'none', transition: 'border-color 0.2s',
              boxSizing: 'border-box'
            }}
            placeholder="Variable name"
            value={node.data.varName}
            onChange={(e) => onNodeDataChange(node.id, 'varName', e.target.value)}
            onMouseDown={(e) => e.stopPropagation()}
          />
        )}
        {node.data?.value !== undefined && (node.type === 'string_literal' || node.type === 'number_literal' || node.type === 'array_literal') && (
          <input
            type={node.type === 'number_literal' ? 'number' : 'text'}
            style={{
              width: '100%', padding: '6px 10px', fontSize: 10, borderRadius: 6,
              background: 'rgba(255,255,255,0.7)', border: '1px solid #cbd5e1',
              color: '#0f172a', outline: 'none', transition: 'border-color 0.2s',
              boxSizing: 'border-box'
            }}
            value={node.data.value}
            onChange={(e) => onNodeDataChange(node.id, 'value', node.type === 'number_literal' ? Number(e.target.value) : e.target.value)}
            onMouseDown={(e) => e.stopPropagation()}
          />
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 2 }}>{node.inputs.map(renderPort)}</div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 2 }}>{node.outputs.map(renderPort)}</div>
        </div>
      </div>
    </div>
  );
};
export default React.memo(NodeComponent);