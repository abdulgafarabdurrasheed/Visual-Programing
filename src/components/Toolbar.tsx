import React from 'react';

interface ToolbarProps {
  onRun: () => void;
  onStop: () => void;
  onClear: () => void;
  onFitView: () => void;
  onSave?: () => void;
  onLoad?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isRunning: boolean;
  nodeCount: number;
  wireCount: number;
  zoom: number;
}

const Toolbar: React.FC<ToolbarProps> = ({ onRun, onStop, onClear, onFitView, onSave, onLoad, isRunning, nodeCount, wireCount, zoom }) => {  return (
    <div 
      style={{ 
        position: 'absolute',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 20px',
        borderRadius: 14,
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
      }}
    >
      <button
        onClick={isRunning ? onStop : onRun}
        style={{ 
          background: isRunning ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)', 
          color: isRunning ? '#f43f5e' : '#10b981', 
          minWidth: 100,
          padding: '8px 20px',
          borderRadius: 10,
          border: `1px solid ${isRunning ? 'rgba(244, 63, 94, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: '0.1em',
          cursor: 'pointer',
          transition: 'all 0.2s',
          boxShadow: isRunning ? '0 0 12px rgba(244, 63, 94, 0.2)' : '0 0 12px rgba(16, 185, 129, 0.2)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.filter = 'brightness(1.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.filter = 'brightness(1)';
        }}
      >
        {isRunning ? '⏹ STOP' : '▶ RUN'}
      </button>

      <div style={{ width: 1, height: 24, background: 'rgba(0,0,0,0.08)', margin: '0 4px' }} />

      <div style={{ display: 'flex', gap: 4 }}>
        <button 
          onClick={onClear} 
          style={{ 
            padding: '8px 14px', 
            fontSize: 11, 
            fontWeight: 600,
            borderRadius: 8, 
            color: '#334155',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }} 
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; e.currentTarget.style.color = '#0f172a'; }} 
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#334155'; }}
        >
          Clear
        </button>

        <button 
          onClick={onFitView} 
          style={{ 
            padding: '8px 14px', 
            fontSize: 11, 
            fontWeight: 600,
            borderRadius: 8, 
            color: '#334155',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }} 
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; e.currentTarget.style.color = '#0f172a'; }} 
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#334155'; }}
        >
          Fit View
        </button>

        <button
          onClick={onSave}
          style={{ padding: '8px 14px', fontSize: 11, fontWeight: 600, borderRadius: 8, color: '#334155', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05'; e.currentTarget.style.color = '#0f172a'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#334155' }}
        >Save</button>

        <button 
          onClick={() => { const el = document.getElementById('graph-upload'); el && el.click(); }} 
          style={{ padding: '8px 14px', fontSize: 11, fontWeight: 600, borderRadius: 8, color: '#334155', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }} 
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; e.currentTarget.style.color = '#0f172a'; }} 
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#334155'; }}
        >Load</button>
        {onLoad && <input id="graph-upload" type='file' accept='.json' style={{ display: 'none' }} onChange={onLoad} />}
      </div>

      <div style={{ width: 1, height: 24, background: 'rgba(0,0,0,0.08)', margin: '0 4px' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 10, fontWeight: 600, color: '#334155', paddingLeft: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#6366f1' }}>NODE</span>
          <span style={{ color: '#334155' }}>{nodeCount}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#f59e0b' }}>WIRE</span>
          <span style={{ color: '#334155' }}>{wireCount}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#22d3ee' }}>VIEW</span>
          <span style={{ color: '#334155' }}>{Math.round(zoom * 100)}%</span>
        </div>
      </div>
    </div>
  );
};
export default React.memo(Toolbar);