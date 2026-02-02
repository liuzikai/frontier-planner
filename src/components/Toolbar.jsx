import { useState } from 'react';
import { useStore } from '../store/useStore';
import { useTemporalStore } from '../store/useStore';
import TagManager from './TagManager';

const Toolbar = ({ getViewportCenter }) => {
  const { 
    addTask, 
    resetToDemo, 
    nodes, 
    saveToFile, 
    saveAs,
    loadFromFile, 
    currentFileName, 
    isDirty,
    isNativeFileSystemSupported,
    tags,
    selectionMode,
    setSelectionMode,
    animationsEnabled
  } = useStore();
  const [showTagManager, setShowTagManager] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadFileName, setDownloadFileName] = useState('');
  
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

  const handleSave = async () => {
    if (!isNativeFileSystemSupported) {
      setDownloadFileName(currentFileName || 'project.json');
      setShowDownloadModal(true);
      return;
    }
    const result = await saveToFile();
    if (result && !result.success && result.error !== 'Cancelled') {
      alert(`Failed to save: ${result.error}`);
    }
  };

  const handleConfirmDownload = (e) => {
    e.preventDefault();
    saveAs(downloadFileName).then(result => {
      if (result && result.success) {
        setShowDownloadModal(false);
      } else if (result && result.error !== 'Cancelled') {
        alert(`Failed to download: ${result.error}`);
      }
    });
  };

  const handleSaveAs = () => {
    saveAs().then(result => {
      if (result && !result.success && result.error !== 'Cancelled') {
        alert(`Failed to save: ${result.error}`);
      }
    });
  };

  const handleOpen = () => {
    if (isDirty && !window.confirm('You have unsaved changes. Open another file anyway?')) {
      return;
    }
    loadFromFile().then(result => {
      if (result && !result.success && result.error !== 'Cancelled') {
        alert(`Failed to open file: ${result.error}`);
      }
    });
  };

  const handleNew = () => {
    if (isDirty && !window.confirm('You have unsaved changes. Create new canvas anyway?')) {
      return;
    }
    resetToDemo();
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
    <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 max-w-[calc(100vw-2rem)]">
      {/* File Operations */}
      <div className="flex items-center bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <button
          onClick={handleNew}
          className="hidden md:block p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-r border-gray-200 dark:border-gray-700"
          title="New Canvas"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="12" y1="18" x2="12" y2="12"></line>
            <line x1="9" y1="15" x2="15" y2="15"></line>
          </svg>
        </button>
        <button
          onClick={handleOpen}
          className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-r border-gray-200 dark:border-gray-700"
          title="Open File"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
        </button>
        
        {isNativeFileSystemSupported ? (
          <>
            <button
              onClick={handleSave}
              className="hidden md:flex p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-r border-gray-200 dark:border-gray-700 relative"
              title="Save (Ctrl+S)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              {isDirty && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border border-white dark:border-gray-800" />
              )}
            </button>
            <button
              onClick={handleSaveAs}
              className="hidden md:block p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              title="Save As..."
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <path d="M7 3v5h8"></path>
                <circle cx="18" cy="18" r="3"></circle>
                <line x1="18" y1="16" x2="18" y2="20"></line>
                <line x1="16" y1="18" x2="20" y2="18"></line>
              </svg>
            </button>
            {/* Mobile Fallback Save (Download) when native is supported but we want mobile consistency */}
            <button
              onClick={handleSave}
              className="md:hidden p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors relative"
              title="Download Canvas"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              {isDirty && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border border-white dark:border-gray-800" />
              )}
            </button>
          </>
        ) : (
          <button
            onClick={handleSave}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors relative"
            title="Download Canvas"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            {isDirty && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border border-white dark:border-gray-800" />
            )}
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="hidden md:block w-px h-8 bg-gray-300 dark:bg-gray-700 mx-1" />

      {/* Undo/Redo */}
      <div className="hidden md:flex items-center gap-2">
        <button
          onClick={() => undo()}
          disabled={!canUndo}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all shadow-xl border border-gray-200 dark:border-gray-700 active:scale-95 ${
            canUndo
              ? 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              : 'bg-gray-50 dark:bg-gray-800/50 text-gray-300 dark:text-gray-700 cursor-not-allowed'
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
          className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all shadow-xl border border-gray-200 dark:border-gray-700 active:scale-95 ${
            canRedo
              ? 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              : 'bg-gray-50 dark:bg-gray-800/50 text-gray-300 dark:text-gray-700 cursor-not-allowed'
          }`}
          title="Redo (Ctrl+Alt+Z)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 14.707a1 1 0 001.414 0l4-4a1 1 0 000-1.414l-4-4a1 1 0 00-1.414 1.414L12.586 9H5a2 2 0 00-2 2v4a1 1 0 102 0v-4h7.586l-2.293 2.293a1 1 0 000 1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Divider */}
      <div className="hidden md:block w-px h-8 bg-gray-300 dark:bg-gray-700 mx-1" />

      {/* Selection Mode Toggle */}
      <div className="hidden md:flex bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <button
          onClick={() => setSelectionMode('pan')}
          className={`p-2 transition-colors border-r border-gray-200 dark:border-gray-700 ${
            selectionMode === 'pan' 
              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
              : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
          title="Pan Mode"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"></path>
            <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"></path>
            <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"></path>
            <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"></path>
          </svg>
        </button>
        <button
          onClick={() => setSelectionMode('select')}
          className={`p-2 transition-colors ${
            selectionMode === 'select' 
              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
              : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
          title="Select Mode (Box Selection)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" strokeDasharray="4 4"></rect>
            <line x1="12" y1="9" x2="12" y2="15"></line>
            <line x1="9" y1="12" x2="15" y2="12"></line>
          </svg>
        </button>
      </div>

      {/* Divider */}
      <div className="hidden md:block w-px h-8 bg-gray-300 dark:bg-gray-700 mx-1" />

      {/* Add Task Button */}
      <button
        onClick={handleAddTask}
        className="hidden md:flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-xl font-bold active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        Add Task
      </button>

      {/* Divider */}
      <div className="hidden md:block w-px h-8 bg-gray-300 dark:bg-gray-700 mx-1" />

      {/* Manage Tags Button */}
      <button
        onClick={() => setShowTagManager(true)}
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-xl border border-gray-200 dark:border-gray-700 active:scale-95"
        title="Manage tags"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Divider */}
      <div className="hidden md:block w-px h-8 bg-gray-300 dark:bg-gray-700 mx-1" />

      {/* Current File Name */}
      {currentFileName && (
        <div className={`px-4 py-2 rounded-xl shadow-xl border text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
          isDirty 
            ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700 text-orange-700 dark:text-orange-400' 
            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-400'
        }`}>
          <span className="max-w-[100px] md:max-w-[150px] truncate">{currentFileName}</span>
          {isDirty && <span className={`w-1.5 h-1.5 bg-orange-500 rounded-full ${animationsEnabled ? 'animate-pulse' : ''}`} />}
        </div>
      )}

      {/* Tag Manager Modal */}
      <TagManager isOpen={showTagManager} onClose={() => setShowTagManager(false)} />

      {/* Download Filename Modal (Safari/Legacy) */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 dark:bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
              <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">Download Canvas</h2>
              <button onClick={() => setShowDownloadModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleConfirmDownload} className="p-4 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 ml-1">
                  Filename
                </label>
                <input
                  autoFocus
                  type="text"
                  value={downloadFileName}
                  onChange={(e) => setDownloadFileName(e.target.value)}
                  placeholder="project.json"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-gray-100"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowDownloadModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                >
                  Download
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Toolbar;
