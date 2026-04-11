export type PortType = 'exec' | 'number' | 'string' | 'boolean' | 'array' | 'any';

export interface Port {
    id: string;
    label: string;
    type: PortType;
    direction: 'input' | 'output';
    value?: any;
}

export type NodeCategory = 'flow' | 'logic' | 'math' | 'variable' | 'io' | 'event' | 'array'

export interface NodeData {
    id: string;
    type: string;
    label: string;
    category: NodeCategory;
    x: number;
    y: number;
    inputs: Port[];
    outputs: Port[];
    data?: Record<string, any>
}

export interface Wire {
    id: string;
    fromNodeId: string;
    fromPortId: string;
    toNodeId: string;
    toPortId: string;
    type: PortType;
}

export const CATEGORY_COLORS: Record<NodeCategory, string> = {
  flow: '#f59e0b',
  logic: '#f43f5e',
  math: '#6366f1',
  variable: '#8b5cf6',
  io: '#22d3ee',
  event: '#10b981',
  array: '#34d399',
};

export const PORT_COLORS: Record<PortType, string> = {
  exec: '#f59e0b',
  number: '#6366f1',
  string: '#10b981',
  boolean: '#f43f5e',
  array: '#10b981',
  any: '#94a3b8',
};
