import React from 'react';
import { DirectionalNav } from './DirectionalNav';
import { ZoomControls } from './ZoomControls';

interface MapControlsProps {
  className?: string;
}

export const MapControls: React.FC<MapControlsProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-end gap-4 ${className}`}>
      <DirectionalNav size={80} />
      <ZoomControls />
    </div>
  );
};
