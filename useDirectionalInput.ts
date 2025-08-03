import { useCallback, useRef, useEffect } from 'react';

interface DirectionalInput {
  angle: number; // 0-360 degrees (0 = up, 90 = right, 180 = down, 270 = left)
  intensity: number; // 0-1 distance from center
}

interface UseDirectionalInputProps {
  onDirectionalChange: (input: DirectionalInput | null) => void;
}

export const useDirectionalInput = ({ 
  onDirectionalChange
}: UseDirectionalInputProps) => {
  const isActiveRef = useRef(false);
  const animationFrameRef = useRef<number>();
  const currentInputRef = useRef<DirectionalInput | null>(null);

  const calculateDirectionalInput = useCallback((
    clientX: number, 
    clientY: number, 
    rect: DOMRect
  ): DirectionalInput | null => {
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = Math.min(rect.width, rect.height) / 2;
    
    // Only register input if outside dead zone (20% of radius)
    if (distance < maxDistance * 0.2) {
      return null;
    }
    
    // Calculate angle (0 = up, clockwise)
    let angle = Math.atan2(deltaX, -deltaY) * 180 / Math.PI;
    if (angle < 0) angle += 360;
    
    // Calculate intensity (clamped to max radius)
    const intensity = Math.min(distance / maxDistance, 1);
    
    return { angle, intensity };
  }, []);

  const startInput = useCallback((
    clientX: number, 
    clientY: number, 
    rect: DOMRect
  ) => {
    isActiveRef.current = true;
    const input = calculateDirectionalInput(clientX, clientY, rect);
    currentInputRef.current = input;
    
    const animate = () => {
      if (isActiveRef.current && currentInputRef.current) {
        onDirectionalChange(currentInputRef.current);
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };
    
    animate();
  }, [calculateDirectionalInput, onDirectionalChange]);

  const updateInput = useCallback((
    clientX: number, 
    clientY: number, 
    rect: DOMRect
  ) => {
    if (!isActiveRef.current) return;
    
    const input = calculateDirectionalInput(clientX, clientY, rect);
    currentInputRef.current = input;
  }, [calculateDirectionalInput]);

  const endInput = useCallback(() => {
    isActiveRef.current = false;
    currentInputRef.current = null;
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    onDirectionalChange(null);
  }, [onDirectionalChange]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    startInput,
    updateInput,
    endInput,
    isActive: () => isActiveRef.current,
  };
};
