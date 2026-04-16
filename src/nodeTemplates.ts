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
        description: 'Entry point — execution begins here',
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
  {
    type: 'boolean_literal',
    label: 'Boolean',
    category: 'logic',
    description: 'A true/false value',
    createNode: (x, y, id) => ({
      id, type: 'boolean_literal', label: 'Boolean', category: 'logic', x, y,
      inputs: [],
      outputs: [
        { id: uid(), label: 'Value', type: 'boolean', direction: 'output' },
      ],
      data: { value: true },
    }),
  },
  {
    type: 'compare',
    label: 'Compare',
    category: 'logic',
    description: 'Compare two numbers',
    createNode: (x, y, id) => ({
      id, type: 'compare', label: 'Compare', category: 'logic', x, y,
      inputs: [
        { id: uid(), label: 'A', type: 'number', direction: 'input', value: 0 },
        { id: uid(), label: 'B', type: 'number', direction: 'input', value: 0 },
      ],
      outputs: [
        { id: uid(), label: 'A > B', type: 'boolean', direction: 'output' },
        { id: uid(), label: 'A == B', type: 'boolean', direction: 'output' },
        { id: uid(), label: 'A < B', type: 'boolean', direction: 'output' },
      ],
      data: { operator: '>' },
    }),
  },
  {
    type: 'if_else',
    label: 'If / Else',
    category: 'logic',
    description: 'Branch execution based on a condition',
    createNode: (x, y, id) => ({
      id, type: 'if_else', label: 'If / Else', category: 'logic', x, y,
      inputs: [
        { id: uid(), label: 'Exec', type: 'exec', direction: 'input' },
        { id: uid(), label: 'Condition', type: 'boolean', direction: 'input' },
      ],
      outputs: [
        { id: uid(), label: 'True', type: 'exec', direction: 'output' },
        { id: uid(), label: 'False', type: 'exec', direction: 'output' },
      ],
    }),
  },
  {
    type: 'set_variable',
    label: 'Set Variable',
    category: 'variable',
    description: 'Store a value in a named variable',
    createNode: (x, y, id) => ({
      id, type: 'set_variable', label: 'Set Variable', category: 'variable', x, y,
      inputs: [
        { id: uid(), label: 'Exec', type: 'exec', direction: 'input' },
        { id: uid(), label: 'Value', type: 'any', direction: 'input', value: 0 },
      ],
      outputs: [
        { id: uid(), label: 'Exec', type: 'exec', direction: 'output' },
      ],
      data: { varName: 'myVar' },
    }),
  },
  {
    type: 'get_variable',
    label: 'Get Variable',
    category: 'variable',
    description: 'Read a stored variable',
    createNode: (x, y, id) => ({
      id, type: 'get_variable', label: 'Get Variable', category: 'variable', x, y,
      inputs: [],
      outputs: [
        { id: uid(), label: 'Value', type: 'any', direction: 'output' },
      ],
      data: { varName: 'myVar' },
    }),
  },
  {
    type: 'for_loop',
    label: 'For Loop',
    category: 'flow',
    description: 'Repeat execution a set number of times',
    createNode: (x, y, id) => ({
      id, type: 'for_loop', label: 'For Loop', category: 'flow', x, y,
      inputs: [
        { id: uid(), label: 'Exec', type: 'exec', direction: 'input' },
        { id: uid(), label: 'Count', type: 'number', direction: 'input', value: 5 },
      ],
      outputs: [
        { id: uid(), label: 'Loop Body', type: 'exec', direction: 'output' },
        { id: uid(), label: 'Index', type: 'number', direction: 'output' },
        { id: uid(), label: 'Completed', type: 'exec', direction: 'output' },
      ],
    }),
  },
  {
    type: 'while_loop',
    label: 'While Loop',
    category: 'flow',
    description: 'Repeat while condition is true',
    createNode: (x, y, id) => ({
      id, type: 'while_loop', label: 'While Loop', category: 'flow', x, y,
      inputs: [
        { id: uid(), label: 'Exec', type: 'exec', direction: 'input' },
        { id: uid(), label: 'Condition', type: 'boolean', direction: 'input' },
      ],
      outputs: [
        { id: uid(), label: 'Loop Body', type: 'exec', direction: 'output' },
        { id: uid(), label: 'Completed', type: 'exec', direction: 'output' },
      ],
    }),
  },
  {
    type: 'sequence',
    label: 'Sequence',
    category: 'flow',
    description: 'Execute multiple branches in order',
    createNode: (x, y, id) => ({
      id, type: 'sequence', label: 'Sequence', category: 'flow', x, y,
      inputs: [
        { id: uid(), label: 'Exec', type: 'exec', direction: 'input' },
      ],
      outputs: [
        { id: uid(), label: 'Then 0', type: 'exec', direction: 'output' },
        { id: uid(), label: 'Then 1', type: 'exec', direction: 'output' },
        { id: uid(), label: 'Then 2', type: 'exec', direction: 'output' },
      ],
    }),
  },
  {
    type: 'subtract',
    label: 'Subtract',
    category: 'math',
    description: 'Subtract two numbers',
    createNode: (x, y, id) => ({
      id, type: 'subtract', label: 'Subtract', category: 'math', x, y,
      inputs: [
        { id: uid(), label: 'A', type: 'number', direction: 'input', value: 0 },
        { id: uid(), label: 'B', type: 'number', direction: 'input', value: 0 },
      ],
      outputs: [
        { id: uid(), label: 'Result', type: 'number', direction: 'output' },
      ],
    }),
  },
  {
    type: 'multiply',
    label: 'Multiply',
    category: 'math',
    description: 'Multiply two numbers',
    createNode: (x, y, id) => ({
      id, type: 'multiply', label: 'Multiply', category: 'math', x, y,
      inputs: [
        { id: uid(), label: 'A', type: 'number', direction: 'input', value: 0 },
        { id: uid(), label: 'B', type: 'number', direction: 'input', value: 0 },
      ],
      outputs: [
        { id: uid(), label: 'Result', type: 'number', direction: 'output' },
      ],
    }),
  },
  {
    type: 'string_literal',
    label: 'String',
    category: 'io',
    description: 'A constant string value',
    createNode: (x, y, id) => ({
      id, type: 'string_literal', label: 'string', category: 'io', x, y, 
      inputs: [],
      outputs: [
        { id: uid(), label: 'Value', type: 'string', direction: 'output' },
      ],
      data: { value: 'Hello!' },
    }),
  },
  {
    type: 'to_string',
    label: 'To String',
    category: 'io',
    description: 'Convert any value to string',
    createNode: (x, y, id) => ({
      id, type: 'to_string', label: 'To String', category: 'io', x, y, 
      inputs: [
        { id: uid(), label: 'Input', type: 'any', direction: 'input' },
      ],
      outputs: [
        { id: uid(), label: 'Text', type: 'string', direction: 'output' },
      ],
    }),
  },
  {
    type: 'array_literal',
    label: 'Array Literal',
    category: 'array',
    description: 'Comma separated list of values to make an array',
    createNode: (x, y, id) => ({
      id, type: 'array_literal', label: 'Array Literal', category: 'array', x, y,
      inputs: [],
      outputs: [
        { id: uid(), label: 'Value', type: 'array', direction: 'output' },
      ],
      data: { value: '1, 2, 3' },
    }),
  },
  {
    type: 'array_get',
    label: 'Array Get',
    category: 'array',
    description: 'Get an element from an array by index',
    createNode: (x, y, id) => ({
      id, type: 'array_get', label: 'Array Get', category: 'array', x, y,
      inputs: [
        { id: uid(), label: 'Array', type: 'array', direction: 'input' },
        { id: uid(), label: 'Index', type: 'number', direction: 'input', value: 0 },
      ],
      outputs: [
        { id: uid(), label: 'Value', type: 'any', direction: 'output' },
      ],
    }),
  },
  {
    type: 'array_length',
    label: 'Array Length',
    category: 'array',
    description: 'Get the number of elements in an array',
    createNode: (x, y, id) => ({
      id, type: 'array_length', label: 'Array Length', category: 'array', x, y,
      inputs: [
        { id: uid(), label: 'Array', type: 'array', direction: 'input' },
      ],
      outputs: [
        { id: uid(), label: 'Length', type: 'number', direction: 'output' }
      ],
    }),
  },
];