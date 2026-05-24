import { useEffect, useState } from "react";
import {
  ANIMALS,
  BUFFER_POLYGON,
  GEOFENCE_POLYGON,
  RESERVE_CENTER,
  SPECIES_COLOR,
  type Animal,
} from "@/lib/wildlife/data";

interface Props {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ReserveMap({ selectedId, onSelect }: Props) {
  const [mod, setMod] = useState<typeof import("react-leaflet") | null>(null);
  const [L, setL] = useState<typeof import("leaflet") | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([import("react-leaflet"), import("leaflet"), import("leaflet/dist/leaflet.css")]).then(
      ([rl, leaflet]) => {
        if (!active) return;
        setMod(rl);
        setL(leaflet.default ?? leaflet);
      },
    );
    return () => {
      active = false;
    };
  }, []);

  if (!mod || !L) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
        Loading reserve map…
      </div>
    );
  }

  const { MapContainer, TileLayer, Polygon, Marker, Popup, CircleMarker } = mod;

  const makeIcon = (animal: Animal) => {
    const color = SPECIES_COLOR[animal.species];
    const breach = !animal.insideGeofence;
    const ring = breach ? "oklch(0.65 0.22 25)" : color;
    const html = `
      <div style="position:relative;width:30px;height:30px;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;inset:0;border-radius:9999px;background:${ring};opacity:0.25;"></div>
        <div style="width:14px;height:14px;border-radius:9999px;background:${color};border:2px solid oklch(0.18 0.02 160);box-shadow:0 0 0 2px ${ring};"></div>
      </div>`;
    return L.divIcon({
      html,
      className: "",
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  };

  return (
    <MapContainer
      center={RESERVE_CENTER}
      zoom={13}
      scrollWheelZoom
      style={{ height: "100%", width: "100%", borderRadius: "0.75rem" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Polygon
        positions={BUFFER_POLYGON}
        pathOptions={{
          color: "oklch(0.78 0.15 75)",
          weight: 1.5,
          dashArray: "6 6",
          fillColor: "oklch(0.78 0.15 75)",
          fillOpacity: 0.05,
        }}
      />
      <Polygon
        positions={GEOFENCE_POLYGON}
        pathOptions={{
          color: "oklch(0.72 0.16 155)",
          weight: 2,
          fillColor: "oklch(0.72 0.16 155)",
          fillOpacity: 0.08,
        }}
      />
      {ANIMALS.map((a) => (
        <Marker
          key={a.id}
          position={a.position}
          icon={makeIcon(a)}
          eventHandlers={{ click: () => onSelect(a.id) }}
        >
          <Popup>
            <div style={{ minWidth: 160 }}>
              <div style={{ fontWeight: 600 }}>
                {a.name} <span style={{ opacity: 0.6 }}>· {a.code}</span>
              </div>
              <div style={{ fontSize: 12, marginTop: 4 }}>
                {a.species} · {a.behavior}
              </div>
              <div style={{ fontSize: 12 }}>
                HR {a.heartRate} bpm · battery {a.collarBattery}%
              </div>
              <div style={{ fontSize: 12, marginTop: 4, color: a.insideGeofence ? "#0a7" : "#c33" }}>
                {a.insideGeofence ? "Inside geofence" : "BREACH — buffer zone"}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
      {selectedId &&
        (() => {
          const a = ANIMALS.find((x) => x.id === selectedId);
          if (!a) return null;
          return (
            <CircleMarker
              center={a.position}
              radius={22}
              pathOptions={{
                color: SPECIES_COLOR[a.species],
                weight: 2,
                fillOpacity: 0,
              }}
            />
          );
        })()}
    </MapContainer>
  );
}

export default ReserveMap;