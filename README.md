# Task Dependency Graph

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
- **Undo/Redo**: Full history support with Ctrl/⌘+Z and Ctrl/⌘+Shift+Z
- **File Management**: Save and load projects as JSON files
- **Tag Manager**: Create, edit, and delete custom tags with colors
- **MiniMap**: Toggle minimap for better navigation
- **Statistics**: View task count by status in real-time
- **Tips**: Hover over the "?" button for keyboard shortcuts and usage tips

## Technical Stack

- **React 19**: UI framework
- **Vite**: Build tool and dev server
- **React Flow (@xyflow/react)**: Canvas and graph visualization
- **Zustand**: State management
  - `zundo`: Temporal state management for undo/redo
  - `persist`: LocalStorage persistence
- **Tailwind CSS v4**: Styling

## Project Structure

```
src/
├── components/
│   ├── Canvas.jsx         # Main canvas with React Flow
│   ├── TaskNode.jsx       # Custom node component
│   ├── Sidebar.jsx        # Task detail editor
│   ├── Toolbar.jsx        # Top toolbar with actions
│   ├── Tooltip.jsx        # Custom tooltip component
│   └── TagManager.jsx     # Tag management modal
├── store/
│   └── useStore.js        # Zustand store with temporal & persist
├── utils/
│   ├── frontierUtils.js   # Frontier node detection algorithm
│   └── timeUtils.js       # Time calculation and formatting
└── index.css              # Tailwind styles
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

1. **Creating Tasks**: Double-click the canvas to add a new task
2. **Connecting Tasks**: Drag from a green output handle to a blue input handle
3. **Editing Tasks**: Click a task to open the sidebar editor
4. **Finding Next Actions**: Select a milestone/goal task to see which tasks you can start now (frontier nodes with orange rings)
5. **Estimating Time**: Add time estimates to tasks, then select a goal to see how long it will take
6. **Organizing**: Use tags and the someday status to manage priorities

## License

MIT
