import { useEffect, useMemo, useState } from "react";
import { type Animal, type Geofence, formatSpecies } from "@/lib/wildlife/data";

interface Props {
  animals: Animal[];
  geofences: Geofence[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const SPECIES_COLORS = [
  "oklch(0.78 0.15 75)",
  "oklch(0.68 0.22 35)",
  "oklch(0.72 0.16 155)",
  "oklch(0.7 0.14 250)",
];

export function ReserveMap({ animals, geofences, selectedId, onSelect }: Props) {
  const [mod, setMod] = useState<typeof import("react-leaflet") | null>(null);
  const [L, setL] = useState<typeof import("leaflet") | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      import("react-leaflet"),
      import("leaflet"),
      import("leaflet/dist/leaflet.css"),
    ]).then(([rl, leaflet]) => {
      if (!active) return;
      setMod(rl);
      setL(leaflet.default ?? leaflet);
    });
    return () => {
      active = false;
    };
  }, []);

  const speciesColor = useMemo(() => {
    const species = Array.from(new Set(animals.map((animal) => animal.species).filter(Boolean)));
    return new Map(
      species.map((item, index) => [item, SPECIES_COLORS[index % SPECIES_COLORS.length]]),
    );
  }, [animals]);

  const center = useMemo<[number, number] | null>(() => {
    const firstAnimal = animals.find((animal) => animal.current_location)?.current_location;
    if (firstAnimal) return [firstAnimal.lat, firstAnimal.lng];
    const firstFencePoint = geofences.find((fence) => fence.polygon.length > 0)?.polygon[0];
    return firstFencePoint ?? null;
  }, [animals, geofences]);

  if (!mod || !L) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
        Loading reserve map…
      </div>
    );
  }

  if (!center) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
        No map coordinates returned by backend.
      </div>
    );
  }

  const { MapContainer, TileLayer, Polygon, Marker, Popup, CircleMarker } = mod;

  const makeIcon = (animal: Animal) => {
    const color = speciesColor.get(animal.species) ?? SPECIES_COLORS[0];
    const html = `
      <div style="position:relative;width:30px;height:30px;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;inset:0;border-radius:9999px;background:${color};opacity:0.25;"></div>
        <div style="width:14px;height:14px;border-radius:9999px;background:${color};border:2px solid oklch(0.18 0.02 160);box-shadow:0 0 0 2px ${color};"></div>
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
      center={center}
      zoom={13}
      scrollWheelZoom
      style={{ height: "100%", width: "100%", borderRadius: "0.75rem" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {geofences.map((fence, index) => (
        <Polygon
          key={fence._id ?? fence.name}
          positions={fence.polygon}
          pathOptions={{
            color: SPECIES_COLORS[index % SPECIES_COLORS.length],
            weight: 2,
            fillColor: SPECIES_COLORS[index % SPECIES_COLORS.length],
            fillOpacity: 0.08,
          }}
        />
      ))}
      {animals
        .filter((animal) => animal.current_location)
        .map((animal) => (
          <Marker
            key={animal._id ?? animal.animal_id}
            position={[animal.current_location!.lat, animal.current_location!.lng]}
            icon={makeIcon(animal)}
            eventHandlers={{ click: () => onSelect(animal.animal_id) }}
          >
            <Popup>
              <div style={{ minWidth: 160 }}>
                <div style={{ fontWeight: 600 }}>{animal.animal_id}</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>{formatSpecies(animal.species)}</div>
                <div style={{ fontSize: 12 }}>Collar {animal.collar_id}</div>
                {animal.status && <div style={{ fontSize: 12, marginTop: 4 }}>{animal.status}</div>}
              </div>
            </Popup>
          </Marker>
        ))}
      {selectedId &&
        (() => {
          const animal = animals.find((item) => item.animal_id === selectedId);
          if (!animal?.current_location) return null;
          return (
            <CircleMarker
              center={[animal.current_location.lat, animal.current_location.lng]}
              radius={22}
              pathOptions={{
                color: speciesColor.get(animal.species) ?? SPECIES_COLORS[0],
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
