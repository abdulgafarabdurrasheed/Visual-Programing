import React, { useState, useMemo } from 'react';
import type { NodeTemplate } from '../nodeTemplates';
import { NODE_TEMPLATES } from '../nodeTemplates';
import type { NodeCategory } from '../types';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../types';
import './NodePalette.css';

const CATEGORIES: { key: NodeCategory; label: string }[] = [
  { key: 'event', label: 'Events' },
  { key: 'flow', label: 'Flow Control' },
  { key: 'logic', label: 'Logic' },
  { key: 'math', label: 'Math' },
  { key: 'variable', label: 'Variables' },
  { key: 'io', label: 'Input/Output' },
  { key: 'array', label: 'Arrays' },
];

interface NodePaletteProps {
  onAddNode: (template: NodeTemplate, x?: number, y?: number) => void;
}

export function NodePalette({ onAddNode }: NodePaletteProps) {
  const [search, setSearch] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<NodeCategory | null>('event');

  const filtered = useMemo(() => {
    if (!search.trim()) return NODE_TEMPLATES;
    const q = search.toLowerCase();
    return NODE_TEMPLATES.filter(
      t => t.label.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    );
  }, [search]);

  const grouped = useMemo(() => {
    const map: Partial<Record<NodeCategory, NodeTemplate[]>> = {};
    for (const t of filtered) {
      if (!map[t.category]) map[t.category] = [];
      map[t.category]!.push(t);
    }
    return map;
  }, [filtered]);

  const handleDragStart = (e: React.DragEvent, template: NodeTemplate) => {
    e.dataTransfer.setData('application/nodescript-template', template.type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="node-palette-container">
      <div className="np-header">
        <div className="np-title-row">
          <h2 className="np-title">NODES</h2>
        </div>
        <input 
          type="text" 
          placeholder="Search nodes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)} 
          className="np-search" 
        />
      </div>
      <div className="np-content">
        {CATEGORIES.map(cat => {
          const templates = grouped[cat.key];
          if (!templates || templates.length === 0) return null;
          const isExpanded = expandedCategory === cat.key || search.trim().length > 0;
          const color = CATEGORY_COLORS[cat.key];
          const icon = CATEGORY_ICONS[cat.key];
          return (
            <div key={cat.key} style={{ marginBottom: '4px' }}>
              <button 
                className="np-category-btn" 
                style={{ color, background: isExpanded ? `${color}1A` : 'transparent' }} 
                onClick={() => setExpandedCategory(isExpanded && !search ? null : cat.key)}
              >
                <span>{icon}</span><span>{cat.label}</span>
                <span className="np-category-count">{templates.length}</span>
              </button>
              {isExpanded && (
                <div className="np-list">
                  {templates.map(t => (
                    <div 
                      key={t.type} 
                      draggable 
                      onDragStart={(e) => handleDragStart(e, t)} 
                      className="np-item"
                      onClick={() => onAddNode && onAddNode(t, 400 + Math.random() * 200, 200 + Math.random() * 200)}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = `${color}1A`; }} 
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      <div className="np-item-dot" style={{ background: color, boxShadow: `0 0 4px ${color}60` }} />
                      <div className="np-item-text">
                        <div className="np-item-label">{t.label}</div>
                        <div className="np-item-desc">{t.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default React.memo(NodePalette);
