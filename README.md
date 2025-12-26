# Frontier Planner

A visual task management tool built with React and React Flow that helps you organize tasks with dependencies, track progress, and estimate time to completion.

## Features

### Core Functionality
- **Visual Dependency Graph**: Create and manage tasks with visual dependency relationships
- **Interactive Canvas**: Drag nodes to reposition, connect handles to create dependencies, pan with trackpad (macOS optimized)
- **Status Tracking**: Mark tasks as To Do, In Progress, Done, or Someday
- **Tag System**: Organize tasks with customizable colored tags
- **Time Estimation**: Add estimated time for tasks (days, weeks, or months)
- **Notes**: Add detailed notes to each task

### Advanced Features

#### Frontier Nodes
The app automatically identifies **frontier nodes** - these are the "next actionable tasks" that are ready to start right now:
- **Definition**: A frontier node is a task that:
  - Is not completed (status ≠ done or someday)
  - All of its dependencies are completed
  - Appears in the dependency path to the selected task
  
- **Visual Indicator**: Frontier nodes are highlighted with an orange ring
- **Special Case**: Frontier nodes without time estimates show a "?" badge, indicating they need estimation

#### Time Calculation
When you select a task, the app calculates how long it will take to reach it from the frontier nodes:

- **Cumulative Time Display**: Shows two metrics:
  - **Σ (Sum)**: Total time if all tasks are done serially (one after another)
  - **↓ (Min)**: Minimum time with maximum parallelism (tasks done simultaneously)

- **Calculation Rules**:
  - Only calculates for nodes in the dependency path to the selected task
  - Done and Someday nodes contribute 0 time (already complete or not blocking)
  - Nodes without time estimates act as barriers (block downstream calculations)
  - Time flows through the dependency tree from frontier nodes to the selected task

- **Visual Display**:
  - Orange badges on nodes show cumulative time
  - Single value if sum = min (no parallelism benefit)
  - Two values (Σ/↓) when parallel execution saves time
  - Hover over badges for detailed explanations

### UI/UX Features
- **High-Density SaaS UI**: Professional, compact interface designed for productivity.
- **"Silver Bullet" File Management**:
  - **Native File System Access**: Direct "Save" (Ctrl+S) support in Chromium browsers (Chrome, Edge) for in-place file editing.
  - **Cross-Browser Fallback**: Intelligent download-based saving for Safari and Firefox with custom filename control.
  - **Unsaved Changes Tracking**: Visual indicators (orange/blue filename) and confirmation prompts to prevent data loss.
  - **Auto-Recentering**: The graph automatically fits to view when loading or creating projects.
- **Comprehensive Demo**: "New Project" initializes with a rich example showcasing dependency chains, parallel time calculations, and status types.
- **Undo/Redo**: Full history support with Ctrl/⌘+Z and Ctrl/⌘+Shift+Z.
- **Tag Manager**: Create, edit, and delete custom tags with colors.
- **MiniMap & Statistics**: Toggleable minimap and real-time task count by status.
- **Tips**: Hover over the "?" button for keyboard shortcuts and usage tips.

## Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| **Ctrl/⌘ + S** | Save Project (In-place if supported) |
| **Ctrl/⌘ + O** | Open Project |
| **Ctrl/⌘ + N** | New Project (with Demo) |
| **Ctrl/⌘ + Z** | Undo |
| **Ctrl/⌘ + Shift + Z** / **Ctrl/⌘ + Y** | Redo |
| **Ctrl/⌘ + A** | Select All Nodes |
| **Backspace / Delete** | Delete Selected Nodes/Edges |
| **Double Click** | Create New Task |
| **Space + Drag** | Pan Canvas |
| **Scroll / Pinch** | Zoom In/Out |

## Technical Stack

- **React 19**: UI framework
- **Vite**: Build tool and dev server
- **React Flow (@xyflow/react)**: Canvas and graph visualization
- **Zustand**: State management
  - `zundo`: Temporal state management for undo/redo
  - `persist`: LocalStorage persistence for session recovery
- **Tailwind CSS v4**: Modern utility-first styling
- **File System Access API**: Native browser integration for local file management

## Project Structure

```
src/
├── components/
│   ├── Canvas.jsx         # Main canvas, shortcuts, and graph logic
│   ├── TaskNode.jsx       # Custom node with status and time badges
│   ├── Sidebar.jsx        # Task detail editor and metadata
│   ├── Toolbar.jsx        # File actions, stats, and global controls
│   ├── TagManager.jsx     # Tag management modal
│   └── Tooltip.jsx        # Custom tooltip component
├── store/
│   └── useStore.js        # Central state, demo data, and file handlers
├── utils/
│   ├── frontierUtils.js   # Frontier node detection algorithm
│   └── timeUtils.js       # Parallel time calculation logic
└── index.css              # Tailwind styles and custom animations
```

## Key Algorithms

### Frontier Detection (`src/utils/frontierUtils.js`)
1. Find all ancestor tasks of the selected task (recursive backtracking)
2. Filter ancestors to find executable tasks:
   - Status is not 'done' or 'someday'
   - All dependencies have status 'done' or 'someday'
3. Return the set of frontier task IDs

### Time Calculation (`src/utils/timeUtils.js`)
1. Initialize frontier nodes with their own estimated time
2. Topological traversal of the dependency graph:
   - For each node, check if all dependencies are ready
   - Calculate sum (add all dependency sums + own time)
   - Calculate min (take max of dependency mins + own time)
   - Skip nodes without time estimates (act as barriers)
3. Return map of nodeId → {sum, min} for all processed nodes

## Getting Started

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

## Usage Tips

1. **Creating Tasks**: Double-click the canvas to add a new task.
2. **Connecting Tasks**: Drag from a green output handle to a blue input handle.
3. **Editing Tasks**: Click a task to open the sidebar editor.
4. **Finding Next Actions**: Select a milestone/goal task to see which tasks you can start now (frontier nodes with orange rings).
5. **Estimating Time**: Add time estimates to tasks, then select a goal to see how long it will take.
6. **File Management**:
   - Use **Ctrl+S** to save your work. In Chrome/Edge, this saves directly to the file you opened.
   - The filename in the toolbar turns **orange** when you have unsaved changes.
   - "New Project" will load a demo graph to help you get started.
7. **Organizing**: Use tags and the "Someday" status to manage priorities without cluttering your active timeline.
