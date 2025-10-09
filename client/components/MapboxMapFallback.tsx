import { MapPin } from "lucide-react";

interface Location {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

interface MapboxMapFallbackProps {
  pickup: Location | null;
  dropoff: Location | null;
  width?: string;
  height?: string;
  className?: string;
  error?: string;
}

export default function MapboxMapFallback({
  pickup,
  dropoff,
  width = "100%",
  height = "300px",
  className = "",
  error = "Map temporarily unavailable",
}: MapboxMapFallbackProps) {
  return (
    <div
      className={`mapbox-map-fallback ${className}`}
      style={{
        width,
        height,
        backgroundColor: "#f3f4f6",
        border: "2px dashed #d1d5db",
        borderRadius: "8px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        position: "relative",
      }}
    >
      <div style={{ textAlign: "center", color: "#6b7280" }}>
        <MapPin size={48} style={{ marginBottom: "12px", color: "#9ca3af" }} />
        <h3
          style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "600" }}
        >
          🗺️ {error}
        </h3>
        <p style={{ margin: "0 0 16px 0", fontSize: "14px" }}>
          Location information is available below
        </p>

        {/* Location Information */}
        <div style={{ textAlign: "left", maxWidth: "400px" }}>
          {pickup && (
            <div
              style={{
                backgroundColor: "#ecfdf5",
                border: "1px solid #10b981",
                borderRadius: "6px",
                padding: "12px",
                marginBottom: "8px",
              }}
            >
              <div
                style={{
                  fontWeight: "600",
                  color: "#10b981",
                  marginBottom: "4px",
                }}
              >
                📍 Pickup Location
              </div>
              <div style={{ fontSize: "14px", color: "#374151" }}>
                <strong>{pickup.name}</strong>
              </div>
              <div style={{ fontSize: "12px", color: "#6b7280" }}>
                {pickup.address}
              </div>
              <div
                style={{ fontSize: "11px", color: "#9ca3af", marginTop: "4px" }}
              >
                {pickup.lat.toFixed(4)}, {pickup.lng.toFixed(4)}
              </div>
            </div>
          )}

          {dropoff && (
            <div
              style={{
                backgroundColor: "#eff6ff",
                border: "1px solid #3b82f6",
                borderRadius: "6px",
                padding: "12px",
              }}
            >
              <div
                style={{
                  fontWeight: "600",
                  color: "#3b82f6",
                  marginBottom: "4px",
                }}
              >
                🎯 Dropoff Location
              </div>
              <div style={{ fontSize: "14px", color: "#374151" }}>
                <strong>{dropoff.name}</strong>
              </div>
              <div style={{ fontSize: "12px", color: "#6b7280" }}>
                {dropoff.address}
              </div>
              <div
                style={{ fontSize: "11px", color: "#9ca3af", marginTop: "4px" }}
              >
                {dropoff.lat.toFixed(4)}, {dropoff.lng.toFixed(4)}
              </div>
            </div>
          )}

          {!pickup && !dropoff && (
            <div
              style={{
                backgroundColor: "#fef3c7",
                border: "1px solid #f59e0b",
                borderRadius: "6px",
                padding: "12px",
                textAlign: "center",
                color: "#92400e",
              }}
            >
              Select pickup and dropoff locations to view their details
            </div>
          )}
        </div>

        <div
          style={{
            marginTop: "16px",
            fontSize: "12px",
            color: "#9ca3af",
            textAlign: "center",
          }}
        >
          Refresh the page to retry loading the interactive map
        </div>
      </div>
    </div>
  );
}
