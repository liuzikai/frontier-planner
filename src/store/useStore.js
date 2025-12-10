import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
    (set, get) => ({
      // State
      nodes: initialNodes,
      edges: initialEdges,
      selectedNode: null,

      // Node actions
      onNodesChange: (changes) => {
        set({
          nodes: applyNodeChanges(changes, get().nodes),
        });
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
        set({
          nodes: [...get().nodes, newTask],
          selectedNode: newTask.id,
        });
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
        set({
          nodes: get().nodes.filter((node) => node.id !== nodeId),
          edges: get().edges.filter(
            (edge) => edge.source !== nodeId && edge.target !== nodeId
          ),
          selectedNode: get().selectedNode === nodeId ? null : get().selectedNode,
        });
      },

      setSelectedNode: (nodeId) => {
        set({ selectedNode: nodeId });
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
    }),
    {
      name: 'task-dependency-graph-storage',
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
      }),
    }
  )
);
