import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { temporal } from 'zundo';
import { useStore as useZustandStore } from 'zustand';
import { applyNodeChanges, applyEdgeChanges } from '@xyflow/react';

// --- Utilities ---

const generateId = () => `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const generateTagId = () => `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const defaultTags = [
  { id: 'tag-1734000001-eng', name: 'Engineering', color: '#3b82f6' },
  { id: 'tag-1734000002-prd', name: 'Product', color: '#8b5cf6' },
  { id: 'tag-1734000003-inf', name: 'Infrastructure', color: '#10b981' },
  { id: 'tag-1734000004-mkt', name: 'Marketing', color: '#f59e0b' },
  { id: 'tag-1734000005-des', name: 'Design', color: '#ec4899' },
  { id: 'tag-1734000006-qa', name: 'QA', color: '#06b6d4' },
];

const createDefaultTask = (position = { x: 100, y: 100 }) => ({
  id: generateId(),
  type: 'taskNode',
  position,
  data: {
    title: 'New Task',
    description: '',
    status: 'todo',
    primaryTag: null,
    tags: [],
    estimatedTime: null,
    estimatedTimeUnit: 'days',
    note: '',
    createdAt: new Date().toISOString(),
  },
});

// --- Demo Data ---

const initialNodes = [
  {
    id: 'task-1',
    type: 'taskNode',
    position: { x: 50, y: 200 },
    data: {
      title: 'Project Kickoff',
      description: 'Initial meeting and project scope definition',
      status: 'done',
      primaryTag: 'tag-1734000002-prd',
      tags: ['tag-1734000002-prd'],
      estimatedTime: 1,
      estimatedTimeUnit: 'days',
      note: 'Kickoff successful',
      createdAt: new Date().toISOString(),
    },
  },
  {
    id: 'task-2',
    type: 'taskNode',
    position: { x: 350, y: 50 },
    data: {
      title: 'UI Design',
      description: 'Create high-fidelity mockups',
      status: 'done',
      primaryTag: 'tag-1734000005-des',
      tags: ['tag-1734000005-des'],
      estimatedTime: 3,
      estimatedTimeUnit: 'days',
      note: 'Figma files ready',
      createdAt: new Date().toISOString(),
    },
  },
  {
    id: 'task-3',
    type: 'taskNode',
    position: { x: 350, y: 200 },
    data: {
      title: 'Backend Architecture',
      description: 'Design database schema and API contracts',
      status: 'done',
      primaryTag: 'tag-1734000001-eng',
      tags: ['tag-1734000001-eng'],
      estimatedTime: 2,
      estimatedTimeUnit: 'days',
      note: 'Architecture approved',
      createdAt: new Date().toISOString(),
    },
  },
  {
    id: 'task-4',
    type: 'taskNode',
    position: { x: 650, y: 50 },
    data: {
      title: 'Frontend Development',
      description: 'Implement UI components and state management',
      status: 'in-progress',
      primaryTag: 'tag-1734000001-eng',
      tags: ['tag-1734000001-eng', 'tag-1734000005-des'],
      estimatedTime: 5,
      estimatedTimeUnit: 'days',
      note: 'Working on dashboard',
      createdAt: new Date().toISOString(),
    },
  },
  {
    id: 'task-5',
    type: 'taskNode',
    position: { x: 650, y: 200 },
    data: {
      title: 'API Implementation',
      description: 'Build REST endpoints and business logic',
      status: 'todo',
      primaryTag: 'tag-1734000001-eng',
      tags: ['tag-1734000001-eng'],
      estimatedTime: 4,
      estimatedTimeUnit: 'days',
      note: 'Waiting for frontend progress',
      createdAt: new Date().toISOString(),
    },
  },
  {
    id: 'task-6',
    type: 'taskNode',
    position: { x: 950, y: 125 },
    data: {
      title: 'Integration Testing',
      description: 'End-to-end testing of frontend and backend',
      status: 'todo',
      primaryTag: 'tag-1734000006-qa',
      tags: ['tag-1734000006-qa'],
      estimatedTime: 2,
      estimatedTimeUnit: 'days',
      note: 'Requires both FE and BE to be ready',
      createdAt: new Date().toISOString(),
    },
  },
  {
    id: 'task-7',
    type: 'taskNode',
    position: { x: 50, y: 400 },
    data: {
      title: 'Marketing Campaign',
      description: 'Prepare social media and email marketing',
      status: 'someday',
      primaryTag: 'tag-1734000004-mkt',
      tags: ['tag-1734000004-mkt'],
      estimatedTime: 1,
      estimatedTimeUnit: 'weeks',
      note: 'Low priority for now',
      createdAt: new Date().toISOString(),
    },
  },
  {
    id: 'task-8',
    type: 'taskNode',
    position: { x: 350, y: 350 },
    data: {
      title: 'Documentation',
      description: 'Write user guides and API docs',
      status: 'todo',
      primaryTag: 'tag-1734000002-prd',
      tags: ['tag-1734000002-prd'],
      estimatedTime: null,
      estimatedTimeUnit: 'days',
      note: 'MISSING ESTIMATE: This blocks downstream time calculation!',
      createdAt: new Date().toISOString(),
    },
  },
  {
    id: 'task-9',
    type: 'taskNode',
    position: { x: 1250, y: 237 },
    data: {
      title: 'Final Release',
      description: 'Deploy to production',
      status: 'todo',
      primaryTag: 'tag-1734000002-prd',
      tags: ['tag-1734000002-prd'],
      estimatedTime: 1,
      estimatedTimeUnit: 'days',
      note: 'The final milestone',
      createdAt: new Date().toISOString(),
    },
  },
];

