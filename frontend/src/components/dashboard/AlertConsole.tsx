import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  alertLevelLabel,
  documentId,
  formatDateTime,
  isCriticalAlert,
  type AlertItem,
} from "@/lib/wildlife/data";

interface Props {
  alerts: AlertItem[];
}

export function AlertConsole({ alerts }: Props) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Alert console
          </div>
          <h3 className="text-lg font-semibold">Backend alerts</h3>
        </div>
        <Badge variant="secondary">{alerts.length}</Badge>
      </header>

      <ScrollArea className="flex-1 px-4 py-3">
        <ul className="space-y-2">
          {alerts.map((alert) => (
            <li
              key={documentId(alert, `${alert.animal_id}-${alert.timestamp}`)}
              className={cn(
                "rounded-lg border bg-background/60 p-3",
                isCriticalAlert(alert) ? "border-destructive/60" : "border-border",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle
                    className={cn(
                      "mt-0.5 h-4 w-4",
                      isCriticalAlert(alert) ? "text-destructive" : "text-muted-foreground",
                    )}
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-semibold">{alert.animal_id}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {alertLevelLabel(alert.alert_level)}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Risk score {alert.risk_score ?? "unavailable"} · Deterrent{" "}
                      {alert.deterrent_activated ?? "unavailable"}
                    </p>
                    <div className="mt-1.5 text-[10px] text-muted-foreground">
                      Villages notified: {alert.villages_notified?.join(", ") || "none"} ·{" "}
                      {formatDateTime(alert.timestamp)}
                    </div>
                  </div>
                </div>
                <div className="shrink-0">
                  {alert.resolved ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-primary">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Resolved
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                      <ShieldAlert className="h-3.5 w-3.5" /> Open
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
          {alerts.length === 0 && (
            <li className="rounded-lg border border-border bg-background/60 p-3 text-sm text-muted-foreground">
              No alerts returned by backend.
            </li>
          )}
        </ul>
      </ScrollArea>
    </div>
  );
}
