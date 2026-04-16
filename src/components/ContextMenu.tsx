import React, { useState, useMemo } from 'react';
import type { NodeTemplate } from '../nodeTemplates';
import { NODE_TEMPLATES } from '../nodeTemplates';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../types';
import './ContextMenu.css';

interface ContextMenuProps {
  x: number;
  y: number;
  onAddNode: (template: NodeTemplate) => void;
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onAddNode, onClose }) => {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return NODE_TEMPLATES;
    const q = search.toLowerCase();
    return NODE_TEMPLATES.filter(
      t => t.label.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <>
      <div className="ctx-backdrop" onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose(); }} />
      <div className="ctx-menu" style={{ left: x, top: y }}>
        <div className="ctx-search-wrap">
          <input
            type="text"
            placeholder="Search nodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            className="ctx-search"
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
              if (e.key === 'Enter' && filtered.length > 0) { onAddNode(filtered[0]); onClose(); }
            }}
          />
        </div>
        <div className="ctx-list">
          {filtered.map(t => {
            const color = CATEGORY_COLORS[t.category];
            const icon = CATEGORY_ICONS[t.category];
            return (
              <button
                key={t.type}
                className="ctx-item"
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = `${color}12`; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                onClick={() => { onAddNode(t); onClose(); }}
              >
                <span style={{ fontSize: '12px' }}>{icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="ctx-item-label">{t.label}</div>
                  <div className="ctx-item-desc">{t.description}</div>
                </div>
                <div className="ctx-item-bar" style={{ background: `${color}40` }} />
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
export default React.memo(ContextMenu);