const initialEdges = [
  { id: 'e1-2', source: 'task-1', target: 'task-2', animated: true },
  { id: 'e1-3', source: 'task-1', target: 'task-3', animated: true },
  { id: 'e1-8', source: 'task-1', target: 'task-8', animated: true },
  { id: 'e2-4', source: 'task-2', target: 'task-4', animated: true },
  { id: 'e3-5', source: 'task-3', target: 'task-5', animated: true },
  { id: 'e4-6', source: 'task-4', target: 'task-6', animated: true },
  { id: 'e5-6', source: 'task-5', target: 'task-6', animated: true },
  { id: 'e6-9', source: 'task-6', target: 'task-9', animated: true },
  { id: 'e8-9', source: 'task-8', target: 'task-9', animated: true },
];

// --- File System Access API Helpers ---

const getFileHandle = async () => {
  try {
    const [handle] = await window.showOpenFilePicker({
      types: [{ description: 'JSON Files', accept: { 'application/json': ['.json'] } }],
      multiple: false,
    });
    return handle;
  } catch (err) {
    if (err.name === 'AbortError') return null;
    throw err;
  }
};

const getNewFileHandle = async (suggestedName = 'project.json') => {
  try {
    return await window.showSaveFilePicker({
      suggestedName,
      types: [{ description: 'JSON Files', accept: { 'application/json': ['.json'] } }],
    });
  } catch (err) {
    if (err.name === 'AbortError') return null;
    throw err;
  }
};

const writeFile = async (fileHandle, contents) => {
  const writable = await fileHandle.createWritable();
  await writable.write(contents);
  await writable.close();
};

// --- Store Implementation ---

