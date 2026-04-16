import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { NodeData, Wire, PortType, ConsoleEntry, ViewportState } from './types';
import type { NodeTemplate } from './nodeTemplates';
import { NODE_TEMPLATES } from './nodeTemplates';
import { Interpreter } from './interpreter';
import NodeComponent from './components/NodeComponent';
import WireLayer from './components/WireLayer';
import NodePalette from './components/NodePalette';
import ConsolePanel from './components/ConsolePanel';
import Toolbar from './components/Toolbar';
import ContextMenu from './components/ContextMenu';

let _nodeIdCounter = 0;
const newId = () => `node_${++_nodeIdCounter}_${Date.now()}`;


function createDemoGraph(): { nodes: NodeData[]; wires: Wire[] } {
  const nodes: NodeData[] = [];
  const wires: Wire[] = [];
  const t = (type: string) => NODE_TEMPLATES.find(n => n.type === type)!;

  const startNode = t('start').createNode(60, 160, newId());
  nodes.push(startNode);

  const setSum0 = t('set_variable').createNode(320, 140, newId());
  setSum0.data = { varName: 'sum' };
  setSum0.inputs[1].value = 0;
  nodes.push(setSum0);

  const forLoop = t('for_loop').createNode(620, 120, newId());
  forLoop.inputs[1].value = 10;
  nodes.push(forLoop);

  const getSum = t('get_variable').createNode(620, 380, newId());
  getSum.data = { varName: 'sum' };
  nodes.push(getSum);

  const addOne = t('add').createNode(620, 520, newId());
  addOne.inputs[1].value = 1;
  nodes.push(addOne);

  const addToSum = t('add').createNode(920, 420, newId());
  nodes.push(addToSum);

  const setSumNew = t('set_variable').createNode(1200, 340, newId());
  setSumNew.data = { varName: 'sum' };
  nodes.push(setSumNew);

  const getSumFinal = t('get_variable').createNode(920, 120, newId());
  getSumFinal.data = { varName: 'sum' };
  nodes.push(getSumFinal);

  const toStr = t('to_string').createNode(1140, 140, newId());
  nodes.push(toStr);

  const printResult = t('print').createNode(1380, 100, newId());
  printResult.inputs[1].value = '';
  nodes.push(printResult);

  wires.push({ id: 'w1', fromNodeId: startNode.id, fromPortId: startNode.outputs[0].id, toNodeId: setSum0.id, toPortId: setSum0.inputs[0].id, type: 'exec' });
  wires.push({ id: 'w2', fromNodeId: setSum0.id, fromPortId: setSum0.outputs[0].id, toNodeId: forLoop.id, toPortId: forLoop.inputs[0].id, type: 'exec' });
  wires.push({ id: 'w3', fromNodeId: forLoop.id, fromPortId: forLoop.outputs[0].id, toNodeId: setSumNew.id, toPortId: setSumNew.inputs[0].id, type: 'exec' });
  wires.push({ id: 'w4', fromNodeId: forLoop.id, fromPortId: forLoop.outputs[2].id, toNodeId: printResult.id, toPortId: printResult.inputs[0].id, type: 'exec' });

  wires.push({ id: 'w5', fromNodeId: forLoop.id, fromPortId: forLoop.outputs[1].id, toNodeId: addOne.id, toPortId: addOne.inputs[0].id, type: 'number' });
  wires.push({ id: 'w6', fromNodeId: getSum.id, fromPortId: getSum.outputs[0].id, toNodeId: addToSum.id, toPortId: addToSum.inputs[0].id, type: 'any' });
  wires.push({ id: 'w7', fromNodeId: addOne.id, fromPortId: addOne.outputs[0].id, toNodeId: addToSum.id, toPortId: addToSum.inputs[1].id, type: 'number' });
  wires.push({ id: 'w8', fromNodeId: addToSum.id, fromPortId: addToSum.outputs[0].id, toNodeId: setSumNew.id, toPortId: setSumNew.inputs[1].id, type: 'number' });
  wires.push({ id: 'w9', fromNodeId: getSumFinal.id, fromPortId: getSumFinal.outputs[0].id, toNodeId: toStr.id, toPortId: toStr.inputs[0].id, type: 'any' });
  wires.push({ id: 'w10', fromNodeId: toStr.id, fromPortId: toStr.outputs[0].id, toNodeId: printResult.id, toPortId: printResult.inputs[1].id, type: 'string' });

  return { nodes, wires };
}

