import { Map3D } from "./map-3d";
import { MapAutocomplete } from "./map-autocomplete";
import { MapControls } from "./MapControls";
import React from "react";

export const MapView: React.FC = () => {
  return (
    <div style={{ position: "relative", height: "100vh", width: "100%" }}>
      {/* Map3D will automatically use the camera state from the store */}
      <Map3D />
      <MapAutocomplete />
      
      {/* Map controls positioned in bottom-left corner */}
      <MapControls className="absolute bottom-6 left-6 z-10" />
    </div>
  );
};
