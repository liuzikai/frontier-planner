import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { useStore } from '../store/useStore';

const statusColors = {
  'todo': 'bg-gray-100 border-gray-300 text-gray-700',
  'in-progress': 'bg-blue-50 border-blue-400 text-blue-700',
  'done': 'bg-green-50 border-green-400 text-green-700',
  'someday': 'bg-gray-100 border-gray-300 border-dashed text-gray-700',
};

const statusLabels = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'done': 'Done',
  'someday': 'Someday',
};

const TaskNode = ({ id, data, selected }) => {
  const setSelectedNode = useStore((state) => state.setSelectedNode);
  const deleteTask = useStore((state) => state.deleteTask);
  const tags = useStore((state) => state.tags);

  const handleClick = (e) => {
    e.stopPropagation();
    setSelectedNode(id);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    deleteTask(id);
  };

  // Get primary tag
  const primaryTag = tags.find((tag) => tag.id === data.primaryTag);

  // Determine opacity for done and someday tasks
  const nodeOpacity = data.status === 'done' ? 'opacity-40' : (data.status === 'someday' ? 'opacity-60' : 'opacity-100');

  return (
    <div className={`relative group ${nodeOpacity}`}>
      <div
        onClick={handleClick}
        className={`
          min-w-[200px] max-w-[280px] rounded-lg shadow-lg border-2 transition-all duration-200
          ${statusColors[data.status]}
          ${selected ? 'ring-2 ring-blue-500 ring-offset-2 scale-105' : 'hover:shadow-xl'}
          ${data.isFrontier ? 'ring-4 ring-orange-500 ring-offset-2 shadow-orange-500/50' : ''}
        `}
      >
        {/* Input Handle (left side) */}
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
        />

        {/* Header */}
        <div className={`px-3 py-2 ${data.description ? 'border-b border-inherit' : ''} relative`}>
          {/* Delete button - Absolutely positioned */}
          <button
            onClick={handleDelete}
            className="absolute top-1.5 right-1.5 text-gray-400 hover:text-red-500 transition-colors p-0.5"
            title="Delete task"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Content with right padding to avoid delete button overlap */}
          <div className="pr-8">
            <div className="flex flex-wrap gap-1 mb-1">
              {primaryTag && (
                <span
                  className="inline-block text-[10px] px-1.5 py-0.5 rounded font-medium text-gray-800 border"
                  style={{ 
                    backgroundColor: `${primaryTag.color}30`,
                    borderColor: `${primaryTag.color}70`,
                  }}
                >
                  {primaryTag.name}
                </span>
              )}
              <span className="inline-block text-[10px] px-1.5 py-0.5 rounded font-medium bg-gray-100 text-gray-600">
                {statusLabels[data.status]}
              </span>
              {data.estimatedTime && (
                <span className="inline-block text-[10px] px-1.5 py-0.5 rounded font-medium bg-gray-100 text-gray-600">
                  ⏱ {data.estimatedTime} {data.estimatedTimeUnit || 'days'}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-sm leading-tight break-words inline">
              {data.title || 'Untitled Task'}
              {data.note && (
                <span className="text-gray-400 ml-1 inline-block" style={{ verticalAlign: '0.05em' }} title="Has note">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </h3>
          </div>
        </div>

        {/* Body */}
        <div className="px-3 py-2">
          {data.description && (
            <p className="text-xs text-gray-600 line-clamp-2">
              {data.description}
            </p>
          )}
        </div>

        {/* Output Handle (right side) */}
        <Handle
          type="source"
          position={Position.Right}
          className="!w-3 !h-3 !bg-green-500 !border-2 !border-white"
        />
      </div>
    </div>
  );
};

export default memo(TaskNode);
