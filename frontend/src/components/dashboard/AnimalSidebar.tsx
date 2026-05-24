import { useMemo, useState } from "react";
import { Search, Battery, Signal, Heart, MapPin, AlertTriangle } from "lucide-react";
import { ANIMALS, ALERTS, SPECIES_COLOR, type Species } from "@/lib/wildlife/data";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const SPECIES: ("All" | Species)[] = ["All", "Elephant", "Tiger", "Rhino"];

interface Props {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function AnimalSidebar({ selectedId, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [species, setSpecies] = useState<"All" | Species>("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ANIMALS.filter((a) => {
      if (species !== "All" && a.species !== species) return false;
      if (!q) return true;
      return (
        a.code.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.species.toLowerCase().includes(q)
      );
    });
  }, [query, species]);

  const recentAlerts = ALERTS.slice(0, 4);

  return (
    <aside className="flex h-full flex-col gap-4 border-l border-border bg-sidebar p-4">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wide text-sidebar-foreground/90">
            ACTIVE TRACKERS
          </h2>
          <Badge variant="secondary" className="text-xs">
            {ANIMALS.length} live
          </Badge>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by code (e.g. TGR-007)"
            className="h-9 pl-8 text-sm"
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {SPECIES.map((s) => (
            <button
              key={s}
              onClick={() => setSpecies(s)}
              className={cn(
                "rounded-full border border-border px-2.5 py-0.5 text-[11px] transition-colors",
                species === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <ScrollArea className="-mx-2 flex-1 px-2">
        <ul className="space-y-2">
          {filtered.map((a) => {
            const active = a.id === selectedId;
            return (
              <li key={a.id}>
                <button
                  onClick={() => onSelect(a.id)}
                  className={cn(
                    "w-full rounded-lg border bg-card p-3 text-left transition-all",
                    active
                      ? "border-primary shadow-[0_0_0_1px_var(--color-primary)]"
                      : "border-border hover:border-primary/50",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: SPECIES_COLOR[a.species] }}
                      />
                      <div>
                        <div className="text-sm font-semibold leading-none">{a.name}</div>
                        <div className="mt-1 text-[11px] text-muted-foreground">
                          {a.code} · {a.species} · {a.sex}
                        </div>
                      </div>
                    </div>
                    {!a.insideGeofence ? (
                      <Badge variant="destructive" className="h-5 text-[10px]">
                        BREACH
                      </Badge>
                    ) : a.riskScore > 60 ? (
                      <Badge className="h-5 bg-accent text-accent-foreground text-[10px]">
                        RISK {a.riskScore}
                      </Badge>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">{a.lastSeen}</span>
                    )}
                  </div>
                  <div className="mt-2 grid grid-cols-4 gap-1 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {a.heartRate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Battery className="h-3 w-3" />
                      {a.collarBattery}%
                    </span>
                    <span className="flex items-center gap-1">
                      <Signal className="h-3 w-3" />
                      {a.signal}%
                    </span>
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="h-3 w-3" />
                      {a.behavior.slice(0, 4)}
                    </span>
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
          <Badge variant="destructive" className="text-[10px]">
            {ALERTS.filter((a) => !a.acknowledged).length} new
          </Badge>
        </div>
        <ul className="space-y-1.5">
          {recentAlerts.map((al) => (
            <li
              key={al.id}
              className={cn(
                "rounded-md border border-border bg-card/60 p-2 text-[11px]",
                al.level === "critical" && "border-destructive/60",
              )}
            >
              <div className="flex items-center gap-1.5">
                <AlertTriangle
                  className={cn(
                    "h-3 w-3",
                    al.level === "critical"
                      ? "text-destructive blink"
                      : al.level === "warning"
                        ? "text-accent"
                        : "text-muted-foreground",
                  )}
                />
                <span className="font-medium">{al.animalCode}</span>
                <span className="ml-auto text-muted-foreground">{al.timestamp}</span>
              </div>
              <p className="mt-1 line-clamp-2 text-muted-foreground">{al.message}</p>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}