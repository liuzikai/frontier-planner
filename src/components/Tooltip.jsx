import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

const Tooltip = ({ content, children, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top - 8, // 8px offset above the element
        left: rect.left + rect.width / 2,
      });
    }
  }, [isVisible]);

  return (
    <div 
      ref={triggerRef}
      className={className}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && createPortal(
        <div 
          className="fixed px-3.5 py-2.5 bg-gray-900/95 backdrop-blur-md text-white text-[11px] font-bold rounded-xl shadow-2xl whitespace-pre-line pointer-events-none w-max max-w-xs border border-white/10"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            transform: 'translate(-50%, -100%)',
            zIndex: 9999,
          }}
        >
          {content}
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px]">
            <div className="border-4 border-transparent border-t-gray-900/95"></div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Tooltip;
