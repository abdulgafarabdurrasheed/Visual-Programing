import type { NodeData, NodeCategory } from './types'

let _idCounter = 0;
const uid = () => `port_${++_idCounter}_${Date.now()}`;

export interface NodeTemplate {
    type: string;
    label: string;
    category: NodeCategory;
    description: string;
    createNode: (x: number, y: number, id: string) => NodeData;
}

export const NODE_TEMPLATES: NodeTemplate[] = [
    {
        type: 'start',
        label: 'Start Program',
        category: 'event',
        description: 'Entry Point. Where every Execution Begins',
        createNode: (x, y, id) => ({ id, type: 'start', label: 'Start Program', category: 'event', x, y, 
            inputs: [],
            outputs: [
                { id: uid(), label: 'Exec', type: 'exec', direction: 'output' },
            ],
         }),
    },

    {
        type: 'print',
        label: 'Print',
        category: 'io',
        description: 'Log a value to the console',
        createNode: (x, y, id) => ({
            id, type: 'print', label: 'Print', category: 'io', x, y, 
            inputs: [
                { id: uid(), label: 'Exec', type: 'exec', direction: 'input' },
                { id: uid(), label: 'Message', type: 'string', direction: 'input', value: 'Hello World!' },
            ],
            outputs: [
                { id: uid(), label: 'Exec', type: 'exec', direction: 'output' },
            ],
        }),
    },

    {
        type: 'number_literal',
        label: 'Number',
        category: 'math',
        description: 'A constant number value',
        createNode: (x, y, id) => ({
            id, type: 'number_literal', label: 'Number', category: 'math', x, y,
            inputs: [],
            outputs: [
                { id: uid(), label: 'Value', type: 'number', direction: 'output' },
            ],
            data: { value: 0 },
        }),
    },
    {
        type: 'add',
        label: 'Add',
        category: 'math',
        description: 'Add numbers',
        createNode: (x, y, id) => ({
            id, type: 'add', label: 'Add', category: 'math', x, y, 
            inputs: [
                { id: uid(), label: 'A', type: 'number', direction: 'input', value: 0 },
                { id: uid(), label: 'B', type: 'number', direction: 'input', value: 0 },
            ],
            outputs: [
                { id: uid(), label: 'Result', type: 'number', direction: 'output' },
            ],
        }),
    },
];