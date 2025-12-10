import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { useStore } from '../store/useStore';

const statusColors = {
  'todo': 'bg-gray-100 border-gray-300 text-gray-700',
  'in-progress': 'bg-blue-50 border-blue-400 text-blue-700',
  'done': 'bg-green-50 border-green-400 text-green-700',
};

const statusLabels = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'done': 'Done',
};

const priorityColors = {
  'low': 'bg-gray-200 text-gray-600',
  'medium': 'bg-yellow-200 text-yellow-700',
  'high': 'bg-red-200 text-red-700',
};

const TaskNode = ({ id, data, selected }) => {
  const setSelectedNode = useStore((state) => state.setSelectedNode);
  const deleteTask = useStore((state) => state.deleteTask);

  const handleClick = (e) => {
    e.stopPropagation();
    setSelectedNode(id);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    deleteTask(id);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        min-w-[200px] max-w-[280px] rounded-lg shadow-lg border-2 transition-all duration-200
        ${statusColors[data.status]}
        ${selected ? 'ring-2 ring-blue-500 ring-offset-2 scale-105' : 'hover:shadow-xl'}
      `}
    >
      {/* Input Handle (left side) */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
      />

      {/* Header */}
      <div className="px-3 py-2 border-b border-inherit">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm leading-tight flex-1 break-words">
            {data.title || 'Untitled Task'}
          </h3>
          <button
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-500 transition-colors p-0.5 -mr-1 -mt-0.5"
            title="Delete task"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="px-3 py-2 space-y-2">
        {data.description && (
          <p className="text-xs text-gray-600 line-clamp-2">
            {data.description}
          </p>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${priorityColors[data.priority]}`}>
            {data.priority}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">
            {statusLabels[data.status]}
          </span>
        </div>
      </div>

      {/* Output Handle (right side) */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-green-500 !border-2 !border-white"
      />
    </div>
  );
};

export default memo(TaskNode);
