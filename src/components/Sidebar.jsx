import { useState, useEffect, useCallback, useRef } from 'react';
import { useStore } from '../store/useStore';

const Sidebar = ({ onMinimize }) => {
  const { nodes, selectedNode, updateTask, setSelectedNode, tags } = useStore();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    primaryTag: null,
    tags: [],
    estimatedTime: '',
    estimatedTimeUnit: 'days',
    note: '',
  });

  const selectedNodeData = nodes.find((node) => node.id === selectedNode);
  const debounceTimerRef = useRef(null);
  const pendingChangesRef = useRef(null);
  const titleRef = useRef(null);

  // Auto-resize title textarea
  const adjustTitleHeight = useCallback(() => {
    if (titleRef.current) {
      titleRef.current.style.height = 'auto';
      titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    adjustTitleHeight();
  }, [formData.title, selectedNode, adjustTitleHeight]);

  // All hooks must be called before any conditional returns
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Store pending changes
    pendingChangesRef.current = { [name]: value };
    
    // Debounce the updateTask call so rapid typing only creates one history entry
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    if (selectedNode) {
      debounceTimerRef.current = setTimeout(() => {
        updateTask(selectedNode, { [name]: value });
        pendingChangesRef.current = null;
      }, 500); // Wait 500ms after last keystroke before saving to history
    }
  }, [selectedNode, updateTask]);

  const handleStatusChange = useCallback((status) => {
    setFormData((prev) => ({ ...prev, status }));
    if (selectedNode) {
      updateTask(selectedNode, { status });
    }
  }, [selectedNode, updateTask]);

  const handleTagChange = useCallback((e) => {
    const tagId = e.target.value || null;
    setFormData((prev) => ({ ...prev, primaryTag: tagId }));
    if (selectedNode) {
      updateTask(selectedNode, { primaryTag: tagId });
    }
  }, [selectedNode, updateTask]);

  const handleAdditionalTagAdd = useCallback((tagId) => {
    if (!tagId) return;
    setFormData((prev) => {
      const newTags = [tagId, ...(prev.tags || [])].filter((val, index, self) => self.indexOf(val) === index);
      if (selectedNode) {
        updateTask(selectedNode, { tags: newTags });
      }
      return { ...prev, tags: newTags };
    });
  }, [selectedNode, updateTask]);

  const handleAdditionalTagRemove = useCallback((tagId) => {
    setFormData((prev) => {
      const newTags = (prev.tags || []).filter(id => id !== tagId);
      if (selectedNode) {
        updateTask(selectedNode, { tags: newTags });
      }
      return { ...prev, tags: newTags };
    });
  }, [selectedNode, updateTask]);

  const handleTimeUnitChange = useCallback((unit) => {
    setFormData((prev) => ({ ...prev, estimatedTimeUnit: unit }));
    if (selectedNode) {
      updateTask(selectedNode, { estimatedTimeUnit: unit });
    }
  }, [selectedNode, updateTask]);

  const handleClose = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  useEffect(() => {
    if (selectedNodeData) {
      setFormData({
        title: selectedNodeData.data.title || '',
        description: selectedNodeData.data.description || '',
        status: selectedNodeData.data.status || 'todo',
        primaryTag: selectedNodeData.data.primaryTag || null,
        tags: selectedNodeData.data.tags || [],
        estimatedTime: selectedNodeData.data.estimatedTime || '',
        estimatedTimeUnit: selectedNodeData.data.estimatedTimeUnit || 'days',
        note: selectedNodeData.data.note || '',
      });
    }
  }, [selectedNodeData]);

  // Flush pending changes before node changes or unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      // If there are pending changes, apply them immediately
      if (pendingChangesRef.current && selectedNode) {
        updateTask(selectedNode, pendingChangesRef.current);
        pendingChangesRef.current = null;
      }
    };
  }, [selectedNode, updateTask]);

  // Show welcome panel if no node is selected
  if (!selectedNode) {
    return (
      <div className="w-80 h-screen bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-2xl flex flex-col z-20">
        {/* Header with minimize button */}
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <h2 className="font-bold text-gray-900 dark:text-gray-100 tracking-tight">Frontier Planner</h2>
          <button
            onClick={onMinimize}
            className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all active:scale-90"
            title="Close panel"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {/* Welcome content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Getting Started */}
          <div className="space-y-2.5">
            <h3 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Getting Started</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <span>Double-click canvas to add task</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <span>Select node to edit & show frontier</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <span>Drag to reposition nodes</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <span>Connect handles for dependencies</span>
              </li>
            </ul>
          </div>
          
          {/* Features */}
          <div className="space-y-2.5">
            <h3 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Features</h3>
            <div className="space-y-2.5">
              <div className="p-3 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-900/20">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-orange-500 font-bold">◉</span>
                  <span className="text-sm font-bold text-orange-900 dark:text-orange-300">Frontier Nodes</span>
                </div>
                <p className="text-xs text-orange-800 dark:text-orange-400 leading-relaxed">Orange rings show next actionable tasks (all dependencies complete).</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/20">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-blue-500 font-bold">⏱</span>
                  <span className="text-sm font-bold text-blue-900 dark:text-blue-300">Time Estimation</span>
                </div>
                <p className="text-xs text-blue-800 dark:text-blue-400 leading-relaxed">Σ (sum) and ↓ (min) show time to reach selected task.</p>
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="space-y-2.5">
            <h3 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Statistics</h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-3 border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</span>
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{nodes.length}</span>
              </div>
              <div className="h-px bg-gray-200 dark:bg-gray-800"></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold">Done</span>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">{nodes.filter(n => n.data.status === 'done').length}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold">In Progress</span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{nodes.filter(n => n.data.status === 'in-progress').length}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold">To Do</span>
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-400">{nodes.filter(n => n.data.status === 'todo').length}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold">Someday</span>
                  <span className="text-sm font-bold text-gray-400 dark:text-gray-600">{nodes.filter(n => n.data.status === 'someday').length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show task details if node is selected and data exists
  if (!selectedNode || !selectedNodeData) {
    return (
      <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-8 flex flex-col items-center justify-center text-gray-400 z-20">
        <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 border border-gray-100 dark:border-gray-700 shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-center text-sm font-medium leading-relaxed dark:text-gray-500">Select a task to view and edit its details</p>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-2xl flex flex-col z-20">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
        <h2 className="font-bold text-gray-900 dark:text-gray-100 tracking-tight">Task Details</h2>
        <button
          onClick={handleClose}
          className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all active:scale-90"
          title="Close (deselect)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Title */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Title
          </label>
          <textarea
            ref={titleRef}
            name="title"
            value={formData.title}
            onChange={handleChange}
            rows={1}
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm text-sm font-bold text-gray-800 dark:text-gray-100 resize-none overflow-hidden leading-relaxed"
            placeholder="Enter task title..."
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none shadow-sm text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
            placeholder="Enter task description..."
          />
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Status
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'todo', label: 'To Do' },
              { value: 'in-progress', label: 'In Progress' },
              { value: 'done', label: 'Done' },
              { value: 'someday', label: 'Someday' },
            ].map((status) => (
              <button
                key={status.value}
                type="button"
                onClick={() => handleStatusChange(status.value)}
                className={`px-3 py-2 text-sm font-bold rounded-xl border transition-all active:scale-95 ${
                  formData.status === status.value
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Tag */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Primary Tag
          </label>
          <div className="relative">
            <select
              name="primaryTag"
              value={formData.primaryTag || ''}
              onChange={handleTagChange}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer appearance-none shadow-sm text-sm font-bold text-gray-800 dark:text-gray-100"
            >
              <option value="">No Tag</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {/* Additional Tags */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Additional Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-1">
            {(formData.tags || []).filter(tId => tId !== formData.primaryTag).map(tagId => {
              const tag = tags.find(t => t.id === tagId);
              if (!tag) return null;
              return (
                <div key={tag.id} 
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border shadow-sm text-xs font-bold transition-all hover:scale-105"
                  style={{ backgroundColor: `${tag.color}15`, borderColor: `${tag.color}40`, color: tag.color }}
                >
                  <span>{tag.name}</span>
                  <button 
                    onClick={() => handleAdditionalTagRemove(tag.id)} 
                    className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              );
            })}
            
            <div className="relative">
              <select
                 onChange={(e) => {
                     handleAdditionalTagAdd(e.target.value);
                     e.target.value = '';
                 }}
                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              >
                 <option value="">Add Tag</option>
                 {tags.filter(t => t.id !== formData.primaryTag && !(formData.tags || []).includes(t.id)).map((tag) => (
                     <option key={tag.id} value={tag.id}>
                         {tag.name}
                     </option>
                 ))}
              </select>
              <div className="flex items-center justify-center px-2 py-1.5 h-full rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-blue-500 hover:border-blue-500 dark:hover:text-blue-400 dark:hover:border-blue-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Estimated Time */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Estimated Time
          </label>
          <div className="flex gap-2">
            {/* Number Input */}
            <input
              type="number"
              name="estimatedTime"
              value={formData.estimatedTime}
              onChange={handleChange}
              step="0.5"
              min="0"
              className="w-24 px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm text-sm font-bold text-gray-800 dark:text-gray-100"
              placeholder="0"
            />
            
            {/* Unit Selection */}
            <div className="flex flex-1 bg-gray-50 dark:bg-gray-700 p-1 rounded-xl border border-gray-200 dark:border-gray-700 shadow-inner">
              {['days', 'weeks', 'months'].map((unit) => (
                <button
                  key={unit}
                  type="button"
                  onClick={() => handleTimeUnitChange(unit)}
                  className={`flex-1 py-1.5 text-[11px] font-bold uppercase tracking-tight rounded-xl transition-all active:scale-95 ${
                    formData.estimatedTimeUnit === unit
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm border border-blue-100 dark:border-blue-900/50'
                      : 'text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400'
                  }`}
                >
                  {unit}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Notes
          </label>
          <textarea
            name="note"
            value={formData.note}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none shadow-sm text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
            placeholder="Add notes..."
          />
        </div>
      </div>

      {/* Footer with creation date */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/30 dark:bg-transparent">
        <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <span>Created</span>
          <span>{new Date(selectedNodeData.data.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