const App: React.FC = () => {
  const demo = useRef(createDemoGraph());
  const [nodes, setNodes] = useState<NodeData[]>(demo.current.nodes);
  const [wires, setWires] = useState<Wire[]>(demo.current.wires);
  const [viewport, setViewport] = useState<ViewportState>({ x: 0, y: 0, zoom: 1 });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [consoleEntries, setConsoleEntries] = useState<ConsoleEntry[]>([]);
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [isRunning, setIsRunning] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const interpreterRef = useRef<Interpreter | null>(null);

  const [drawingWire, setDrawingWire] = useState<{
    isDrawing: boolean;
    fromNodeId: string | null;
    fromPortId: string | null;
    fromType: PortType | null;
    fromDirection: 'input' | 'output' | null;
    mouseX: number;
    mouseY: number;
  }>({
    isDrawing: false, fromNodeId: null, fromPortId: null,
    fromType: null, fromDirection: null, mouseX: 0, mouseY: 0,
  });

  const [dragging, setDragging] = useState<{
    nodeId: string; offsetX: number; offsetY: number;
  } | null>(null);

  const [panning, setPanning] = useState<{
    startX: number; startY: number; vpX: number; vpY: number;
  } | null>(null);

  const boardRef = useRef<HTMLDivElement>(null);

  const screenToBoard = useCallback((screenX: number, screenY: number) => {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return { x: screenX, y: screenY };
    return {
      x: (screenX - rect.left - viewport.x) / viewport.zoom,
      y: (screenY - rect.top - viewport.y) / viewport.zoom,
    };
  }, [viewport]);

  const handleNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    const boardPos = screenToBoard(e.clientX, e.clientY);
    setDragging({
      nodeId,
      offsetX: boardPos.x - node.x,
      offsetY: boardPos.y - node.y,
    });
    setSelectedNodeId(nodeId);
  }, [nodes, screenToBoard]);

  const handlePortMouseDown = useCallback((
    e: React.MouseEvent, nodeId: string, portId: string, portType: PortType, direction: 'input' | 'output'
  ) => {
    e.stopPropagation();
    e.preventDefault();
    const boardPos = screenToBoard(e.clientX, e.clientY);
    setDrawingWire({
      isDrawing: true, fromNodeId: nodeId, fromPortId: portId,
      fromType: portType, fromDirection: direction,
      mouseX: boardPos.x, mouseY: boardPos.y,
    });
  }, [screenToBoard]);

  const handlePortMouseUp = useCallback((
    _e: React.MouseEvent, nodeId: string, portId: string, portType: PortType, direction: 'input' | 'output'
  ) => {
    if (!drawingWire.isDrawing || !drawingWire.fromNodeId || !drawingWire.fromPortId) return;

    if (drawingWire.fromNodeId === nodeId) {
      setDrawingWire({ isDrawing: false, fromNodeId: null, fromPortId: null, fromType: null, fromDirection: null, mouseX: 0, mouseY: 0 });
      return;
    }

    if (drawingWire.fromDirection === direction) {
      setDrawingWire({ isDrawing: false, fromNodeId: null, fromPortId: null, fromType: null, fromDirection: null, mouseX: 0, mouseY: 0 });
      return;
    }

    const fromIsExec = drawingWire.fromType === 'exec';
    const toIsExec = portType === 'exec';
    if (fromIsExec !== toIsExec) {
      setDrawingWire({ isDrawing: false, fromNodeId: null, fromPortId: null, fromType: null, fromDirection: null, mouseX: 0, mouseY: 0 });
      return;
    }

    const destPortId = direction === 'input' ? portId : drawingWire.fromPortId!;
    setWires(prev => prev.filter(w => w.toPortId !== destPortId));

    const fromNodeId = drawingWire.fromDirection === 'output' ? drawingWire.fromNodeId : nodeId;
    const fromPortId = drawingWire.fromDirection === 'output' ? drawingWire.fromPortId! : portId;
    const toNodeId = drawingWire.fromDirection === 'output' ? nodeId : drawingWire.fromNodeId;
    const toPortId = drawingWire.fromDirection === 'output' ? portId : drawingWire.fromPortId!;
    const wireType = fromIsExec ? 'exec' : (drawingWire.fromType || portType);

    const newWire: Wire = {
      id: `wire_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      fromNodeId, fromPortId, toNodeId, toPortId,
      type: wireType as PortType,
    };

    setWires(prev => [...prev, newWire]);
    setDrawingWire({ isDrawing: false, fromNodeId: null, fromPortId: null, fromType: null, fromDirection: null, mouseX: 0, mouseY: 0 });
  }, [drawingWire]);

  const handleBoardMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.target === boardRef.current)) {
      setPanning({ startX: e.clientX, startY: e.clientY, vpX: viewport.x, vpY: viewport.y });
      setSelectedNodeId(null);
    }
  }, [viewport]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const handleContextAddNode = useCallback((template: NodeTemplate) => {
    if (!contextMenu) return;
    const boardPos = screenToBoard(contextMenu.x, contextMenu.y);
    const node = template.createNode(boardPos.x, boardPos.y, newId());
    setNodes(prev => [...prev, node]);
    setContextMenu(null)
  }, [contextMenu, screenToBoard])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedNodeId) {
        setNodes(prev => prev.filter(n => n.id !== selectedNodeId));
        setWires(prev => prev.filter(w => w.fromNodeId !== selectedNodeId && w.toNodeId !== selectedNodeId));
        setSelectedNodeId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragging) {
        const boardPos = screenToBoard(e.clientX, e.clientY);
        setNodes(prev => prev.map(n =>
          n.id === dragging.nodeId
            ? { ...n, x: boardPos.x - dragging.offsetX, y: boardPos.y - dragging.offsetY }
            : n
        ));
      }
      if (drawingWire.isDrawing) {
        const boardPos = screenToBoard(e.clientX, e.clientY);
        setDrawingWire(prev => ({ ...prev, mouseX: boardPos.x, mouseY: boardPos.y }));
      }
      if (panning) {
        setViewport(prev => ({
          ...prev,
          x: panning.vpX + (e.clientX - panning.startX),
          y: panning.vpY + (e.clientY - panning.startY),
        }));
      }
    };

    const handleMouseUp = () => {
      setDragging(null);
      setPanning(null);
      if (drawingWire.isDrawing) {
        setDrawingWire({ isDrawing: false, fromNodeId: null, fromPortId: null, fromType: null, fromDirection: null, mouseX: 0, mouseY: 0 });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, drawingWire, panning, screenToBoard]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.92 : 1.08;
      setViewport(prev => {
        const newZoom = Math.min(2, Math.max(0.2, prev.zoom * zoomFactor));
        const rect = boardRef.current?.getBoundingClientRect();
        if (!rect) return { ...prev, zoom: newZoom };
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        return {
          x: mouseX - (mouseX - prev.x) * (newZoom / prev.zoom),
          y: mouseY - (mouseY - prev.y) * (newZoom / prev.zoom),
          zoom: newZoom,
        };
      });
    };
    const board = boardRef.current;
    if (board) {
      board.addEventListener('wheel', handleWheel, { passive: false });
      return () => board.removeEventListener('wheel', handleWheel);
    }
  }, []);

  const handleNodeDataChange = useCallback((nodeId: string, data: Record<string, any>) => {
    setNodes(prev => prev.map(n =>
      n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
    ));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const templateType = e.dataTransfer.getData('application/nodescript-template');
    if (!templateType) return;
    const template = NODE_TEMPLATES.find(t => t.type === templateType);
    if (!template) return;
    const boardPos = screenToBoard(e.clientX, e.clientY);
    const node = template.createNode(boardPos.x, boardPos.y, newId());
    setNodes(prev => [...prev, node]);
  }, [screenToBoard]);

  const handleRun = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
    setConsoleOpen(true);
    const interpreter = new Interpreter(
      nodes,
      wires,
      (entry) => setConsoleEntries(prev => [...prev, entry]),
      (nodeId) => setActiveNodeId(nodeId),
    );
    interpreterRef.current = interpreter;
    interpreter.run().then(() => {
      setIsRunning(false);
      setActiveNodeId(null);
    });
  }, [nodes, wires, isRunning]);

  const handleStop = useCallback(() => {
    interpreterRef.current?.stop();
    setIsRunning(false);
    setActiveNodeId(null);
  }, []);

  const handleClear = useCallback(() => {
    if (isRunning) return;
    setNodes([]);
    setWires([]);
    setSelectedNodeId(null);
  }, [isRunning]);

  const handleFitView = useCallback(() => {
    setViewport({ x: 0, y: 0, zoom: 1 });
  }, []);

  const gridSize = 20 * viewport.zoom;
  const gridOffsetX = viewport.x % gridSize;
  const gridOffsetY = viewport.y % gridSize;

    return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100vh', position: 'relative' }}>
      <Toolbar
        onRun={handleRun}
        onStop={handleStop}
        onClear={handleClear}
        onFitView={handleFitView}
        isRunning={isRunning}
        nodeCount={nodes.length}
        wireCount={wires.length}
        zoom={viewport.zoom}
      />

      <div style={{ display: 'flex', flex: 1, minHeight: 0, position: 'relative' }}>
        <NodePalette />

        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, position: 'relative' }}>
          <div
            ref={boardRef}
            style={{
              flex: 1, position: 'relative', overflow: 'hidden',
              cursor: panning ? 'grabbing' : dragging ? 'default' : 'grab',
              backgroundImage: `radial-gradient(circle at ${gridOffsetX}px ${gridOffsetY}px, #1a1a2e 1px, transparent 1px)`,
              backgroundSize: `${gridSize}px ${gridSize}px`,
            }}
            onMouseDown={handleBoardMouseDown}
            onContextMenu={handleContextMenu}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
          >
            <div
              style={{
                transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
                transformOrigin: '0 0',
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              }}
            >
              <WireLayer wires={wires} nodes={nodes} drawingWire={drawingWire} />

              {nodes.map(node => (
                <NodeComponent
                  key={node.id}
                  node={node}
                  isSelected={selectedNodeId === node.id}
                  onMouseDown={handleNodeMouseDown}
                  onPortMouseDown={handlePortMouseDown}
                  onPortMouseUp={handlePortMouseUp}
                  onNodeDataChange={handleNodeDataChange}
                />
              ))}
            </div>
          </div>

          <ConsolePanel
            entries={consoleEntries}
            onClear={() => setConsoleEntries([])}
            isOpen={consoleOpen}
            onToggle={() => setConsoleOpen(!consoleOpen)}
          />
        </div>
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onAddNode={handleContextAddNode}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};
export default App;
