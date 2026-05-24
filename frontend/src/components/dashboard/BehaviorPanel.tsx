import { Activity, AlertTriangle, MapPin, Radio, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  alertLevelLabel,
  formatDateTime,
  formatSpecies,
  type AlertItem,
  type Animal,
} from "@/lib/wildlife/data";

interface Props {
  animal: Animal | null;
  latestAlert?: AlertItem;
  loading: boolean;
}

export function BehaviorPanel({ animal, latestAlert, loading }: Props) {
  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
        Loading animal details…
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
        No animals returned by backend.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Animal details
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold">{animal.animal_id}</h3>
            <Badge variant="outline">{formatSpecies(animal.species)}</Badge>
            {animal.status && <Badge variant="secondary">{animal.status}</Badge>}
          </div>
        </div>
        {latestAlert && (
          <Badge variant={(latestAlert.alert_level ?? 0) >= 3 ? "destructive" : "secondary"}>
            Alert {alertLevelLabel(latestAlert.alert_level)}
          </Badge>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Stat label="Collar" value={animal.collar_id} icon={Radio} />
        <Stat label="Herd" value={animal.herd_id ?? "Unavailable"} icon={Activity} />
        <Stat label="Last seen" value={formatDateTime(animal.last_seen)} icon={Activity} />
        <Stat
          label="Location"
          value={
            animal.current_location
              ? `${animal.current_location.lat.toFixed(5)}, ${animal.current_location.lng.toFixed(5)}`
              : "Unavailable"
          }
          icon={MapPin}
        />
      </div>

      <div className="mt-4 rounded-lg border border-border bg-background/60 p-3">
        <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Latest backend alert
        </div>
        {latestAlert ? (
          <div className="mt-2 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-primary" />
              <span>Risk score {latestAlert.risk_score ?? "unavailable"}</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-primary" />
              <span>Deterrent {latestAlert.deterrent_activated ?? "unavailable"}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Villages notified: {latestAlert.villages_notified?.join(", ") || "none"}
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">No alert returned for this animal.</p>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Activity;
}) {
  return (
    <div className="rounded-lg border border-border bg-background/60 p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="mt-1 break-words text-sm font-semibold">{value}</div>
    </div>
  );
}
