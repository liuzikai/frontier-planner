import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { temporal } from 'zundo';
import { useStore as useZustandStore } from 'zustand';
import { applyNodeChanges, applyEdgeChanges } from '@xyflow/react';

// Generate unique IDs
const generateId = () => `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Default task data
const createDefaultTask = (position = { x: 100, y: 100 }) => ({
  id: generateId(),
  type: 'taskNode',
  position,
  data: {
    title: 'New Task',
    description: '',
    status: 'todo', // todo, in-progress, done
    priority: 'medium', // low, medium, high
    dueDate: null,
    createdAt: new Date().toISOString(),
  },
});

// Initial demo data
const initialNodes = [
  {
    id: 'task-1',
    type: 'taskNode',
    position: { x: 100, y: 100 },
    data: {
      title: 'Research Phase',
      description: 'Gather requirements and research solutions',
      status: 'done',
      priority: 'high',
      dueDate: null,
      createdAt: new Date().toISOString(),
    },
  },
  {
    id: 'task-2',
    type: 'taskNode',
    position: { x: 400, y: 50 },
    data: {
      title: 'Design System',
      description: 'Create wireframes and design mockups',
      status: 'in-progress',
      priority: 'high',
      dueDate: null,
      createdAt: new Date().toISOString(),
    },
  },
  {
    id: 'task-3',
    type: 'taskNode',
    position: { x: 400, y: 200 },
    data: {
      title: 'Setup Development Environment',
      description: 'Configure tools and dependencies',
      status: 'done',
      priority: 'medium',
      dueDate: null,
      createdAt: new Date().toISOString(),
    },
  },
  {
    id: 'task-4',
    type: 'taskNode',
    position: { x: 700, y: 125 },
    data: {
      title: 'Implementation',
      description: 'Build the core features',
      status: 'todo',
      priority: 'high',
      dueDate: null,
      createdAt: new Date().toISOString(),
    },
  },
];

const initialEdges = [
  { id: 'e1-2', source: 'task-1', target: 'task-2', animated: true },
  { id: 'e1-3', source: 'task-1', target: 'task-3', animated: true },
  { id: 'e2-4', source: 'task-2', target: 'task-4', animated: true },
  { id: 'e3-4', source: 'task-3', target: 'task-4', animated: true },
];

export const useStore = create(
  persist(
    temporal(
      (set, get) => ({
        // State
        nodes: initialNodes,
        edges: initialEdges,
        selectedNode: null,
        currentFileName: null,

        // Node actions
        // Filter out internal React Flow changes from history tracking
        // - dimensions: sent when nodes are rendered
        // - position: sent during dragging (handled by onNodeDragStart/Stop)
        // - select: sent when nodes are selected (handled by setSelectedNode)
        onNodesChange: (changes) => {
          // Check if these are only internal changes that shouldn't create history
          const isOnlyInternalChanges = changes.every(
            (change) => change.type === 'dimensions' || change.type === 'position' || change.type === 'select'
          );
          
          if (isOnlyInternalChanges) {
            // For these changes, pause/resume around the set to avoid history
            // Unless we're already paused (e.g., during drag)
            const isCurrentlyTracking = useStore.temporal.getState().isTracking;
            
            if (isCurrentlyTracking) {
              const { pause, resume } = useStore.temporal.getState();
              pause();
              set({
                nodes: applyNodeChanges(changes, get().nodes),
              });
              resume();
            } else {
              // Already paused (during drag), just set without touching pause/resume
              set({
                nodes: applyNodeChanges(changes, get().nodes),
              });
            }
          } else {
            // Real changes (add, remove, etc.) - these should create history
            set({
              nodes: applyNodeChanges(changes, get().nodes),
            });
          }
        },

        onEdgesChange: (changes) => {
          set({
            edges: applyEdgeChanges(changes, get().edges),
          });
        },

        onConnect: (connection) => {
          const newEdge = {
            ...connection,
            id: `e${connection.source}-${connection.target}`,
            animated: true,
          };
          set({
            edges: [...get().edges, newEdge],
          });
        },

        addTask: (position) => {
          const newTask = createDefaultTask(position);
          // First set nodes (this creates history)
          set({
            nodes: [...get().nodes, newTask],
          });
          // Then set selection without creating history
          const { pause, resume } = useStore.temporal.getState();
          pause();
          set({ selectedNode: newTask.id });
          resume();
          return newTask;
        },

        updateTask: (nodeId, data) => {
          set({
            nodes: get().nodes.map((node) =>
              node.id === nodeId
                ? { ...node, data: { ...node.data, ...data } }
                : node
            ),
          });
        },

        deleteTask: (nodeId) => {
          // Delete node and edges (this creates history)
          set({
            nodes: get().nodes.filter((node) => node.id !== nodeId),
            edges: get().edges.filter(
              (edge) => edge.source !== nodeId && edge.target !== nodeId
            ),
          });
          // Update selection without creating history
          if (get().selectedNode === nodeId) {
            const { pause, resume } = useStore.temporal.getState();
            pause();
            set({ selectedNode: null });
            resume();
          }
        },

        setSelectedNode: (nodeId) => {
          // Selection changes should not be part of undo history
          const { pause, resume } = useStore.temporal.getState();
          pause();
          set({ selectedNode: nodeId });
          resume();
        },

        // Store node positions before drag starts
        _preDragNodes: null,
        
        // Called when drag starts - save current state and pause history tracking
        onNodeDragStart: () => {
          // Save the current nodes state before dragging (deep copy)
          const preDragNodes = JSON.parse(JSON.stringify(get().nodes));
          
          // Pause first, then save (so saving doesn't create history)
          useStore.temporal.getState().pause();
          set({ _preDragNodes: preDragNodes });
        },

        // Called when drag ends - create a single history entry for the entire drag operation
        onNodeDragStop: () => {
          const preDragNodes = get()._preDragNodes;
          const currentNodes = JSON.parse(JSON.stringify(get().nodes)); // Deep copy current state
          
          // Check if positions actually changed
          const changed = preDragNodes && JSON.stringify(preDragNodes) !== JSON.stringify(currentNodes);
          
          if (changed) {
            // While still paused:
            // 1. Clear _preDragNodes
            // 2. Set nodes back to preDragNodes
            set({ _preDragNodes: null, nodes: preDragNodes });
            
            // Now resume and set to currentNodes - this creates the history entry
            useStore.temporal.getState().resume();
            set({ nodes: currentNodes });
          } else {
            // No change, just clean up
            set({ _preDragNodes: null });
            useStore.temporal.getState().resume();
          }
        },

        setCurrentFileName: (name) => {
          set({ currentFileName: name });
        },

        // Clear all data
        clearAll: () => {
          set({
            nodes: [],
            edges: [],
            selectedNode: null,
          });
        },

        // Reset to demo data
        resetToDemo: () => {
          set({
            nodes: initialNodes,
            edges: initialEdges,
            selectedNode: null,
          });
        },

        // Export graph to JSON
        exportToJSON: () => {
          const { nodes, edges } = get();
          const data = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            nodes,
            edges,
          };
          return JSON.stringify(data, null, 2);
        },

        // Import graph from JSON
        importFromJSON: (jsonString) => {
          try {
            const data = JSON.parse(jsonString);
            if (!data.nodes || !data.edges) {
              throw new Error('Invalid file format: missing nodes or edges');
            }
            set({
              nodes: data.nodes,
              edges: data.edges,
              selectedNode: null,
            });
            return { success: true };
          } catch (error) {
            return { success: false, error: error.message };
          }
        },

        // Save to file (triggers download)
        saveToFile: (filename = 'project.json') => {
          const json = get().exportToJSON();
          const blob = new Blob([json], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          get().setCurrentFileName(filename);
        },

        // Load from file (opens file picker)
        loadFromFile: () => {
          return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (e) => {
              const file = e.target.files[0];
              if (!file) {
                resolve({ success: false, error: 'No file selected' });
                return;
              }
              const reader = new FileReader();
              reader.onload = (event) => {
                const result = get().importFromJSON(event.target.result);
                if (result.success) {
                  get().setCurrentFileName(file.name);
                }
                resolve(result);
              };
              reader.onerror = () => {
                resolve({ success: false, error: 'Failed to read file' });
              };
              reader.readAsText(file);
            };
            input.click();
          });
        },
      }),
      {
        // Undo/redo configuration (temporal middleware options)
        partialize: (state) => ({
          nodes: state.nodes,
          edges: state.edges,
        }),
        limit: 50, // Keep last 50 states
      }
    ),
    {
      // Persist configuration (persist middleware options)
      name: 'task-dependency-graph-storage',
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
      }),
    }
  )
);

// Hook to subscribe to temporal store state changes reactively
// This follows the pattern from zundo documentation
export const useTemporalStore = (selector, equality) => {
  return useZustandStore(useStore.temporal, selector, equality);
};
