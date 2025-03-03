'use client';

import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'top',
  delay = 300,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isCtrlKeyPressed, setIsCtrlKeyPressed] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle Ctrl key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Control' && !isCtrlKeyPressed) {
        setIsCtrlKeyPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control' && isCtrlKeyPressed) {
        setIsCtrlKeyPressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isCtrlKeyPressed]);

  const handleMouseEnter = () => {
    timerRef.current = setTimeout(() => {
      setIsVisible(true);
      
      if (targetRef.current) {
        const rect = targetRef.current.getBoundingClientRect();
        
        let x = 0;
        let y = 0;
        
        switch (position) {
          case 'top':
            x = rect.left + rect.width / 2;
            y = rect.top - 10;
            break;
          case 'bottom':
            x = rect.left + rect.width / 2;
            y = rect.bottom + 10;
            break;
          case 'left':
            x = rect.left - 10;
            y = rect.top + rect.height / 2;
            break;
          case 'right':
            x = rect.right + 10;
            y = rect.top + rect.height / 2;
            break;
        }
        
        setCoords({ x, y });
      }
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    // Only hide tooltip if Ctrl key is not pressed
    if (!isCtrlKeyPressed) {
      setIsVisible(false);
    }
  };

  // Adjust position if tooltip goes off screen
  useEffect(() => {
    if (isVisible && tooltipRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let newX = coords.x;
      let newY = coords.y;
      
      // Adjust horizontal position
      if (position === 'top' || position === 'bottom') {
        if (tooltipRect.left < 0) {
          newX = tooltipRect.width / 2 + 10;
        } else if (tooltipRect.right > viewportWidth) {
          newX = viewportWidth - tooltipRect.width / 2 - 10;
        }
      }
      
      // Adjust vertical position
      if (position === 'left' || position === 'right') {
        if (tooltipRect.top < 0) {
          newY = tooltipRect.height / 2 + 10;
        } else if (tooltipRect.bottom > viewportHeight) {
          newY = viewportHeight - tooltipRect.height / 2 - 10;
        }
      }
      
      if (newX !== coords.x || newY !== coords.y) {
        setCoords({ x: newX, y: newY });
      }
    }
  }, [isVisible, coords, position]);

  // Hide tooltip when Ctrl key is released if mouse is not over the target
  useEffect(() => {
    const checkTooltipVisibility = () => {
      if (!isCtrlKeyPressed && !targetRef.current?.matches(':hover')) {
        setIsVisible(false);
      }
    };
    
    // Use a timeout to prevent infinite loops
    if (!isCtrlKeyPressed) {
      const timeoutId = setTimeout(checkTooltipVisibility, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [isCtrlKeyPressed]);

  const getTooltipStyle = () => {
    let style: React.CSSProperties = {
      position: 'fixed',
      transform: 'translate(-50%, -50%)',
      opacity: isVisible ? 1 : 0,
      pointerEvents: isVisible ? 'auto' : 'none',
      transition: 'opacity 0.2s ease-in-out',
      zIndex: 1000,
    };
    
    switch (position) {
      case 'top':
        style = {
          ...style,
          left: coords.x,
          bottom: `calc(100% - ${coords.y}px)`,
          transform: 'translate(-50%, -10px)',
        };
        break;
      case 'bottom':
        style = {
          ...style,
          left: coords.x,
          top: coords.y,
          transform: 'translate(-50%, 10px)',
        };
        break;
      case 'left':
        style = {
          ...style,
          right: `calc(100% - ${coords.x}px)`,
          top: coords.y,
          transform: 'translate(-10px, -50%)',
        };
        break;
      case 'right':
        style = {
          ...style,
          left: coords.x,
          top: coords.y,
          transform: 'translate(10px, -50%)',
        };
        break;
    }
    
    return style;
  };

  return (
    <>
      <div 
        ref={targetRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        {children}
      </div>
      
      <div
        ref={tooltipRef}
        style={getTooltipStyle()}
        className={`bg-[#181818] text-white border border-[#3d3d3d] rounded px-3 py-2 shadow-lg max-w-xs ${className}`}
      >
        {content}
      </div>
    </>
  );
};

export default Tooltip;
