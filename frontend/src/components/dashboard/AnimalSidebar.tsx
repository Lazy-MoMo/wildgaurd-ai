import { useMemo, useState } from "react";
import { AlertTriangle, MapPin, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  alertLevelLabel,
  documentId,
  formatDateTime,
  formatSpecies,
  isCriticalAlert,
  type AlertItem,
  type Animal,
} from "@/lib/wildlife/data";

interface Props {
  animals: Animal[];
  alerts: AlertItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function AnimalSidebar({ animals, alerts, selectedId, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const species = useMemo(
    () => ["All", ...Array.from(new Set(animals.map((animal) => animal.species).filter(Boolean)))],
    [animals],
  );
  const [selectedSpecies, setSelectedSpecies] = useState("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return animals.filter((animal) => {
      if (selectedSpecies !== "All" && animal.species !== selectedSpecies) return false;
      if (!q) return true;
      return [animal.animal_id, animal.collar_id, animal.species, animal.herd_id]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    });
  }, [animals, query, selectedSpecies]);

  const unresolvedAlerts = alerts.filter((alert) => !alert.resolved);

  return (
    <aside className="flex h-full flex-col gap-4 border-l border-border bg-sidebar p-4">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wide text-sidebar-foreground/90">
            ACTIVE TRACKERS
          </h2>
          <Badge variant="secondary" className="text-xs">
            {animals.length}
          </Badge>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search animals"
            className="h-9 pl-8 text-sm"
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {species.map((item) => (
            <button
              key={item}
              onClick={() => setSelectedSpecies(item)}
              className={cn(
                "rounded-full border border-border px-2.5 py-0.5 text-[11px] transition-colors",
                selectedSpecies === item
                  ? "border-primary bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              {formatSpecies(item)}
            </button>
          ))}
        </div>
      </div>

      <ScrollArea className="-mx-2 flex-1 px-2">
        <ul className="space-y-2">
          {filtered.map((animal) => {
            const active = animal.animal_id === selectedId;
            const latestAlert = alerts.find((alert) => alert.animal_id === animal.animal_id);
            return (
              <li key={documentId(animal, animal.animal_id)}>
                <button
                  onClick={() => onSelect(animal.animal_id)}
                  className={cn(
                    "w-full rounded-lg border bg-card p-3 text-left transition-all",
                    active
                      ? "border-primary shadow-[0_0_0_1px_var(--color-primary)]"
                      : "border-border hover:border-primary/50",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold leading-none">{animal.animal_id}</div>
                      <div className="mt-1 text-[11px] text-muted-foreground">
                        {formatSpecies(animal.species)} · {animal.collar_id}
                      </div>
                    </div>
                    {latestAlert && (
                      <Badge
                        variant={isCriticalAlert(latestAlert) ? "destructive" : "secondary"}
                        className="h-5 text-[10px]"
                      >
                        {alertLevelLabel(latestAlert.alert_level)}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2 grid gap-1 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {animal.current_location
                        ? `${animal.current_location.lat.toFixed(5)}, ${animal.current_location.lng.toFixed(5)}`
                        : "Location unavailable"}
                    </span>
                    <span>{formatDateTime(animal.last_seen)}</span>
                  </div>
                </button>
              </li>
            );
          })}
          {filtered.length === 0 && (
            <li className="px-2 py-6 text-center text-xs text-muted-foreground">
              No animals match “{query}”.
            </li>
          )}
        </ul>
      </ScrollArea>

      <div className="border-t border-border pt-3">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wide">LATEST ALERTS</h2>
          <Badge
            variant={unresolvedAlerts.length > 0 ? "destructive" : "secondary"}
            className="text-[10px]"
          >
            {unresolvedAlerts.length}
          </Badge>
        </div>
        <ul className="space-y-1.5">
          {alerts.slice(0, 4).map((alert) => (
            <li
              key={documentId(alert, `${alert.animal_id}-${alert.timestamp}`)}
              className={cn(
                "rounded-md border border-border bg-card/60 p-2 text-[11px]",
                isCriticalAlert(alert) && "border-destructive/60",
              )}
            >
              <div className="flex items-center gap-1.5">
                <AlertTriangle
                  className={cn(
                    "h-3 w-3",
                    isCriticalAlert(alert) ? "text-destructive blink" : "text-muted-foreground",
                  )}
                />
                <span className="font-medium">{alert.animal_id}</span>
                <span className="ml-auto text-muted-foreground">
                  {alertLevelLabel(alert.alert_level)}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-muted-foreground">
                Risk score {alert.risk_score ?? "unavailable"}
              </p>
            </li>
          ))}
          {alerts.length === 0 && (
            <li className="rounded-md border border-border bg-card/60 p-2 text-[11px] text-muted-foreground">
              No alerts returned by backend.
            </li>
          )}
        </ul>
      </div>
    </aside>
  );
}
