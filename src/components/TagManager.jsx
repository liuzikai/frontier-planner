import { useState } from 'react';
import { useStore } from '../store/useStore';

const TagManager = ({ isOpen, onClose }) => {
  const { tags, addTag, updateTag, deleteTag } = useStore();
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3b82f6'); // blue-500

  if (!isOpen) return null;

  const handleAddTag = () => {
    if (newTagName.trim()) {
      addTag(newTagName.trim(), newTagColor);
      setNewTagName('');
      setNewTagColor('#3b82f6');
    }
  };

  const handleStartEdit = (tag) => {
    setEditingId(tag.id);
    setEditName(tag.name);
    setEditColor(tag.color);
  };

  const handleSaveEdit = () => {
    if (editName.trim()) {
      updateTag(editingId, { name: editName.trim(), color: editColor });
      setEditingId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditColor('');
  };

  const handleDelete = (tagId) => {
    if (confirm('Delete this tag? It will be removed from all tasks.')) {
      deleteTag(tagId);
    }
  };

  const colorPresets = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Gray', value: '#6b7280' },
  ];

  const ColorSelector = ({ selectedColor, onChange }) => (
    <div className="flex flex-wrap gap-2 items-center">
      {colorPresets.map((preset) => (
        <button
          key={preset.value}
          onClick={() => onChange(preset.value)}
          className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
            selectedColor === preset.value ? 'border-gray-900 dark:border-gray-100 ring-2 ring-gray-200 dark:ring-gray-800' : 'border-transparent'
          }`}
          style={{ backgroundColor: preset.value }}
          title={preset.name}
        />
      ))}
      <div className="relative group">
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          title="Custom color"
        />
        <div 
          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center bg-white dark:bg-gray-800 transition-all group-hover:scale-110 ${
            !colorPresets.some(p => p.value === selectedColor) 
              ? 'border-gray-900 dark:border-gray-100 ring-2 ring-gray-200 dark:ring-gray-800' 
              : 'border-gray-300 dark:border-gray-700'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden border border-white/20 dark:border-gray-700">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Manage Tags</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all active:scale-90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Add new tag */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Create New Tag</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Tag name (e.g. Engineering)"
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm font-medium text-gray-800 dark:text-gray-100"
              />
              <div className="flex items-center justify-between gap-4">
                <ColorSelector selectedColor={newTagColor} onChange={setNewTagColor} />
                <button
                  onClick={handleAddTag}
                  disabled={!newTagName.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold shadow-lg shadow-blue-200 dark:shadow-none active:scale-95"
                >
                  Create
                </button>
              </div>
            </div>
          </div>

          {/* Existing tags */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Existing Tags</h3>
            <div className="space-y-3">
              {tags.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">No tags yet. Create your first one above!</p>
                </div>
              ) : (
                tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="group relative bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3.5 hover:border-blue-200 dark:hover:border-blue-900 hover:shadow-xl hover:shadow-blue-50/50 dark:hover:shadow-none transition-all duration-300"
                  >
                    {editingId === tag.id ? (
                      <div className="space-y-4">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                          className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-800 dark:text-gray-100"
                          autoFocus
                        />
                        <div className="flex items-center justify-between">
                          <ColorSelector selectedColor={editColor} onChange={setEditColor} />
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveEdit}
                              className="p-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all shadow-md active:scale-95"
                              title="Save"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-2.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-95"
                              title="Cancel"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-xl shadow-inner border border-black/5 flex-shrink-0 transition-transform group-hover:scale-105"
                          style={{ backgroundColor: tag.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 dark:text-gray-100 truncate">{tag.name}</p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono uppercase tracking-wider">{tag.color}</p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                          <button
                            onClick={() => handleStartEdit(tag)}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-xl transition-colors"
                            title="Edit tag"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(tag.id)}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-xl transition-colors"
                            title="Delete tag"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-gray-100 dark:border-gray-800 flex justify-end bg-gray-50/50 dark:bg-gray-900/50">
          <button
            onClick={onClose}
            className="px-8 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-bold shadow-sm active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default TagManager;
