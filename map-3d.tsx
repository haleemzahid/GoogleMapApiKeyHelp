import {useMapsLibrary} from '@vis.gl/react-google-maps';
import {
  ForwardedRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState
} from 'react';
import {useMap3DCameraEvents} from './use-map-3d-camera-events';
import { useMap3DStore } from '../../stores/useMap3DStore';

import './map-3d-types';
import { useCallbackRef, useDeepCompareEffect } from './utility-hooks';

export type Map3DProps = google.maps.maps3d.Map3DElementOptions & {
};

export type Map3DCameraProps = {
  center: google.maps.LatLngAltitudeLiteral;
  range: number;
  heading: number;
  tilt: number;
  roll: number;
};

export const Map3D = forwardRef(
  (
    props: Map3DProps,
    forwardedRef: ForwardedRef<google.maps.maps3d.Map3DElement | null>
  ) => {
    useMapsLibrary('maps3d');
    
    const { cameraState, setCameraState, setMap3DElement } = useMap3DStore();

    const [map3DElement, map3dRef] =
      useCallbackRef<google.maps.maps3d.Map3DElement>();

    useMap3DCameraEvents(map3DElement, (cameraProps) => {
      setCameraState(cameraProps);
    });

    const [customElementsReady, setCustomElementsReady] = useState(false);
    useEffect(() => {
      customElements.whenDefined('gmp-map-3d').then(() => {
        setCustomElementsReady(true);
      });
    }, []);

    // Extract camera props from props, fallback to store state
    const {center, heading, tilt, range, roll, ...map3dOptions} = props;
    
    // Use props if provided, otherwise use store state
    const effectiveCenter = center || cameraState.center;
    const effectiveRange = range !== undefined ? range : cameraState.range;
    const effectiveHeading = heading !== undefined ? heading : cameraState.heading;
    const effectiveTilt = tilt !== undefined ? tilt : cameraState.tilt;
    const effectiveRoll = roll !== undefined ? roll : cameraState.roll;

    useDeepCompareEffect(() => {
      if (!map3DElement) return;

      // copy all values from map3dOptions to the map3D element itself
      Object.assign(map3DElement, map3dOptions);
    }, [map3DElement, map3dOptions]);

    // Set the map element in the store when it becomes available
    useEffect(() => {
      if (map3DElement) {
        setMap3DElement(map3DElement);
      }
    }, [map3DElement, setMap3DElement]);

    // Apply camera properties when the element is ready or when effective values change
    useDeepCompareEffect(() => {
      if (!map3DElement) return;
      // Apply updates immediately for real-time control
      try {
        if (effectiveCenter) {
          console.log('Map3D: Setting center to:', effectiveCenter);
          map3DElement.center = effectiveCenter;
        }
        if (effectiveRange !== undefined) {
          console.log('Map3D: Setting range to:', effectiveRange);
          map3DElement.range = effectiveRange;
        }
        if (effectiveHeading !== undefined) {
          console.log('Map3D: Setting heading to:', effectiveHeading);
          map3DElement.heading = effectiveHeading;
        }
        if (effectiveTilt !== undefined) {
          console.log('Map3D: Setting tilt to:', effectiveTilt);
          map3DElement.tilt = effectiveTilt;
        }
        if (effectiveRoll !== undefined) {
          console.log('Map3D: Setting roll to:', effectiveRoll);
          map3DElement.roll = effectiveRoll;
        }
      } catch (error) {
        console.error('Map3D: Error applying camera properties:', error);
      }
    }, [map3DElement, effectiveCenter, effectiveRange, effectiveHeading, effectiveTilt, effectiveRoll]);

    useImperativeHandle<
      google.maps.maps3d.Map3DElement | null,
      google.maps.maps3d.Map3DElement | null
    >(forwardedRef, () => map3DElement, [map3DElement]);

    if (!customElementsReady) return null;
    return (
      <gmp-map-3d
        ref={map3dRef}
        mode="HYBRID"></gmp-map-3d>
    );
  }
);