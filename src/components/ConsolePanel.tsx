import React, { useRef, useEffect } from 'react';
import type { ConsoleEntry } from '../types';
import './ConsolePanel.css';

interface ConsolePanelProps {
  entries: ConsoleEntry[];
  onClear: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const TYPE_STYLES: Record<ConsoleEntry['type'], { color: string; icon: string; bg: string }> = {
  log: { color: '#0f172a', icon: '›', bg: 'transparent' },
  error: { color: '#f43f5e', icon: '✕', bg: '#f43f5e08' },
  warn: { color: '#f59e0b', icon: '⚠', bg: '#f59e0b08' },
  info: { color: '#22d3ee', icon: 'ℹ', bg: '#22d3ee08' },
};

const ConsolePanel: React.FC<ConsolePanelProps> = ({ entries, onClear, isOpen, onToggle }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  return (
    <div className="console-container" style={{ height: isOpen ? 220 : 36 }}>
      <div
        className="console-header"
        style={{ borderBottom: isOpen ? '1px solid #cbd5e1' : 'none' }}
        onClick={onToggle}
      >
        <div className="console-header-left">
          <span style={{ fontSize: '10px', color: '#334155', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', display: 'inline-block' }}>▶</span>
          <span className="console-label">CONSOLE</span>
          {entries.length > 0 && (
            <span className="console-badge">{entries.length}</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="console-clear-btn"
            onClick={(e) => { e.stopPropagation(); onClear(); }}
          >
            Clear
          </button>
          <svg
            className="console-chevron"
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <path d="M3 5l3 3 3-3" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div ref={scrollRef} className="console-output">
          {entries.length === 0 ? (
            <div className="console-empty">Program output will appear here...</div>
          ) : (
            entries.map(entry => {
              const style = TYPE_STYLES[entry.type];
              return (
                <div key={entry.id} className="console-entry" style={{ color: style.color, background: style.bg }}>
                  <span className="console-entry-icon">{style.icon}</span>
                  <span className="console-entry-msg">{entry.message}</span>
                  <span className="console-entry-time">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
export default React.memo(ConsolePanel);