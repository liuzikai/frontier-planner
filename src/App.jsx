import { useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import Canvas from './components/Canvas';
import { useStore } from './store/useStore';

function App() {
  const darkMode = useStore((state) => state.darkMode);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <ReactFlowProvider>
      <div className="w-full h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
        <Canvas />
      </div>
    </ReactFlowProvider>
  );
}

export default App
