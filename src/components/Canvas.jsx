import { useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
} from '@xyflow/react';
import { useStore } from '../store/useStore';
import TaskNode from './TaskNode';
import Toolbar from './Toolbar';
import Sidebar from './Sidebar';

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
    onNodesChange,
    onEdgesChange,
    onConnect,
    addTask,
    setSelectedNode,
  } = useStore();

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

  return (
    <div className="flex h-screen w-full">
      {/* Main Canvas */}
      <div className="flex-1 relative">
        <Toolbar />
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onPaneClick={handlePaneClick}
          onDoubleClick={handlePaneDoubleClick}
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
            className="!bg-white !rounded-lg !shadow-lg !border !border-gray-200"
          />
        </ReactFlow>

        {/* Instructions overlay */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 px-4 py-3 text-sm text-gray-600 max-w-xs">
          <p className="font-medium text-gray-800 mb-1">Quick Tips:</p>
          <ul className="space-y-1 text-xs">
            <li>• <strong>Double-click</strong> canvas to add task</li>
            <li>• <strong>Drag</strong> tasks to reposition</li>
            <li>• <strong>Connect</strong> handles to create dependencies</li>
            <li>• <strong>Click</strong> task to edit details</li>
          </ul>
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar />
    </div>
  );
};

export default Canvas;
