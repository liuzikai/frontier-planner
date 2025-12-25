import { useState, useEffect, useCallback, useRef } from 'react';
import { useStore } from '../store/useStore';

const Sidebar = () => {
  const { nodes, selectedNode, updateTask, setSelectedNode, tags } = useStore();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    primaryTag: null,
    estimatedTime: '',
    estimatedTimeUnit: 'days',
    note: '',
  });

  const selectedNodeData = nodes.find((node) => node.id === selectedNode);
  const debounceTimerRef = useRef(null);
  const pendingChangesRef = useRef(null);

  useEffect(() => {
    if (selectedNodeData) {
      setFormData({
        title: selectedNodeData.data.title || '',
        description: selectedNodeData.data.description || '',
        status: selectedNodeData.data.status || 'todo',
        primaryTag: selectedNodeData.data.primaryTag || null,
        estimatedTime: selectedNodeData.data.estimatedTime || '',
        estimatedTimeUnit: selectedNodeData.data.estimatedTimeUnit || 'days',
        note: selectedNodeData.data.note || '',
      });
    }
  }, [selectedNodeData]);

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

  const handleClose = () => {
    setSelectedNode(null);
  };

  if (!selectedNode || !selectedNodeData) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-6 flex flex-col items-center justify-center text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-center">Select a task to view and edit its details</p>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">Task Details</h2>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="Enter task title..."
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
            placeholder="Enter task description..."
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
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
                onClick={() => {
                  const event = { target: { name: 'status', value: status.value } };
                  handleChange(event);
                }}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  formData.status === status.value
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Tag */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Primary Tag
          </label>
          <select
            name="primaryTag"
            value={formData.primaryTag || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3d%22http%3a%2f%2fwww.w3.org%2f2000%2fsvg%22%20viewBox%3d%220%200%2020%2020%22%20fill%3d%22none%22%3e%3cpath%20d%3d%22M7%207l3-3%203%203m0%206l-3%203-3-3%22%20stroke%3d%22%239ca3af%22%20stroke-width%3d%221.5%22%20stroke-linecap%3d%22round%22%20stroke-linejoin%3d%22round%22%2f%3e%3c%2fsvg%3e')] bg-[length:1.5em] bg-[right_0.5rem_center] bg-no-repeat pr-10"
            style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
          >
            <option value="">No Tag</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
        </div>

        {/* Estimated Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="0"
            />
            
            {/* Unit Selection */}
            <div className="flex flex-1 border border-gray-300 rounded-lg overflow-hidden">
              {['days', 'weeks', 'months'].map((unit) => (
                <button
                  key={unit}
                  type="button"
                  onClick={() => {
                    const event = { target: { name: 'estimatedTimeUnit', value: unit } };
                    handleChange(event);
                  }}
                  className={`px-3 py-2 text-sm transition-colors ${
                    formData.estimatedTimeUnit === unit
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } ${unit !== 'days' ? 'border-l border-gray-300' : ''}`}
                >
                  {unit}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Note
          </label>
          <textarea
            name="note"
            value={formData.note}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
            placeholder="Add private notes..."
          />
        </div>
      </div>

      {/* Footer with creation date */}
      <div className="px-4 py-3 border-t border-gray-200 text-xs text-gray-400">
        Created: {new Date(selectedNodeData.data.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
};

export default Sidebar;
