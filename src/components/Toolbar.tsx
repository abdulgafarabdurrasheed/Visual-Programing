import React from 'react';
import './Toolbar.css';

interface ToolbarProps {
  onRun: () => void;
  onStop: () => void;
  onClear: () => void;
  onFitView: () => void;
  isRunning: boolean;
  nodeCount: number;
  wireCount: number;
  zoom: number;
}

const Toolbar: React.FC<ToolbarProps> = ({ onRun, onStop, onClear, onFitView, isRunning, nodeCount, wireCount, zoom }) => {
  return (
    <div className="toolbar-container">
      <button
        onClick={isRunning ? onStop : onRun}
        className="tb-run-btn"
        style={{ 
          background: isRunning ? '#f43f5e20' : '#10b98120', 
          color: isRunning ? '#f43f5e' : '#10b981' 
        }}
      >
        {isRunning ? '⏹ STOP' : '▶ RUN'}
      </button>

      <div className="tb-divider" />

      <button onClick={onClear} className="tb-action-btn">Clear</button>
      <button onClick={onFitView} className="tb-action-btn">Fit View</button>

      <div className="tb-divider" />

      <div className="tb-stats">
        <span>nodes: {nodeCount}</span>
        <span>wires: {wireCount}</span>
        <span>zoom: {Math.round(zoom * 100)}%</span>
      </div>
    </div>
  );
};
export default React.memo(Toolbar);