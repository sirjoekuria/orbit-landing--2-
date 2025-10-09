import { useEffect, useRef, useState } from "react";

interface Location {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

interface MapboxMapProps {
  pickup: Location | null;
  dropoff: Location | null;
  width?: string;
  height?: string;
  className?: string;
}

const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1Ijoic2lyam9la3VyaWEiLCJhIjoiY21laGxzZnI0MDBjZzJqcXczc2NtdHZqZCJ9.FhRc9jUcHnkTPuauJrP-Qw";

export default function MapboxMap({
  pickup,
  dropoff,
  width = "100%",
  height = "300px",
  className = "",
}: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const pickupMarker = useRef<any>(null);
  const dropoffMarker = useRef<any>(null);
  const routeLayer = useRef<any>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    // Load Mapbox GL JS dynamically
    const loadMapbox = async () => {
      if (typeof window === "undefined") return;

      // Check if mapboxgl is already loaded
      if (window.mapboxgl) {
        initializeMap(window.mapboxgl);
        return;
      }

      // Load Mapbox GL JS and CSS
      const script = document.createElement("script");
      script.src = "https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js";
      script.onload = () => {
        if (window.mapboxgl) {
          initializeMap(window.mapboxgl);
        }
      };
      document.head.appendChild(script);

      const link = document.createElement("link");
      link.href = "https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css";
      link.rel = "stylesheet";
      document.head.appendChild(link);
    };

    const initializeMap = (mapboxgl: any) => {
      if (!mapContainer.current || map.current) return;

      mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [36.8219, -1.2921], // Nairobi center
        zoom: 12,
        attributionControl: false,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      // Add attribution control at bottom-left
      map.current.addControl(
        new mapboxgl.AttributionControl({
          compact: true,
        }),
        "bottom-left",
      );
    };

    loadMapbox();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Validate coordinates
  const isValidCoordinate = (lat: number, lng: number): boolean => {
    return (
      typeof lat === "number" &&
      typeof lng === "number" &&
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    );
  };

  // Calculate distance between two coordinates (for zoom calculation)
  const calculateDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    if (!map.current || !window.mapboxgl) return;

    try {
      const mapboxgl = window.mapboxgl;

      // Clear any previous errors
      setMapError(null);

      // Clear existing markers
      if (pickupMarker.current) {
        pickupMarker.current.remove();
        pickupMarker.current = null;
      }
      if (dropoffMarker.current) {
        dropoffMarker.current.remove();
        dropoffMarker.current = null;
      }

      const markers: any[] = [];
      const validCoordinates: [number, number][] = [];

      // Add pickup marker
      if (pickup && isValidCoordinate(pickup.lat, pickup.lng)) {
        try {
          const pickupEl = document.createElement("div");
          pickupEl.className = "pickup-marker";
          pickupEl.innerHTML = `
          <div style="
            background: #10b981;
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            border: 3px solid white;
          ">📍</div>
        `;

          pickupMarker.current = new mapboxgl.Marker(pickupEl)
            .setLngLat([pickup.lng, pickup.lat])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div style="padding: 8px;">
                <h3 style="margin: 0 0 4px 0; color: #10b981; font-weight: bold;">Pickup Location</h3>
                <p style="margin: 0; font-size: 14px;"><strong>${pickup.name}</strong></p>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #666;">${pickup.address}</p>
              </div>
            `),
            )
            .addTo(map.current);

          const pickupCoord: [number, number] = [pickup.lng, pickup.lat];
          validCoordinates.push(pickupCoord);
          console.log("Added pickup coordinate:", pickupCoord);
          markers.push(pickupMarker.current);
        } catch (error) {
          console.error("Error creating pickup marker:", error);
        }
      } else if (pickup) {
        console.warn("Invalid pickup coordinates:", pickup.lat, pickup.lng);
      }

      // Add dropoff marker
      if (dropoff && isValidCoordinate(dropoff.lat, dropoff.lng)) {
        try {
          const dropoffEl = document.createElement("div");
          dropoffEl.className = "dropoff-marker";
          dropoffEl.innerHTML = `
          <div style="
            background: #3b82f6;
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            border: 3px solid white;
          ">🎯</div>
        `;

          dropoffMarker.current = new mapboxgl.Marker(dropoffEl)
            .setLngLat([dropoff.lng, dropoff.lat])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div style="padding: 8px;">
                <h3 style="margin: 0 0 4px 0; color: #3b82f6; font-weight: bold;">Dropoff Location</h3>
                <p style="margin: 0; font-size: 14px;"><strong>${dropoff.name}</strong></p>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #666;">${dropoff.address}</p>
              </div>
            `),
            )
            .addTo(map.current);

          const dropoffCoord: [number, number] = [dropoff.lng, dropoff.lat];
          validCoordinates.push(dropoffCoord);
          console.log("Added dropoff coordinate:", dropoffCoord);
          markers.push(dropoffMarker.current);
        } catch (error) {
          console.error("Error creating dropoff marker:", error);
        }
      } else if (dropoff) {
        console.warn("Invalid dropoff coordinates:", dropoff.lat, dropoff.lng);
      }

