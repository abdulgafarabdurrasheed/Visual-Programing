import type { ConsoleEntry, NodeData, Wire } from './types';

export class Interpreter {
  private nodes: Map<string, NodeData>;
  private wires: Wire[];
  private variables: Map<string, any> = new Map();
  private onConsole: (entry: ConsoleEntry) => void;
  private onNodeActive: (nodeId: string | null) => void;
  private running = false;
  
  constructor(
    nodes: NodeData[],
    wires: Wire[],
    onConsole: (entry: ConsoleEntry) => void,
    onNodeActive: (nodeId: string | null) => void,
  ) {
    this.nodes = new Map(nodes.map(n => [n.id, n]));
    this.wires = wires;
    this.onConsole = onConsole;
    this.onNodeActive = onNodeActive;
  }
  stop() { this.running = false; }

  private log(type: ConsoleEntry['type'], message: string) {
    const entry: ConsoleEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type, message, timestamp: Date.now(),
    };
    this.onConsole(entry);
  }

  private delay(ms: number) {
    return new Promise(res => setTimeout(res, ms));
  }

  private stepDelay = 350;

  private getOutgoingWires(portId: string): Wire[] { return this.wires.filter(w => w.fromPortId === portId); }
  private getIncomingWire(portId: string): Wire | undefined { return this.wires.find(w => w.toPortId === portId); }

  private evaluateNode(node: NodeData): any {
    switch (node.type) {
      case 'string_literal': return String(node.data?.value ?? '');
      case 'number_literal': return Number(node.data?.value ?? 0);
      case 'add': {
        const a = Number(this.resolveInputValue(node, node.inputs[0].id) ?? 0);
        const b = Number(this.resolveInputValue(node, node.inputs[1].id) ?? 0);
        return a + b;
      }
      case 'boolean_literal':
        return Boolean(node.data?.value ?? false);
      case 'compare': {
        const a = Number(this.resolveInputValue(node, node.inputs[0].id) ?? 0);
        const b = Number(this.resolveInputValue(node, node.inputs[1].id) ?? 0);
        const outIdx = node.outputs.findIndex(p => p.id === arguments[1]);
        if (outIdx === 0) return a > b;
        if (outIdx === 1) return a === b;
        return a < b;
      }
      case 'get_variable':
        return this.variables.get(node.data?.varName ?? 'undefined');

      case 'subtract': {
        const a = Number(this.resolveInputValue(node, node.inputs[0].id) ?? 0);
        const b = Number(this.resolveInputValue(node, node.inputs[1].id) ?? 0);
        return a - b;
      }
      case 'multiply': {
        const a = Number(this.resolveInputValue(node, node.inputs[0].id) ?? 0);
        const b = Number(this.resolveInputValue(node, node.inputs[1].id) ?? 0);
        return a * b;
      }
      case 'to_string': {
        const val = this.resolveInputValue(node, node.inputs[0].id);
        return String(val)
      }
      case 'array_literal': {
        const raw = String(node.data?.value ?? '');
        return raw.split(',').map(s => {
          const trimmed = s.trim();
          if (trimmed === '') return '';
          if (!isNaN(Number(trimmed)) && trimmed !== '') return Number(trimmed);
          return trimmed
        });
      }
      case 'array_get': {
        const arr = this.resolveInputValue(node, node.inputs[0].id) as any[];
        const idx = Number(this.resolveInputValue(node, node.inputs[1].id));
        if (!Array.isArray(arr)) return undefined;
        return arr[idx];
      }
      case 'array_length': {
        const arr = this.resolveInputValue(node, node.inputs[0].id) as any[];
        if (!Array.isArray(arr)) return 0;
        return arr.length
      }
      default: {
        const outPort = node.outputs.find(p => p.id === arguments[1]);
        return outPort?.value;
      };
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
    if (!this.running) return;
    this.onNodeActive(node.id);
    await
    this.delay(this.stepDelay)
    
    switch (node.type) {
      case 'print': {
        const msgPort = node.inputs.find(p => p.label === 'Message');
        const message = msgPort ? this.resolveInputValue(node, msgPort.id) : 'undefined';
        
        this.log('log', String(message))
        
        const execOut = node.outputs.find(p => p.type === 'exec');
        if (execOut) {
          const next = this.getNextExecNode(execOut.id);
          if (next) await this.executeNode(next.node);
        }
        break;
      }
      case 'if_else': {
        const condPort = node.inputs.find(p => p.label === 'Condition');
        const cond = condPort ? this.resolveInputValue(node, condPort.id) : false;
        const truePort = node.outputs.find(p => p.label === 'True');
        const falsePort = node.outputs.find(p => p.label === 'False');

        if (cond && truePort) {
          this.log('info', 'Condition: true → taking True branch')
          const next = this.getNextExecNode(truePort.id);
          if (next) await this.executeNode(next.node);
        } else if (!cond && falsePort) {
          this.log('info', 'Condition: false → taking false branch')
          const next = this.getNextExecNode(falsePort.id);
          if (next) await this.executeNode(next.node)
        }
        break
      }
      case 'set_variable': {
        const valPort = node.inputs.find(p => p.label === 'Value');
        const val = valPort ? this.resolveInputValue(node, valPort.id) : undefined
        const varName = node.data?.varName ?? 'undefined';
        this.variables.set(varName, val);
        this.log('info', `Set ${varName} = ${JSON.stringify(val)}`)
        const execOut = node.outputs.find(p => p.type === 'exec');
        if (execOut) {
          const next = this.getNextExecNode(execOut.id);
          if (next) await this.executeNode(next.node);
        }
        break;
      }
      case 'start': {
        const execOut = node.outputs.find(p => p.type === 'exec');
        if (execOut) {
          const next = this.getNextExecNode(execOut.id);
          if (next) await this.executeNode(next.node);
        }
        break;
      }
      case 'for_loop': {
        const countPort = node.inputs.find(p => p.label === 'Count');
        const count = Number(countPort ? this.resolveInputValue(node, countPort.id) : 0);
        const bodyPort = node.outputs.find(p => p.label === 'Loop Body');
        const indexPort = node.outputs.find(p => p.label === 'Index');
        const donePort = node.outputs.find(p => p.label === 'Completed');

        this.log('info', `For Loop: iterating ${count} times`)
        for (let i = 0; i < count; i++) {
          if (indexPort) indexPort.value = i;
          if (bodyPort) {
            const next = this.getNextExecNode(bodyPort.id);
            if (next) await this.executeNode(next.node)
          }
        }
        if (donePort) {
          const next = this.getNextExecNode(donePort.id);
          if (next) await this.executeNode(next.node);
        }
        break;
      }
      case 'while_loop': {
        const condPort = node.inputs.find(p => p.label === 'Condition');
        const bodyPort = node.outputs.find(p => p.label === 'Loop Body');
        const donePort = node.outputs.find(p => p.label === 'Completed' );

        let iterations = 0;
        const maxIterations = 1000;

        while (iterations < maxIterations) {
          const cond = condPort ? this.resolveInputValue(node, condPort.id) : false;
          if (!cond) break
          iterations++
          if (bodyPort) {
            const next = this.getNextExecNode(bodyPort.id);
            if (next) await this.executeNode(next.node)
          }
        }

      this.log('info', `While Loop: completed after ${iterations} iterations`)

        if (donePort) {
          const next = this.getNextExecNode(donePort.id);
          if (next) await this.executeNode(next.node);
        }
        break;
      }
      case 'sequence': {
        for (const out of node.outputs) {
          if (out.type === 'exec') {
            const next = this.getNextExecNode(out.id);
            if (next) await this.executeNode(next.node);
          }
        }
        break
      }
    }
  }

  async run() {
    this.running = true;
    this.variables.clear();
    const startNode = Array.from(this.nodes.values()).find(n => n.type === 'start');
    if (!startNode) {
      this.log('error', 'No Start Program node found!');
      this.onNodeActive(null);
      return;
    }
    this.log('info', '▶ Program started');
    await this.executeNode(startNode);
    this.log('info', '■ Program finished');
    this.onNodeActive(null);
    this.running = false;
  }


}