import React from 'react';
import { Plus, Minus, RotateCcw } from 'lucide-react';
import { useMap3DStore } from '../../stores/useMap3DStore';

interface ZoomControlsProps {
  className?: string;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({ className = '' }) => {
  const { zoomIn, zoomOut, resetCamera } = useMap3DStore();

  const buttonClass = "w-10 h-10 bg-gray-800/80 backdrop-blur-sm border border-gray-600 rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-gray-700/80 transition-colors shadow-lg";

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <button
        onClick={zoomIn}
        className={buttonClass}
        title="Zoom In"
      >
        <Plus size={18} />
      </button>
      
      <button
        onClick={zoomOut}
        className={buttonClass}
        title="Zoom Out"
      >
        <Minus size={18} />
      </button>
      
      <button
        onClick={resetCamera}
        className={buttonClass}
        title="Reset Camera"
      >
        <RotateCcw size={16} />
      </button>
    </div>
  );
};
