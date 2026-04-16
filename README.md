# NodeScript — Visual Programming Language

A browser-based visual programming environment where you build programs by connecting nodes together — no typing code required. Built with React and TypeScript.

![NodeScript](https://img.shields.io/badge/NodeScript-Visual_Programming-6366f1?style=for-the-badge) ![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript) ![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite)

---

## Overview

NodeScript is a node-based visual programming IDE that runs entirely in the browser. Programs are constructed by dragging nodes onto a canvas, configuring their values, and connecting them with wires to define data flow and execution order. An integrated interpreter executes the graph in real-time with visual feedback — nodes glow as they execute and output appears in a built-in console.

### Key Features

- **19 Node Types** — Math, Logic, Flow Control, Variables, I/O, and Arrays
- **Drag & Drop** — Drag nodes from the categorized sidebar or right-click to spawn
- **Wire System** — Type-safe Bezier curve connections with animated execution flow
- **Live Interpreter** — Async execution with step-by-step node highlighting
- **Built-in Console** — Color-coded output panel (log, info, warn, error)
- **Interactive Tutorial** — Guided onboarding that walks through the basics
- **Demo Graph** — Pre-wired "Sum 1 to 10" program that computes 1+2+3+...+10 = 55
- **Canvas Controls** — Pan, zoom, fit view, and delete with keyboard shortcuts

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- npm

### Installation

```bash
# Clone or navigate to the project directory
cd "Visual Programing"

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173/`.

### First Launch

On your first visit, an **interactive tutorial** walks you through the basics:

1. **Welcome** — What NodeScript is
2. **Start Node** — Drag it onto the canvas
3. **Add Node** — Drag it from the Math category
4. **Print Node** — Drag it from Input/Output
5. **Connect & Run** — Wire them together and execute
6. **Demo** — Loads a pre-built program to study

The tutorial only shows once. Subsequent visits load the demo graph directly.

---

## How It Works

### Node Types

| Category | Nodes | Description |
|---|---|---|
| **Events** | Start Program | Entry point — execution begins here |
| **Flow Control** | If/Else, For Loop, While Loop, Sequence | Control execution order and branching |
| **Logic** | Boolean, Compare | Boolean values and comparisons |
| **Math** | Add, Subtract, Multiply, Number | Arithmetic operations and number literals |
| **Variables** | Set Variable, Get Variable | Store and retrieve named values |
| **Input/Output** | Print, String, To String | Console output and string operations |
| **Arrays** | Array Literal, Array Get, Array Length | Array creation and manipulation |

### Port Types

- **Exec** (orange ▶) — Controls execution flow. Connect Start → Print to run Print after Start.
- **Number** (indigo ●) — Numeric data. Connect Add's Result → Print's Message.
- **String** (green ●) — Text data.
- **Boolean** (red ●) — True/false values.
- **Array** (green ●) — Array data.
- **Any** (gray ●) — Accepts any type.

### Controls

| Action | Input |
|---|---|
| **Pan** | Click empty space and drag, or middle-click drag |
| **Zoom** | Scroll wheel |
| **Select** | Click a node |
| **Delete** | Select a node, press `Delete` |
| **Add Node** | Drag from sidebar, click in sidebar, or right-click canvas |
| **Connect** | Drag from one port to another |
| **Run** | Click ▶ RUN in the toolbar |


### Interpreter

The interpreter (`interpreter.ts`) is an async recursive engine:

1. Finds the `Start Program` node
2. Follows exec wires to determine execution order
3. For each node, resolves input values by tracing data wires back to source nodes
4. Supports variable memory (`Map<string, any>`) for Set/Get Variable
5. Handles loops with iteration limits (1000 max for while loops)
6. Emits console entries and active node highlights via callbacks
7. Step delay (350ms) provides visual execution feedback

### State Management

All state lives in `App.tsx` using React hooks:
- `nodes` / `wires` — The graph data
- `viewport` — Pan/zoom transform
- `drawingWire` — Active wire-drawing state
- `dragging` / `panning` — Mouse interaction states
- Global `window` event listeners for drag/pan/zoom across the full viewport

## License

This project is for educational and portfolio purposes.