export const useStore = create(
  persist(
    temporal(
      (set, get) => ({
        // State
        nodes: initialNodes,
        edges: initialEdges,
        tags: defaultTags,
        selectedNode: null,
        selectedNodes: [],
        currentFileName: 'Untitled.json',
        fileHandle: null, // Not persisted
        isDirty: true,
        lastLoadedAt: null,
        lastSavedAt: null,
        snapshots: [], // Persisted versions
        isNativeFileSystemSupported: 'showSaveFilePicker' in window && window.isSecureContext,
        _preDragNodes: null,

        // ... existing actions ...
        createSnapshot: (name) => {
          const { nodes, edges, tags } = get();
          const snapshot = {
            id: `snap-${Date.now()}`,
            name: name || `Snapshot ${new Date().toLocaleString()}`,
            timestamp: new Date().toISOString(),
            data: JSON.parse(JSON.stringify({ nodes, edges, tags })),
          };
          set({ snapshots: [snapshot, ...get().snapshots] });
        },

        deleteSnapshot: (id) => {
          set({ snapshots: get().snapshots.filter(s => s.id !== id) });
        },

        restoreSnapshot: (id) => {
          const snapshot = get().snapshots.find(s => s.id === id);
          if (!snapshot) return;
          set({
            nodes: snapshot.data.nodes,
            edges: snapshot.data.edges,
            tags: snapshot.data.tags || get().tags,
            isDirty: true,
            lastLoadedAt: Date.now(),
          });
        },
        onNodesChange: (changes) => {
          const isOnlyInternal = changes.every(
            (c) => c.type === 'dimensions' || c.type === 'position' || c.type === 'select'
          );
          
          if (isOnlyInternal) {
            const isTracking = useStore.temporal.getState().isTracking;
            if (isTracking) {
              useStore.temporal.getState().pause();
              set({ nodes: applyNodeChanges(changes, get().nodes) });
              useStore.temporal.getState().resume();
            } else {
              set({ nodes: applyNodeChanges(changes, get().nodes) });
            }
          } else {
            set({ nodes: applyNodeChanges(changes, get().nodes), isDirty: true });
          }
        },

        onEdgesChange: (changes) => {
          set({ edges: applyEdgeChanges(changes, get().edges), isDirty: true });
        },

        onConnect: (connection) => {
          const newEdge = {
            ...connection,
            id: `edge-${Date.now()}`,
            animated: true,
            style: { strokeWidth: 2, stroke: '#6366f1' },
          };
          set({ edges: [...get().edges, newEdge], isDirty: true });
        },

        addTask: (position) => {
          const newNode = createDefaultTask(position);
          set({ nodes: [...get().nodes, newNode], isDirty: true });
          
          // Selection doesn't go to history
          useStore.temporal.getState().pause();
          set({ selectedNode: newNode.id, selectedNodes: [newNode.id] });
          useStore.temporal.getState().resume();
          return newNode;
        },

        updateTask: (id, data) => {
          set({
            nodes: get().nodes.map((n) =>
              n.id === id ? { ...n, data: { ...n.data, ...data } } : n
            ),
            isDirty: true,
          });
        },

        deleteTask: (id) => {
          set({
            nodes: get().nodes.filter((n) => n.id !== id),
            edges: get().edges.filter((e) => e.source !== id && e.target !== id),
            isDirty: true,
          });
          
          if (get().selectedNode === id || get().selectedNodes.includes(id)) {
            useStore.temporal.getState().pause();
            set({ 
              selectedNode: get().selectedNode === id ? null : get().selectedNode,
              selectedNodes: get().selectedNodes.filter(nid => nid !== id)
            });
            useStore.temporal.getState().resume();
          }
        },

        setSelectedNode: (id) => {
          useStore.temporal.getState().pause();
          set({ selectedNode: id, selectedNodes: id ? [id] : [] });
          useStore.temporal.getState().resume();
        },

        setSelectedNodes: (ids) => {
          useStore.temporal.getState().pause();
          set({ selectedNodes: ids, selectedNode: ids.length === 1 ? ids[0] : null });
          useStore.temporal.getState().resume();
        },

        // Tag Actions
        addTag: (name, color) => {
          const newTag = { id: generateTagId(), name, color };
          set({ tags: [...get().tags, newTag], isDirty: true });
        },

        updateTag: (id, data) => {
          set({
            tags: get().tags.map((t) => (t.id === id ? { ...t, ...data } : t)),
            isDirty: true,
          });
        },

        deleteTag: (id) => {
          set({
            tags: get().tags.filter((t) => t.id !== id),
            nodes: get().nodes.map((n) => ({
              ...n,
              data: {
                ...n.data,
                primaryTag: n.data.primaryTag === id ? null : n.data.primaryTag,
                tags: n.data.tags.filter(tid => tid !== id)
              }
            })),
            isDirty: true,
          });
        },

        // Drag Handling
        onNodeDragStart: () => {
          useStore.temporal.getState().pause();
          set({ _preDragNodes: JSON.parse(JSON.stringify(get().nodes)) });
        },

        onNodeDragStop: () => {
          const preDrag = get()._preDragNodes;
          const current = get().nodes;
          const changed = preDrag && JSON.stringify(preDrag) !== JSON.stringify(current);
          
          if (changed) {
            set({ _preDragNodes: null, nodes: preDrag });
            useStore.temporal.getState().resume();
            set({ nodes: current, isDirty: true });
          } else {
            set({ _preDragNodes: null });
            useStore.temporal.getState().resume();
          }
        },

        // File Actions
        clearAll: () => {
          set({ nodes: [], edges: [], selectedNode: null, selectedNodes: [], isDirty: true });
        },

        resetToDemo: () => {
          const now = new Date().toISOString();
          const freshNodes = initialNodes.map(node => ({
            ...JSON.parse(JSON.stringify(node)),
            data: {
              ...node.data,
              createdAt: now
            }
          }));

          set({
            nodes: freshNodes,
            edges: JSON.parse(JSON.stringify(initialEdges)),
            tags: JSON.parse(JSON.stringify(defaultTags)),
            selectedNode: null,
            selectedNodes: [],
            fileHandle: null,
            currentFileName: 'Untitled.json',
            isDirty: true,
            lastLoadedAt: Date.now(),
          });
        },

        exportToJSON: () => {
          const { nodes, edges, tags } = get();
          return JSON.stringify({ version: '1.0', exportedAt: new Date().toISOString(), nodes, edges, tags }, null, 2);
        },

        importFromJSON: (jsonString) => {
          try {
            const data = JSON.parse(jsonString);
            if (!data.nodes || !data.edges) throw new Error('Invalid format');
            set({
              nodes: data.nodes,
              edges: data.edges,
              tags: data.tags || defaultTags,
              selectedNode: null,
              selectedNodes: [],
              isDirty: false,
              lastLoadedAt: Date.now(),
            });
            return { success: true };
          } catch (e) {
            return { success: false, error: e.message };
          }
        },

        loadFromFile: async () => {
          try {
            if ('showOpenFilePicker' in window) {
              const handle = await getFileHandle();
              if (!handle) return { success: false, error: 'Cancelled' };
              const file = await handle.getFile();
              const result = get().importFromJSON(await file.text());
              if (result.success) set({ fileHandle: handle, currentFileName: file.name });
              return result;
            } else {
              return new Promise((resolve) => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = async (e) => {
                  const file = e.target.files[0];
                  if (!file) return resolve({ success: false, error: 'No file' });
                  const result = get().importFromJSON(await file.text());
                  if (result.success) set({ currentFileName: file.name });
                  resolve(result);
                };
                input.click();
              });
            }
          } catch (e) {
            return { success: false, error: e.message };
          }
        },

        saveToFile: async () => {
          const { fileHandle, exportToJSON } = get();
          if (fileHandle && 'showSaveFilePicker' in window) {
            try {
              await writeFile(fileHandle, exportToJSON());
              set({ isDirty: false, lastSavedAt: new Date().toISOString() });
              return { success: true };
            } catch (e) {
              console.warn('Handle write failed, falling back to Save As', e);
            }
          }
          return get().saveAs();
        },

        saveAs: async (suggestedName) => {
          const { exportToJSON, currentFileName } = get();
          const nameToUse = suggestedName || currentFileName || 'project.json';
          
          if ('showSaveFilePicker' in window) {
            try {
              const handle = await getNewFileHandle(nameToUse);
              if (!handle) return { success: false, error: 'Cancelled' };
              await writeFile(handle, exportToJSON());
              const file = await handle.getFile();
              set({ fileHandle: handle, currentFileName: file.name, isDirty: false, lastSavedAt: new Date().toISOString() });
              return { success: true };
            } catch (e) {
              return { success: false, error: e.message };
            }
          } else {
            const blob = new Blob([exportToJSON()], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = nameToUse.endsWith('.json') ? nameToUse : `${nameToUse}.json`;
            a.click();
            URL.revokeObjectURL(url);
            set({ currentFileName: a.download, isDirty: false, lastSavedAt: new Date().toISOString() });
            return { success: true };
          }
        },
      }),
      {
        partialize: (state) => ({ nodes: state.nodes, edges: state.edges }),
        limit: 50,
      }
    ),
    {
      name: 'task-dependency-graph-storage',
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
        tags: state.tags,
        currentFileName: state.currentFileName,
        isDirty: state.isDirty,
        snapshots: state.snapshots,
      }),
    }
  )
);

export const useTemporalStore = (selector, equality) => {
  return useZustandStore(useStore.temporal, selector, equality);
};

