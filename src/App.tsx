import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { ViewportState, NodeData } from './types';
import NodeComponent from './components/NodeComponent';

const MOCK_NODE: NodeData = {
    id: 'node_1',
    type: 'print',
    category: 'io',
    label: 'Print to Console',
    x: window.innerWidth / 2 - 100,
    y: window.innerHeight / 2 - 50,
    inputs: [
        { id: 'p1', label: 'Exec', type: 'exec', direction: 'input' },
        { id: 'p2', label: 'Message', type: 'string', direction: 'input', value: 'Hello World!' }
    ],
    outputs: [
        { id: 'p3', label: 'Exec', type: 'exec', direction: 'output' }
    ]
};

function App() {
  const [viewport, setViewport] = useState<ViewportState>({ x: 0, y: 0, zoom: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [nodes, setNodes] = useState<NodeData[]>([MOCK_NODE])
  const [dragState, setDragState] = useState({ isDragging: false, nodeId: null as string | null, offsetX: 0, offsetY: 0 });
  
  const boardRef = useRef<HTMLDivElement>(null);

  const handleNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
     e.stopPropagation();
     const node = nodes.find(n => n.id === nodeId);
     if (node) {
        setDragState({
            isDragging: true,
            nodeId,
            offsetX: (e.clientX - viewport.x) / viewport.zoom - node.x,
            offsetY: (e.clientY - viewport.y) / viewport.zoom - node.y
        });
     }
  }, [nodes, viewport])

  const handleBoardMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === boardRef.current) {
      setIsPanning(true);
    }
  }, []);

    const handleBoardMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragState.isDragging && dragState.nodeId) {
      const mouseX = (e.clientX - viewport.x) / viewport.zoom;
      const mouseY = (e.clientY - viewport.y) / viewport.zoom;

      setNodes(prev => prev.map(n => 
        n.id === dragState.nodeId 
          ? { ...n, x: mouseX - dragState.offsetX, y: mouseY - dragState.offsetY } 
          : n
      ));
    } 
    else if (isPanning) {
      setViewport(prev => ({
        ...prev,
        x: prev.x + e.movementX,
        y: prev.y + e.movementY
      }));
    }
  }, [isPanning, dragState, viewport]);


    const handleBoardMouseUp = useCallback(() => {
        setIsPanning(false);
        setDragState({ isDragging: false, nodeId: null, offsetX: 0, offsetY: 0 });
    }, []);


  const gridSize = 20 * viewport.zoom;
  const gridOffsetX = viewport.x % gridSize;
  const gridOffsetY = viewport.y % gridSize;

  return (
    <div className="app-container" style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <div
        ref={boardRef}
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          cursor: isPanning ? 'grabbing' : 'grab',
          backgroundImage: `radial-gradient(circle at ${gridOffsetX}px ${gridOffsetY}px, var(--border-dim) 1px, transparent 1px)`,
          backgroundSize: `${gridSize}px ${gridSize}px`
        }}
        onMouseDown={handleBoardMouseDown}
        onMouseMove={handleBoardMouseMove}
        onMouseUp={handleBoardMouseUp}
        onMouseLeave={handleBoardMouseUp}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
            transformOrigin: '0 0',
          }}
        >
            {nodes.map(node => (
                <div key={node.id} onMouseDown={(e) => handleNodeMouseDown(e, node.id)}>
                    <NodeComponent node={node} />
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default App;