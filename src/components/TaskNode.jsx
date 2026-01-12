import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { useStore } from '../store/useStore';
import { formatTime } from '../utils/timeUtils';
import Tooltip from './Tooltip';

const statusColors = {
  'todo': 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300',
  'in-progress': 'bg-blue-50 dark:bg-blue-800 border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-200',
  'done': 'bg-green-50 dark:bg-green-800 border-green-400 dark:border-green-600 text-green-700 dark:text-green-200',
  'someday': 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 border-dashed text-gray-700 dark:text-gray-400',
};

const statusLabels = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'done': 'Done',
  'someday': 'Someday',
};

const TaskNode = ({ id, data, selected }) => {
  const deleteTask = useStore((state) => state.deleteTask);
  const tags = useStore((state) => state.tags);
  const colorMode = useStore((state) => state.colorMode);
  const darkMode = useStore((state) => state.darkMode);

  const handleDelete = (e) => {
    e.stopPropagation();
    deleteTask(id);
  };

  // Get primary tag
  const primaryTag = tags.find((tag) => tag.id === data.primaryTag);

  // Determine opacity for done and someday tasks
  const nodeOpacity = data.status === 'done' ? 'opacity-40' : (data.status === 'someday' ? 'opacity-60' : 'opacity-100');

  // Determine node background color based on color mode
  const nodeBgClass = colorMode === 'status' 
    ? statusColors[data.status] 
    : (primaryTag 
        ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300' 
        : statusColors[data.status]);

  const tagStyle = (colorMode === 'tag' && primaryTag) ? {
    backgroundColor: darkMode 
      ? `color-mix(in srgb, ${primaryTag.color}, #1f2937 85%)` 
      : `color-mix(in srgb, ${primaryTag.color}, white 85%)`,
    borderColor: `${primaryTag.color}80`, // More descriptive border
    boxShadow: `0 0 15px ${primaryTag.color}10`, // Subtle inner glow
  } : {};

  return (
    <div className={`relative group ${nodeOpacity}`}>
      <div
        style={tagStyle}
        className={`
          min-w-[180px] max-w-[240px] rounded-xl shadow-xl border-2 transition-all duration-300
          ${nodeBgClass}
          ${selected ? 'ring-2 ring-purple-500 ring-offset-4 ring-offset-white dark:ring-offset-gray-900 scale-105 shadow-2xl' : 'hover:shadow-2xl hover:-translate-y-1'}
          ${data.isFrontier ? 'ring-4 ring-orange-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 shadow-orange-500/30' : ''}
        `}
      >
        {/* Input Handle (left side) */}
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3.5 !h-3.5 !bg-blue-500 !border-2 !border-white dark:!border-gray-900 !shadow-md hover:!scale-125 transition-transform"
        />

        {/* Header */}
        <div className={`px-3 pt-2.5 ${data.description ? 'pb-2.5 border-b border-inherit' : 'pb-3.5'} relative`}>
          {/* Delete button - Absolutely positioned */}
          <button
            onClick={handleDelete}
            className="absolute top-1.5 right-1.5 text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100"
            title="Delete task"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Content with right padding to avoid delete button overlap */}
          <div className="pr-5">
            <div className="flex flex-wrap gap-1 mb-1.5">
              {primaryTag && (
                <span
                  className="inline-block text-[9px] px-1.5 py-0.5 rounded-full font-bold text-gray-800 dark:text-gray-200 border shadow-sm"
                  style={{ 
                    backgroundColor: `${primaryTag.color}20`,
                    borderColor: `${primaryTag.color}50`,
                  }}
                >
                  {primaryTag.name}
                </span>
              )}
              <span className="inline-block text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-white/50 dark:bg-black/20 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 shadow-sm">
                {statusLabels[data.status]}
              </span>
              {data.estimatedTime && (
                <span className="inline-block text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-white/50 dark:bg-black/20 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 shadow-sm">
                  ⏱ {data.estimatedTime} {(data.estimatedTimeUnit || 'days').charAt(0)}
                </span>
              )}
            </div>
            <h3 className="font-bold text-[13px] leading-tight break-words text-gray-800 dark:text-gray-100">
              {data.title || 'Untitled Task'}
              {data.note && (
                <span className="text-gray-400 dark:text-gray-500 ml-1 inline-block" style={{ verticalAlign: '0.05em' }} title="Has note">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </h3>
          </div>
        </div>

        {/* Body */}
        {data.description && (
          <div className="px-3 py-2">
            <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
              {data.description}
            </p>
          </div>
        )}

        {/* Output Handle (right side) */}
        <Handle
          type="source"
          position={Position.Right}
          className="!w-3.5 !h-3.5 !bg-green-500 !border-2 !border-white dark:!border-gray-900 !shadow-md hover:!scale-125 transition-transform"
        />
        
        {/* Cumulative Time Display - on top of node, right side */}
        {data.cumulativeTime && (
          <Tooltip
            content={data.cumulativeTime.sum === data.cumulativeTime.min 
              ? "Time to reach this task from frontier nodes\n\n1 week = 5 days\n1 month = 4 weeks" 
              : "Σ = Sum (serial execution), total time if all tasks are done one after another\n↓ = Min (parallel execution), minimum time with maximum parallelism\n\n1 week = 5 days\n1 month = 4 weeks"
            }
            className={`absolute right-0 z-50 ${
              data.cumulativeTime.sum === data.cumulativeTime.min ? '-top-10' : '-top-14'
            }`}
          >
            <div className="bg-orange-500 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-xl shadow-xl cursor-help animate-in fade-in zoom-in duration-200">
              {data.cumulativeTime.sum === data.cumulativeTime.min ? (
                // Single time (frontier or equal)
                <div>{formatTime(data.cumulativeTime.sum)}</div>
              ) : (
                // Two times (sum and min)
                <div className="text-left leading-tight">
                  <div className="flex items-center gap-1.5">
                    <span className="opacity-70 font-mono">Σ</span>
                    <span>{formatTime(data.cumulativeTime.sum)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="opacity-70 font-mono">↓</span>
                    <span>{formatTime(data.cumulativeTime.min)}</span>
                  </div>
                </div>
              )}
            </div>
          </Tooltip>
        )}
        
        {/* Frontier node with no estimated time - show "?" */}
        {data.isFrontier && !data.estimatedTime && (
          <Tooltip
            content="Frontier node: Ready to start (all dependencies complete) but missing estimated time"
            className="absolute -top-10 right-0 z-50"
          >
            <div className="bg-orange-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-xl cursor-help animate-in fade-in zoom-in duration-200">
              ?
            </div>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

export default memo(TaskNode);
