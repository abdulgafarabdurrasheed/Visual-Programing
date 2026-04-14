import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { ViewportState, NodeData } from './types';
import NodeComponent from './components/NodeComponent';
import WireLayer from './components/WireLayer';
import { Interpreter } from './interpreter';
import NodePalette from './components/NodePalette';
import { NODE_TEMPLATES } from './nodeTemplates';

function App() {
  const [viewport, setViewport] = useState<ViewportState>({ x: 0, y: 0, zoom: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [nodes, setNodes] = useState<NodeData[]>([])
  const [dragState, setDragState] = useState({ isDragging: false, nodeId: null as string | null, offsetX: 0, offsetY: 0 });
  const [wires, setWires] = useState<any[]>([]);
  const [drawingWire, setDrawingWire] = useState({ isDrawing: false, fromNodeId: '', fromPortId: '', fromType: '', fromDirection: '', mouseX: 0, mouseY: 0 });
  
  const handleRun = useCallback(() => {
    const engine = new Interpreter(nodes, wires);
    engine.run();
  }, [nodes, wires]);


  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/nodescript-template');
    if (!type) return;

    const template = NODE_TEMPLATES.find(t => t.type === type);
    if (!template) return;

    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;

    const dropX = (e.clientX - rect.left - viewport.x) / viewport.zoom;
    const dropY = (e.clientY - rect.top - viewport.y) / viewport.zoom;

    const newNode = template.createNode(dropX, dropY, `node_${Date.now()}`);
    setNodes(prev => [...prev, newNode]);
  }, [viewport]);

  
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

  const handlePortMouseDown = useCallback((e: React.MouseEvent, nodeId: string, portId: string, type: string, direction: 'input' | 'output') => {
    e.stopPropagation();
    setDrawingWire({
      isDrawing: true, fromNodeId: nodeId, fromPortId: portId, fromType: type, fromDirection: direction, mouseX: (e.clientX - viewport.x) / viewport.zoom, mouseY: (e.clientY - viewport.y) / viewport.zoom,
    });
  }, [viewport])

  const handlePortMouseUp = useCallback((
    _e: React.MouseEvent, nodeId: string, portId: string, portType: string, direction: 'input' | 'output'
  ) => {
    if (!drawingWire.isDrawing || !drawingWire.fromNodeId || !drawingWire.fromPortId) return;

    if (drawingWire.fromNodeId === nodeId) {
      setDrawingWire({ isDrawing: false, fromNodeId: '', fromPortId: '', fromType: '', fromDirection: '', mouseX: 0, mouseY: 0 });
      return;
    }

    if (drawingWire.fromDirection === direction) {
      setDrawingWire({ isDrawing: false, fromNodeId: '', fromPortId: '', fromType: '', fromDirection: '', mouseX: 0, mouseY: 0 });
      return;
    }

    const fromIsExec = drawingWire.fromType === 'exec';
    const toIsExec = portType === 'exec';
    
    if (fromIsExec !== toIsExec) {
      setDrawingWire({ isDrawing: false, fromNodeId: '', fromPortId: '', fromType: '', fromDirection: '', mouseX: 0, mouseY: 0 });
      return;
    }

    const destPortId = direction === 'input' ? portId : drawingWire.fromPortId;
    setWires(prev => prev.filter(w => w.toPortId !== destPortId));

    const fromNodeId = drawingWire.fromDirection === 'output' ? drawingWire.fromNodeId : nodeId;
    const fromPortId = drawingWire.fromDirection === 'output' ? drawingWire.fromPortId : portId;
    const toNodeId = drawingWire.fromDirection === 'output' ? nodeId : drawingWire.fromNodeId;
    const toPortId = drawingWire.fromDirection === 'output' ? portId : drawingWire.fromPortId;
    const wireType = fromIsExec ? 'exec' : (drawingWire.fromType || portType);

    const newWire = {
      id: `wire_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      fromNodeId,
      fromPortId,
      toNodeId,
      toPortId,
      type: wireType,
    };

    setWires(prev => [...prev, newWire]);
    setDrawingWire({ isDrawing: false, fromNodeId: '', fromPortId: '', fromType: '', fromDirection: '', mouseX: 0, mouseY: 0 });
  }, [drawingWire]);

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

    else if (drawingWire.isDrawing) {
        setDrawingWire(prev => ({
            ...prev,
            mouseX: (e.clientX - viewport.x) / viewport.zoom,
            mouseY: (e.clientY - viewport.y) / viewport.zoom
        }));
    }

    else if (isPanning) {
      setViewport(prev => ({
        ...prev,
        x: prev.x + e.movementX,
        y: prev.y + e.movementY
      }));
    }
  }, [isPanning, dragState, viewport, drawingWire]);


    const handleBoardMouseUp = useCallback(() => {
        setIsPanning(false);
        setDragState({ isDragging: false, nodeId: null, offsetX: 0, offsetY: 0 });
        setDrawingWire(prev => ({ ...prev, isDrawing: false }));
    }, []);


  const gridSize = 20 * viewport.zoom;
  const gridOffsetX = viewport.x % gridSize;
  const gridOffsetY = viewport.y % gridSize;

   return (
    <div className="app-container" style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'row' }}>
        
      <NodePalette />

      <div style={{ position: 'absolute', top: '20px', left: '60%', transform: 'translateX(-50%)', zIndex: 999 }}>
        <button
            onClick={handleRun}
            style={{ padding: '10px 30px', fontSize: '18px', fontWeight: 'bold', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)' }}
        >
            ▶ RUN
        </button>
      </div>  
      
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
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
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
            <WireLayer wires={wires} nodes={nodes} drawingWire={drawingWire} />
            
            {nodes.map(node => (
                <div key={node.id} onMouseDown={(e) => handleNodeMouseDown(e, node.id)}>
                    <NodeComponent
                        node={node}
                        onPortMouseDown={handlePortMouseDown}
                        onPortMouseUp={handlePortMouseUp}
                    />
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
export default App;