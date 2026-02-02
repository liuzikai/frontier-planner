import { useStore, useTemporalStore } from '../store/useStore';
import { useReactFlow } from '@xyflow/react';

const MobileTaskToolbar = () => {
  const { 
    selectedNode, 
    selectedNodes, 
    addTask, 
    deleteTask, 
    setMobileEditOpen,
    setSelectedNode 
  } = useStore();
  
  const { undo, redo, pastStates, futureStates } = useTemporalStore((state) => state);
  const canUndo = pastStates.length > 0;
  const canRedo = futureStates.length > 0;

  const { screenToFlowPosition } = useReactFlow();

  const handleAdd = () => {
    // Center of screen
    const x = window.innerWidth / 2;
    const y = window.innerHeight / 2;
    const position = screenToFlowPosition({ x, y });
    
    const newNode = addTask(position);
    // Switch to edit mode for the new node
    if (newNode) {
      setMobileEditOpen(true);
    }
  };

  const handleEdit = () => {
    if (selectedNode) {
      setMobileEditOpen(true);
    }
  };

  const handleDelete = () => {
    if (selectedNode) {
      if (window.confirm('Delete this task?')) {
        deleteTask(selectedNode);
      }
    } else if (selectedNodes.length > 0) {
      if (window.confirm(`Delete ${selectedNodes.length} tasks?`)) {
        selectedNodes.forEach(id => deleteTask(id));
      }
    }
  };

  return (
    <div className="md:hidden fixed bottom-[10px] right-[10px] z-30 flex items-center gap-2">
      {/* Undo/Redo Group */}
      <div className="flex bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 dark:border-gray-700 p-1">
        <button
          onClick={() => undo()}
          disabled={!canUndo}
          className={`p-2 rounded-full transition-all active:scale-90 ${
            canUndo 
              ? 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700' 
              : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a2 2 0 012 2v4a1 1 0 11-2 0v-4H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <button
          onClick={() => redo()}
          disabled={!canRedo}
          className={`p-2 rounded-full transition-all active:scale-90 ${
            canRedo 
              ? 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700' 
              : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 14.707a1 1 0 001.414 0l4-4a1 1 0 000-1.414l-4-4a1 1 0 00-1.414 1.414L12.586 9H5a2 2 0 00-2 2v4a1 1 0 102 0v-4h7.586l-2.293 2.293a1 1 0 000 1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Action Buttons Group */}
      <div className="flex items-center gap-2">
        {/* Delete Button (Only when selected) */}
        {(selectedNode || selectedNodes.length > 0) && (
          <button
            onClick={handleDelete}
            className="p-3 bg-red-500 text-white rounded-full shadow-lg active:scale-95 transition-transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}

        {/* Edit Button (Only when exactly one selected) */}
        {selectedNode && (
          <button
            onClick={handleEdit}
            className="p-3 bg-amber-500 text-white rounded-full shadow-lg active:scale-95 transition-transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}

        {/* Add Button */}
        <button
          onClick={handleAdd}
          className="p-3 bg-blue-600 text-white rounded-full shadow-lg active:scale-95 transition-transform"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MobileTaskToolbar;
