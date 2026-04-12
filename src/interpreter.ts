import type { NodeData, Wire } from './types';

export class Interpreter {
  private nodes: Map<string, NodeData>;
  private wires: Wire[];

  constructor(nodes: NodeData[], wires: Wire[]) {
    this.nodes = new Map(nodes.map(n => [n.id, n]));
    this.wires = wires;
  }

  private getOutgoingWires(portId: string): Wire[] { return this.wires.filter(w => w.fromPortId === portId); }
  private getIncomingWire(portId: string): Wire | undefined { return this.wires.find(w => w.toPortId === portId); }

  private evaluateNode(node: NodeData): any {
    switch (node.type) {
      case 'string_literal': return String(node.data?.value ?? '');
      case 'number_literal': return Number(node.data?.value ?? 0);
      default: return undefined;
    }
  }

  private resolveInputValue(node: NodeData, portId: string): any {
    const wire = this.getIncomingWire(portId);
    const port = node.inputs.find(p => p.id === portId);
    if (!wire) return port?.value;
    
    const sourceNode = this.nodes.get(wire.fromNodeId);
    if (!sourceNode) return port?.value;
    return this.evaluateNode(sourceNode);
  }

  private getNextExecNode(portId: string): { node: NodeData; inputPortId: string } | null {
    const wires = this.getOutgoingWires(portId);
    if (wires.length === 0) return null;
    const wire = wires[0];
    const node = this.nodes.get(wire.toNodeId);
    if (!node) return null;
    return { node, inputPortId: wire.toPortId };
  }

  async executeNode(node: NodeData): Promise<void> {
    switch (node.type) {
      case 'print': {
        const msgPort = node.inputs.find(p => p.label === 'Message');
        const message = msgPort ? this.resolveInputValue(node, msgPort.id) : 'undefined';
        
        console.log(`[NodeScript]: ${message}`);
        
        const execOut = node.outputs.find(p => p.type === 'exec');
        if (execOut) {
          const next = this.getNextExecNode(execOut.id);
          if (next) await this.executeNode(next.node);
        }
        break;
      }
    }
  }

  async run() {
    console.log('Program started');
    const printNode = Array.from(this.nodes.values()).find(n => n.type === 'print');
    
    if (printNode) await this.executeNode(printNode);
    else console.error('No Print node found!');
    
    console.log('Program finished');
  }
}
