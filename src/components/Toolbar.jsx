import { useState } from 'react';
import { useStore } from '../store/useStore';
import { useTemporalStore } from '../store/useStore';
import TagManager from './TagManager';

const Toolbar = ({ getViewportCenter, showMiniMap, setShowMiniMap }) => {
  const { addTask, clearAll, resetToDemo, nodes, saveToFile, loadFromFile, currentFileName, tags } = useStore();
  const [showTagManager, setShowTagManager] = useState(false);
  
  // Subscribe to temporal store reactively
  const undo = useTemporalStore((state) => state.undo);
  const redo = useTemporalStore((state) => state.redo);
  const pastStates = useTemporalStore((state) => state.pastStates);
  const futureStates = useTemporalStore((state) => state.futureStates);

  const handleAddTask = () => {
    // Add task at the center of the current viewport
    const position = getViewportCenter();
    addTask(position);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all tasks? This cannot be undone.')) {
      clearAll();
    }
  };

  const handleResetDemo = () => {
    if (window.confirm('This will reset to the demo project. Continue?')) {
      resetToDemo();
    }
  };

  const handleSave = () => {
    const filename = currentFileName || 'project.json';
    saveToFile(filename);
  };

  const handleOpen = async () => {
    const result = await loadFromFile();
    if (!result.success) {
      alert(`Failed to open file: ${result.error}`);
    }
  };

  const canUndo = pastStates.length > 0;
  const canRedo = futureStates.length > 0;

  // Calculate statistics
  const stats = {
    done: nodes.filter(n => n.data.status === 'done').length,
    inProgress: nodes.filter(n => n.data.status === 'in-progress').length,
    todo: nodes.filter(n => n.data.status === 'todo').length,
    someday: nodes.filter(n => n.data.status === 'someday').length,
    byTag: tags.map(tag => ({
      tag,
      count: nodes.filter(n => n.data.primaryTag === tag.id).length,
    })).filter(item => item.count > 0),
  };

  return (
    <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
      {/* File Operations */}
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 px-3 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors shadow-lg border border-gray-200"
        title="Open file (JSON)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z" clipRule="evenodd" />
          <path d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z" />
        </svg>
      </button>

      <button
        onClick={handleSave}
        className="flex items-center gap-2 px-3 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors shadow-lg border border-gray-200"
        title="Save to file (JSON)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.707 7.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L13 8.586V5h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2h3v3.586L5.707 7.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L9 8.586V5h.001L9.707 7.293z" />
        </svg>
      </button>

      {/* Divider */}
      <div className="w-px h-8 bg-gray-300" />

      {/* Undo/Redo */}
      <button
        onClick={() => undo()}
        disabled={!canUndo}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors shadow-lg border border-gray-200 ${
          canUndo
            ? 'bg-white text-gray-700 hover:bg-gray-100'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
        title="Undo (Ctrl+Z)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a2 2 0 012 2v4a1 1 0 11-2 0v-4H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
      </button>

      <button
        onClick={() => redo()}
        disabled={!canRedo}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors shadow-lg border border-gray-200 ${
          canRedo
            ? 'bg-white text-gray-700 hover:bg-gray-100'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
        title="Redo (Ctrl+Y)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10.293 14.707a1 1 0 001.414 0l4-4a1 1 0 000-1.414l-4-4a1 1 0 00-1.414 1.414L12.586 9H5a2 2 0 00-2 2v4a1 1 0 102 0v-4h7.586l-2.293 2.293a1 1 0 000 1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Divider */}
      <div className="w-px h-8 bg-gray-300" />

      {/* Add Task Button */}
      <button
        onClick={handleAddTask}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg font-medium"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        Add Task
      </button>

      {/* Divider */}
      <div className="w-px h-8 bg-gray-300" />

      {/* Manage Tags Button */}
      <button
        onClick={() => setShowTagManager(true)}
        className="flex items-center gap-2 px-3 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors shadow-lg border border-gray-200"
        title="Manage tags"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Reset Demo Button */}
      <button
        onClick={handleResetDemo}
        className="flex items-center gap-2 px-3 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors shadow-lg border border-gray-200"
        title="Reset to demo"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Clear All Button */}
      <button
        onClick={handleClearAll}
        className="flex items-center gap-2 px-3 py-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors shadow-lg border border-gray-200"
        title="Clear all tasks"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Divider */}
      <div className="w-px h-8 bg-gray-300" />

      {/* Current File Name */}
      {currentFileName && (
        <div className="px-3 py-2 bg-blue-50 rounded-lg shadow-lg border border-blue-200 text-sm text-blue-700">
          {currentFileName}
        </div>
      )}

      {/* Tag Manager Modal */}
      <TagManager isOpen={showTagManager} onClose={() => setShowTagManager(false)} />
    </div>
  );
};

export default Toolbar;
