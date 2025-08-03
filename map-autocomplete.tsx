import { FormEvent, useCallback, useState } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { useAutocompleteSuggestions } from "./useAutoComplete";
import { Search, MapPin, X } from "lucide-react";
import { useMap3DStore } from "../../stores/useMap3DStore";

export interface MapAutocompleteProps {
  placeholder?: string;
  className?: string;
}
export const MapAutocomplete = ({
  placeholder = "Search a place...",
  className = "",
}: MapAutocompleteProps) => {
  const places = useMapsLibrary("places");
  const { searchPlace } = useMap3DStore();
  const [inputValue, setInputValue] = useState<string>("");
  const { suggestions, resetSession } = useAutocompleteSuggestions(inputValue);

  const handleInput = useCallback((event: FormEvent<HTMLInputElement>) => {
    setInputValue((event.target as HTMLInputElement).value);
  }, []);

  const handleSuggestionClick = useCallback(
    async (suggestion: google.maps.places.AutocompleteSuggestion) => {
      if (!places) return;
      if (!suggestion.placePrediction) return;

      const place = suggestion.placePrediction.toPlace();

      await place.fetchFields({
        fields: [
          "viewport",
          "location",
          "svgIconMaskURI",
          "iconBackgroundColor",
        ],
      });
      console.log("Selected place:", place);
      setInputValue("");

      // calling fetchFields invalidates the session-token, so we now have to call
      // resetSession() so a new one gets created for further search
      resetSession();
      // Convert the Place object to PlaceResult format for the store
      const placeResult: google.maps.places.PlaceResult = {
        geometry: place.location
          ? {
              location: place.location,
              viewport: place.viewport || undefined,
            }
          : undefined,
        name: place.displayName || undefined,
        formatted_address: place.formattedAddress || undefined,
        place_id: place.id || undefined,
      };

      // Use the store's searchPlace method
      searchPlace(placeResult);
    },
    [places, resetSession, searchPlace]
  );

  const clearInput = useCallback(() => {
    setInputValue("");
    resetSession();
  }, [resetSession]);

  return (
    <div className={`absolute top-4 left-4 w-full max-w-md z-10 ${className}`}>
      {/* Search Input */}
      <div className="form-control">
        <div className="relative w-full">
          <input
            type="text"
            value={inputValue}
            onInput={handleInput}
            placeholder={placeholder}
            className="input input-bordered w-full pl-12 pr-10 bg-base-100 text-base-content shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:pl-12"
          />
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
            <Search className="h-5 w-5 text-base-content/60" />
          </div>
          {inputValue && (
            <button
              onClick={clearInput}
              className="absolute inset-y-0 right-3 flex items-center text-base-content/60 hover:text-base-content transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {suggestions.length > 0 && (
        <div className="mt-2 bg-base-100 rounded-lg shadow-xl border border-base-300 max-h-64 overflow-y-auto">
          <ul className="menu p-0">
            {suggestions.map((suggestion, index) => (
              <li key={index}>
                <button
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="flex items-center gap-3 p-3 hover:bg-base-200 text-left w-full rounded-none first:rounded-t-lg last:rounded-b-lg transition-colors"
                >
                  <MapPin className="h-4 w-4 text-base-content/60 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-base-content font-medium truncate">
                      {suggestion.placePrediction?.text.text}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
