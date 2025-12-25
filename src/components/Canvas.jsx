import { useCallback, useEffect, useState, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  useReactFlow,
} from '@xyflow/react';
import { useStore, useTemporalStore } from '../store/useStore';
import TaskNode from './TaskNode';
import Toolbar from './Toolbar';
import Sidebar from './Sidebar';
import { findFrontierTasks } from '../utils/frontierUtils';

// Define custom node types
const nodeTypes = {
  taskNode: TaskNode,
};

// Default edge options
const defaultEdgeOptions = {
  animated: true,
  style: {
    strokeWidth: 2,
    stroke: '#6366f1',
  },
};

const Canvas = () => {
  const {
    nodes,
    edges,
    selectedNode,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addTask,
    setSelectedNode,
    onNodeDragStart,
    onNodeDragStop,
  } = useStore();

  const undo = useTemporalStore((state) => state.undo);
  const redo = useTemporalStore((state) => state.redo);
  
  // Get React Flow instance to access viewport
  const reactFlowInstance = useReactFlow();

  // MiniMap visibility state
  const [showMiniMap, setShowMiniMap] = useState(true);

  // Calculate frontier tasks when a node is selected
  const frontierTasks = useMemo(() => {
    return findFrontierTasks(selectedNode, nodes, edges);
  }, [selectedNode, nodes, edges]);

  // Sync our selectedNode with React Flow's selection state and add frontier info
  const nodesWithSelection = nodes.map((node) => ({
    ...node,
    selected: node.id === selectedNode,
    data: {
      ...node.data,
      isFrontier: frontierTasks.has(node.id),
    },
  }));

  // Style edges based on source node status
  const edgesWithStyle = edges.map((edge) => {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const isDone = sourceNode?.data?.status === 'done';
    
    return {
      ...edge,
      animated: !isDone,
      style: {
        strokeWidth: 2,
        stroke: isDone ? '#9ca3af' : '#6366f1',
        opacity: isDone ? 0.4 : 1,
        strokeDasharray: isDone ? '5,5' : undefined,
      },
    };
  });

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check for Cmd/Ctrl + Z (undo) or Cmd/Ctrl + Shift + Z / Cmd/Ctrl + Y (redo)
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Get center of current viewport for adding new tasks
  const getViewportCenter = useCallback(() => {
    if (!reactFlowInstance) {
      // Fallback if React Flow instance is not ready
      return { x: 250, y: 250 };
    }
    
    const viewport = reactFlowInstance.getViewport();
    // Get the canvas dimensions (excluding sidebar which is 320px)
    const canvasWidth = window.innerWidth - 320; // 320px is sidebar width
    const canvasHeight = window.innerHeight;
    
    // Calculate center in screen coordinates
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    
    // Convert screen coordinates to flow coordinates using viewport transform
    // Formula: flowX = (screenX - viewport.x) / viewport.zoom
    const flowX = (centerX - viewport.x) / viewport.zoom;
    const flowY = (centerY - viewport.y) / viewport.zoom;
    
    return { x: flowX, y: flowY };
  }, [reactFlowInstance]);

  // Handle double-click to add new task
  const handlePaneDoubleClick = useCallback(
    (event) => {
      // Get the position relative to the flow
      const bounds = event.target.getBoundingClientRect();
      const position = {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      };
      addTask(position);
    },
    [addTask]
  );

  // Handle click on empty canvas to deselect
  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  // Handle node click to select
  const handleNodeClick = useCallback(
    (event, node) => {
      setSelectedNode(node.id);
    },
    [setSelectedNode]
  );

  return (
    <div className="flex h-screen w-full">
      {/* Main Canvas */}
      <div className="flex-1 relative">
        <Toolbar getViewportCenter={getViewportCenter} showMiniMap={showMiniMap} setShowMiniMap={setShowMiniMap} />
        <ReactFlow
          nodes={nodesWithSelection}
          edges={edgesWithStyle}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onPaneClick={handlePaneClick}
          onNodeClick={handleNodeClick}
          onDoubleClick={handlePaneDoubleClick}
          onNodeDragStart={onNodeDragStart}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.1}
          maxZoom={2}
          deleteKeyCode={['Backspace', 'Delete']}
          snapToGrid
          snapGrid={[15, 15]}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="#e5e7eb"
          />
          <Controls className="!bg-white !rounded-lg !shadow-lg !border !border-gray-200" />
          {showMiniMap && (
            <MiniMap
              nodeColor={(node) => {
                switch (node.data?.status) {
                  case 'done':
                    return '#22c55e';
                  case 'in-progress':
                    return '#3b82f6';
                  default:
                    return '#9ca3af';
                }
              }}
              maskColor="rgba(0, 0, 0, 0.1)"
              className="!bg-white !rounded-lg !shadow-lg !border !border-gray-200 animate-in fade-in slide-in-from-right-5 duration-300"
            />
          )}
        </ReactFlow>
      </div>

      {/* Sidebar - only show when a node is selected */}
      {selectedNode && <Sidebar />}
    </div>
  );
};

export default Canvas;