      // Debug logging
      console.log("MapboxMap: Valid coordinates collected:", validCoordinates);
      console.log("MapboxMap: Markers created:", markers.length);

      // Validate all collected coordinates
      const allCoordsValid = validCoordinates.every(
        (coord) =>
          coord &&
          coord.length === 2 &&
          typeof coord[0] === "number" &&
          typeof coord[1] === "number" &&
          !isNaN(coord[0]) &&
          !isNaN(coord[1]) &&
          isValidCoordinate(coord[1], coord[0]),
      );
      console.log("All coordinates valid:", allCoordsValid);

      // Fit map to show both markers
      if (markers.length > 0 && validCoordinates.length > 0) {
        try {
          if (markers.length === 1 && validCoordinates.length === 1) {
            // If only one marker, center on it
            const coord = validCoordinates[0];
            map.current.flyTo({
              center: [coord[0], coord[1]],
              zoom: 14,
              duration: 1000,
            });
          } else {
            // If both markers, calculate center and appropriate zoom manually
            if (validCoordinates.length >= 2) {
              try {
                // Calculate center point manually
                const lngs = validCoordinates.map((coord) => coord[0]);
                const lats = validCoordinates.map((coord) => coord[1]);

                const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
                const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;

                // Calculate actual distance between furthest points
                let maxDistance = 0;
                for (let i = 0; i < validCoordinates.length; i++) {
                  for (let j = i + 1; j < validCoordinates.length; j++) {
                    const dist = calculateDistance(
                      validCoordinates[i][1],
                      validCoordinates[i][0],
                      validCoordinates[j][1],
                      validCoordinates[j][0],
                    );
                    maxDistance = Math.max(maxDistance, dist);
                  }
                }

                // Calculate appropriate zoom level based on distance
                let zoom = 12;
                if (maxDistance > 50)
                  zoom = 9; // > 50km
                else if (maxDistance > 25)
                  zoom = 10; // 25-50km
                else if (maxDistance > 10)
                  zoom = 11; // 10-25km
                else if (maxDistance > 5)
                  zoom = 12; // 5-10km
                else if (maxDistance > 2)
                  zoom = 13; // 2-5km
                else if (maxDistance > 1)
                  zoom = 14; // 1-2km
                else zoom = 15; // < 1km

                // Validate calculated center coordinates
                if (isValidCoordinate(centerLat, centerLng)) {
                  console.log(
                    "Manual positioning - Center:",
                    [centerLng, centerLat],
                    "Zoom:",
                    zoom,
                  );

                  map.current.flyTo({
                    center: [centerLng, centerLat],
                    zoom: zoom,
                    duration: 1000,
                  });
                } else {
                  throw new Error("Calculated center coordinates are invalid");
                }
              } catch (manualError) {
                console.error("Manual positioning failed:", manualError);
                // Ultimate fallback to centering on first valid location
                const firstCoord = validCoordinates[0];
                map.current.flyTo({
                  center: [firstCoord[0], firstCoord[1]],
                  zoom: 12,
                  duration: 1000,
                });
              }
            } else {
              console.warn(
                "Not enough valid coordinates for multi-marker positioning",
              );
              // Fallback to centering on first valid location
              if (validCoordinates.length > 0) {
                const firstCoord = validCoordinates[0];
                map.current.flyTo({
                  center: [firstCoord[0], firstCoord[1]],
                  zoom: 13,
                  duration: 1000,
                });
              } else {
                // Ultimate fallback - check original locations
                const validLocation =
                  pickup && isValidCoordinate(pickup.lat, pickup.lng)
                    ? pickup
                    : dropoff && isValidCoordinate(dropoff.lat, dropoff.lng)
                      ? dropoff
                      : null;
                if (validLocation) {
                  map.current.flyTo({
                    center: [validLocation.lng, validLocation.lat],
                    zoom: 12,
                    duration: 1000,
                  });
                }
              }
            }
          }
        } catch (error) {
          console.error("Error positioning map:", error);
          setMapError("Map positioning failed");
          // Fallback to default Nairobi view
          try {
            map.current.flyTo({
              center: [36.8219, -1.2921],
              zoom: 11,
              duration: 1000,
            });
          } catch (fallbackError) {
            console.error("Even fallback positioning failed:", fallbackError);
            setMapError("Map completely failed to load");
          }
        }
      }

