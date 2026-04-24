import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { useStore } from '../store/useStore';

const GroupNode = ({ id, data, selected }) => {
  const toggleGroupCollapsed = useStore((state) => state.toggleGroupCollapsed);
  const ungroupTasks = useStore((state) => state.ungroupTasks);
  const darkMode = useStore((state) => state.darkMode);
  const setSelectedNode = useStore((state) => state.setSelectedNode);
  const setSelectedNodes = useStore((state) => state.setSelectedNodes);
  const selectedNodes = useStore((state) => state.selectedNodes);
  const isCollapsed = data.isCollapsed;

  const handleToggle = (e) => {
    e.stopPropagation();
    toggleGroupCollapsed(id);
  };

  const handleUngroup = (e) => {
    e.stopPropagation();
    ungroupTasks(id);
  };

  // For expanded groups the RF wrapper has pointer-events:none, so we handle
  // selection here. stopPropagation prevents onNodeClick from double-firing.
  const handleHeaderClick = (e) => {
    e.stopPropagation();
    if (e.metaKey || e.ctrlKey) {
      if (selectedNodes.includes(id)) {
        setSelectedNodes(selectedNodes.filter(nid => nid !== id));
      } else {
        setSelectedNodes([...selectedNodes, id]);
      }
    } else {
      setSelectedNode(id);
    }
  };

  return (
    // Outer wrapper fills the node's React-Flow-controlled size.
    // pointer-events-none on the background so clicks fall through to child task nodes;
    // pointer-events-auto is restored on the interactive header strip.
    <div className={`w-full h-full relative group ${!isCollapsed ? 'pointer-events-none' : ''}`}>

      {/* Always-present handles so edges can connect regardless of collapse state */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-white dark:!border-gray-900 pointer-events-auto"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-white dark:!border-gray-900 pointer-events-auto"
      />

      {/* Visible container border — always pointer-events-auto so the dashed ring is clickable.
          For expanded groups this also acts as a selection target (RF wrapper is pointer-events:none). */}
      <div
        className={`
          w-full h-full rounded-2xl border-2 border-dashed transition-colors duration-200
          pointer-events-auto
          ${darkMode ? 'bg-indigo-900/10 border-indigo-500/30' : 'bg-indigo-500/5 border-indigo-500/20'}
          ${selected ? 'border-solid ring-2 ring-indigo-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900' : ''}
          ${!isCollapsed ? 'cursor-pointer' : ''}
        `}
        onClick={!isCollapsed ? (e) => { e.stopPropagation(); handleHeaderClick(e); } : undefined}
      />

      {/* Header strip — interactive, drag handle, and selection target for expanded groups */}
      <div
        className={`absolute top-0 left-0 right-0 pointer-events-auto group-drag-handle flex items-center justify-between px-3 py-2 z-10 ${!isCollapsed ? 'cursor-grab active:cursor-grabbing' : ''}`}
        onDoubleClick={e => e.stopPropagation()}
        onClick={!isCollapsed ? handleHeaderClick : undefined}
      >
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleToggle}
            className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            title={isCollapsed ? 'Expand group' : 'Collapse group'}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300 select-none truncate max-w-[160px]">
            {data.title}
          </span>
        </div>

        <button
          onClick={handleUngroup}
          className="p-1 rounded text-indigo-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100"
          title="Ungroup"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Collapsed label: show description if set */}
      {isCollapsed && data.description && (
        <div className="absolute inset-0 flex items-center justify-center mt-6 px-3 pointer-events-none">
          <span className="text-xs text-indigo-500 dark:text-indigo-400 line-clamp-2 text-center">{data.description}</span>
        </div>
      )}
    </div>
  );
};

export default memo(GroupNode);
