import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface MapSelectorProps {
  latitude: string;
  longitude: string;
  onLocationChange: (lat: string, lng: string) => void;
}

interface MapInstance {
  setView: (coords: [number, number], zoom: number) => void;
  on: (event: string, callback: () => void) => void;
  remove: () => void;
}

interface MarkerInstance {
  setLatLng: (coords: [number, number]) => void;
  remove: () => void;
}

export function MapSelector({
  latitude,
  longitude,
  onLocationChange,
}: MapSelectorProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<MapInstance | null>(null);
  const marker = useRef<MarkerInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Initialize map on component mount
  useEffect(() => {
    if (!mapContainer.current) return;

    // Load Leaflet CSS and JS dynamically
    const loadLeaflet = async () => {
      // Check if Leaflet is already loaded
      if ((window as any).L) {
        initializeMap();
        return;
      }

      // Load CSS
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(link);

      // Load JS
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
      script.async = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    };

    const initializeMap = () => {
      const L = (window as any).L;

      const initialLat = latitude ? parseFloat(latitude) : -23.5505;
      const initialLng = longitude ? parseFloat(longitude) : -46.6333;

      // Create map
      const mapInstance = L.map(mapContainer.current).setView(
        [initialLat, initialLng],
        13
      );

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapInstance);

      // Add marker
      const markerInstance = L.marker([initialLat, initialLng]).addTo(
        mapInstance
      );

      // Handle map clicks
      mapInstance.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        markerInstance.setLatLng([lat, lng]);
        onLocationChange(lat.toString(), lng.toString());
      });

      map.current = mapInstance;
      marker.current = markerInstance;
      setLoading(false);
    };

    loadLeaflet();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update marker position when latitude/longitude props change
  useEffect(() => {
    if (marker.current && latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      marker.current.setLatLng([lat, lng]);

      if (map.current) {
        map.current.setView([lat, lng], 13);
      }
    }
  }, [latitude, longitude]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=1`
      );
      const data = await response.json();

      if (data.length > 0) {
        const { lat, lon } = data[0];
        const L = (window as any).L;

        if (marker.current) {
          marker.current.setLatLng([lat, lon]);
        } else if (map.current) {
          const newMarker = L.marker([lat, lon]).addTo(map.current);
          marker.current = newMarker;
        }

        if (map.current) {
          map.current.setView([lat, lon], 13);
        }

        onLocationChange(lat, lon);
        setSearchQuery("");
      }
    } catch (error) {
      console.error("Error searching for location:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="location-search">Buscar Localização</Label>
        <div className="flex gap-2 mt-2">
          <Input
            id="location-search"
            placeholder="Digite um endereço, cidade ou CEP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSearching}
          />
          <Button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            variant="outline"
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Buscar"
            )}
          </Button>
        </div>
      </div>

      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
          </div>
        )}
        <div
          ref={mapContainer}
          className="h-96 rounded-lg border border-gray-200 bg-gray-50"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            value={latitude}
            readOnly
            className="mt-1 bg-gray-50"
          />
        </div>
        <div>
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            value={longitude}
            readOnly
            className="mt-1 bg-gray-50"
          />
        </div>
      </div>

      <p className="text-sm text-gray-500">
        💡 Clique no mapa para selecionar a localização ou use a busca acima
      </p>
    </div>
  );
}