      // Draw route if both locations exist and have valid coordinates
      if (
        pickup &&
        dropoff &&
        isValidCoordinate(pickup.lat, pickup.lng) &&
        isValidCoordinate(dropoff.lat, dropoff.lng)
      ) {
        drawRoute(pickup, dropoff);
      } else {
        // Remove existing route
        if (routeLayer.current && map.current.getLayer("route")) {
          map.current.removeLayer("route");
          map.current.removeSource("route");
          routeLayer.current = null;
        }
      }
    } catch (error) {
      console.error("MapboxMap error:", error);
      setMapError("Unable to load map. Please refresh the page.");
      // Fallback to default view if something goes wrong
      if (map.current) {
        try {
          map.current.flyTo({
            center: [36.8219, -1.2921], // Nairobi center
            zoom: 11,
            duration: 1000,
          });
        } catch (fallbackError) {
          console.error("Even fallback failed:", fallbackError);
        }
      }
    }
  }, [pickup, dropoff]);

  const drawRoute = async (pickup: Location, dropoff: Location) => {
    if (!map.current) return;

    // Validate coordinates before making API call
    if (
      !isValidCoordinate(pickup.lat, pickup.lng) ||
      !isValidCoordinate(dropoff.lat, dropoff.lng)
    ) {
      console.error("Invalid coordinates for route drawing:", pickup, dropoff);
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${pickup.lng},${pickup.lat};${dropoff.lng},${dropoff.lat}?` +
          `access_token=${MAPBOX_ACCESS_TOKEN}&` +
          `geometries=geojson&` +
          `overview=full`,
      );

      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];

        // Remove existing route layer
        if (map.current.getLayer("route")) {
          map.current.removeLayer("route");
          map.current.removeSource("route");
        }

        // Add route source and layer
        map.current.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: route.geometry,
          },
        });

        map.current.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#f59e0b",
            "line-width": 4,
            "line-opacity": 0.8,
          },
        });

        routeLayer.current = true;
      }
    } catch (error) {
      console.error("Error drawing route:", error);
    }
  };

  return (
    <div className={`mapbox-map ${className}`} style={{ width, height }}>
      <div
        ref={mapContainer}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      />

      {/* Error Message */}
      {mapError && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(239, 68, 68, 0.9)",
            color: "white",
            padding: "12px 16px",
            borderRadius: "6px",
            zIndex: 1000,
            fontSize: "14px",
            textAlign: "center",
            maxWidth: "80%",
          }}
        >
          ⚠️ {mapError}
        </div>
      )}

      {/* Legend */}
      {(pickup || dropoff) && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            background: "white",
            padding: "8px 12px",
            borderRadius: "6px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            fontSize: "12px",
            zIndex: 1000,
          }}
        >
          {pickup && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: dropoff ? "4px" : "0",
              }}
            >
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  background: "#10b981",
                  marginRight: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                }}
              >
                📍
              </div>
              <span>Pickup</span>
            </div>
          )}
          {dropoff && (
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  background: "#3b82f6",
                  marginRight: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                }}
              >
                🎯
              </div>
              <span>Dropoff</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Extend window type for mapboxgl
declare global {
  interface Window {
    mapboxgl: any;
  }
}
