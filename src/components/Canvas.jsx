import { useCallback, useEffect, useState, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  ControlButton,
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
import { calculateCumulativeTimes } from '../utils/timeUtils';

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
    selectedNodes,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addTask,
    setSelectedNode,
    setSelectedNodes,
    onNodeDragStart,
    onNodeDragStop,
  } = useStore();

  const undo = useTemporalStore((state) => state.undo);
  const redo = useTemporalStore((state) => state.redo);
  
  // Get React Flow instance to access viewport
  const reactFlowInstance = useReactFlow();

  // MiniMap visibility state
  const [showMiniMap, setShowMiniMap] = useState(true);
  
  // Sidebar minimize state (persists until a node is selected)
  const [sidebarMinimized, setSidebarMinimized] = useState(false);
  
  // Reset minimize state when a node is selected
  useEffect(() => {
    if (selectedNode) {
      setSidebarMinimized(false);
    }
  }, [selectedNode]);

  // Calculate frontier tasks only when exactly one node is selected
  // Disabled for multi-select to maintain focus on single-target analysis
  const frontierTasks = useMemo(() => {
    if (selectedNodes.length !== 1) {
      return new Set(); // Return empty set for multi-select
    }
    return findFrontierTasks(selectedNode, nodes, edges);
  }, [selectedNode, selectedNodes, nodes, edges]);

  // Calculate cumulative times only when exactly one node is selected
  // Disabled for multi-select to maintain focus on single-target analysis
  const cumulativeTimes = useMemo(() => {
    if (selectedNodes.length !== 1) {
      return new Map(); // Return empty map for multi-select
    }
    return calculateCumulativeTimes(selectedNode, frontierTasks, nodes, edges);
  }, [selectedNode, selectedNodes, frontierTasks, nodes, edges]);

  // Sync our selectedNodes with React Flow's selection state and add frontier info
  // Frontier and time info only shown when single node selected
  const nodesWithSelection = nodes.map((node) => ({
    ...node,
    selected: selectedNodes.includes(node.id),
    data: {
      ...node.data,
      isFrontier: frontierTasks.has(node.id),
      cumulativeTime: cumulativeTimes.get(node.id),
    },
  }));

  // Style edges based on source node status
  const edgesWithStyle = edges.map((edge) => {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const isDone = sourceNode?.data?.status === 'done';
    const isSomeday = sourceNode?.data?.status === 'someday';
    
    return {
      ...edge,
      animated: !isDone && !isSomeday,
      style: {
        strokeWidth: 2,
        stroke: (isDone || isSomeday) ? '#9ca3af' : '#6366f1',
        opacity: (isDone || isSomeday) ? 0.4 : 1,
        strokeDasharray: (isDone || isSomeday) ? '5,5' : undefined,
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

  // Handle click on empty canvas to deselect all
  const handlePaneClick = useCallback(() => {
    setSelectedNodes([]);
  }, [setSelectedNodes]);

  // Handle node click to select
  // Support Cmd+Click (Mac) or Ctrl+Click (Windows) for multi-select
  const handleNodeClick = useCallback(
    (event, node) => {
      const isMultiSelectKey = event.metaKey || event.ctrlKey;
      
      if (isMultiSelectKey) {
        // Add/remove from selection
        if (selectedNodes.includes(node.id)) {
          // Deselect if already selected
          const newSelection = selectedNodes.filter(id => id !== node.id);
          setSelectedNodes(newSelection);
        } else {
          // Add to selection
          setSelectedNodes([...selectedNodes, node.id]);
        }
      } else {
        // Single select (replace selection)
        setSelectedNode(node.id);
      }
    },
    [setSelectedNode, setSelectedNodes, selectedNodes]
  );

  // Handle selection change from React Flow (for box select and multi-select)
  const handleSelectionChange = useCallback(
    ({ nodes: selectedNodesFromFlow }) => {
      const selectedIds = selectedNodesFromFlow.map((n) => n.id);
      setSelectedNodes(selectedIds);
    },
    [setSelectedNodes]
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
          onSelectionChange={handleSelectionChange}
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
          panOnScroll
          panOnScrollMode="free"
          zoomOnScroll={false}
          zoomOnPinch
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="#e5e7eb"
          />
          <Controls className="!bg-white !rounded-lg !shadow-lg !border !border-gray-200">
            <ControlButton
              onClick={() => setShowMiniMap(!showMiniMap)}
              title={showMiniMap ? 'Hide minimap' : 'Show minimap'}
              className={showMiniMap ? '!bg-blue-50 !text-blue-700' : ''}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd" />
              </svg>
            </ControlButton>
          </Controls>
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
              className="!bg-white !rounded-lg !shadow-lg !border !border-gray-200 !left-10 animate-in fade-in slide-in-from-left-5 duration-300"
              position="bottom-left"
            />
          )}
        </ReactFlow>
      </div>

      {/* Sidebar - show by default unless minimized or multi-select */}
      {!sidebarMinimized && selectedNodes.length <= 1 && (
        <Sidebar onMinimize={() => setSidebarMinimized(true)} />
      )}
    </div>
  );
};

export default Canvas;
