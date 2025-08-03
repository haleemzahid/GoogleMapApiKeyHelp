import React, { useRef } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDirectionalInput } from './hooks/useDirectionalInput';
import { useMap3DStore } from '../../stores/useMap3DStore';

interface DirectionalNavProps {
  size?: number;
  className?: string;
}

export const DirectionalNav: React.FC<DirectionalNavProps> = ({ 
  size = 80, 
  className = '' 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { continuousRotate, continuousTilt } = useMap3DStore();

  const { startInput, updateInput, endInput } = useDirectionalInput({
    onDirectionalChange: (input) => {
      if (!input) return;
      
      const { angle, intensity } = input;
      const speed = intensity * .5; // Base speed multiplier
      
      // Convert angle to directional components
      // 0° = up, 90° = right, 180° = down, 270° = left
      const tiltComponent = Math.cos(angle * Math.PI / 180); // -1 to 1 (up to down)
      const rotateComponent = Math.sin(angle * Math.PI / 180); // -1 to 1 (left to right)
      
      // Apply tilt rotation (up/down) - move camera look point vertically
      if (Math.abs(tiltComponent) > 0.1) {
        const tiltDirection = tiltComponent < 0 ? 'up' : 'down';
        const tiltIntensity = Math.abs(tiltComponent) * speed;
        continuousTilt(tiltDirection, tiltIntensity);
      }
      
      // Apply rotation (left/right)
      if (Math.abs(rotateComponent) > 0.1) {
        const rotateDirection = rotateComponent < 0 ? 'left' : 'right';
        const rotateIntensity = Math.abs(rotateComponent) * speed;
        continuousRotate(rotateDirection, rotateIntensity);
      }
    },
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    startInput(e.clientX, e.clientY, rect);
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      updateInput(moveEvent.clientX, moveEvent.clientY, rect);
    };
    
    const handleMouseUp = () => {
      endInput();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!containerRef.current || e.touches.length === 0) return;
    
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    startInput(touch.clientX, touch.clientY, rect);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!containerRef.current || e.touches.length === 0) return;
    
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    updateInput(touch.clientX, touch.clientY, rect);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    endInput();
  };

  return (
    <div className={`relative ${className}`}>
      <div
        ref={containerRef}
        className="relative bg-gray-800/80 backdrop-blur-sm rounded-full border border-gray-600 shadow-lg cursor-pointer select-none"
        style={{ width: size, height: size }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Center dot */}
        <div 
          className="absolute bg-gray-400 rounded-full"
          style={{
            width: size * 0.15,
            height: size * 0.15,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
        
        {/* Arrow indicators */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Up arrow */}
          <div 
            className="absolute text-white/80"
            style={{
              top: size * 0.1,
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            <ChevronUp size={size * 0.2} />
          </div>
          
          {/* Down arrow */}
          <div 
            className="absolute text-white/80"
            style={{
              bottom: size * 0.1,
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            <ChevronDown size={size * 0.2} />
          </div>
          
          {/* Left arrow */}
          <div 
            className="absolute text-white/80"
            style={{
              left: size * 0.1,
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          >
            <ChevronLeft size={size * 0.2} />
          </div>
          
          {/* Right arrow */}
          <div 
            className="absolute text-white/80"
            style={{
              right: size * 0.1,
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          >
            <ChevronRight size={size * 0.2} />
          </div>
        </div>
      </div>
    </div>
  );
};
