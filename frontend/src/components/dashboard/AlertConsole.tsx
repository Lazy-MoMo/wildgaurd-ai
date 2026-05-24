import { useState } from "react";
import { MessageSquare, Phone, Send, CheckCircle2, AlertTriangle } from "lucide-react";
import { ALERTS, type AlertItem } from "@/lib/wildlife/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const TYPE_LABEL: Record<AlertItem["type"], string> = {
  GEOFENCE_BREACH: "Geofence breach",
  POACHING_SUSPECT: "Poaching suspect",
  PREGNANCY_SIGNAL: "Pregnancy signal",
  LOW_BATTERY: "Low battery",
  ABNORMAL_REST: "Abnormal rest",
  HIGH_STRESS: "High stress",
};

export function AlertConsole() {
  const [items, setItems] = useState<AlertItem[]>(ALERTS);

  const ack = (id: string) =>
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)));

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Alert dispatch console
          </div>
          <h3 className="text-lg font-semibold">SMS + WhatsApp · Twilio gateway</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-primary pulse-dot" />
          <span className="text-xs text-muted-foreground">Channel online</span>
        </div>
      </header>

      <ScrollArea className="flex-1 px-4 py-3">
        <ul className="space-y-2">
          {items.map((a) => (
            <li
              key={a.id}
              className={cn(
                "rounded-lg border bg-background/60 p-3",
                a.level === "critical" && !a.acknowledged
                  ? "border-destructive/60"
                  : "border-border",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle
                    className={cn(
                      "mt-0.5 h-4 w-4",
                      a.level === "critical"
                        ? "text-destructive"
                        : a.level === "warning"
                          ? "text-accent"
                          : "text-muted-foreground",
                    )}
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-semibold">{TYPE_LABEL[a.type]}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {a.animalCode}
                      </Badge>
                      {a.channel.map((c) => (
                        <span
                          key={c}
                          className="inline-flex items-center gap-1 rounded-full border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground"
                        >
                          {c === "SMS" ? (
                            <Phone className="h-2.5 w-2.5" />
                          ) : (
                            <MessageSquare className="h-2.5 w-2.5" />
                          )}
                          {c}
                        </span>
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{a.message}</p>
                    <div className="mt-1.5 text-[10px] text-muted-foreground">
                      → {a.recipients.join(", ")} · {a.timestamp}
                    </div>
                  </div>
                </div>
                <div className="shrink-0">
                  {a.acknowledged ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-primary">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Ack
                    </span>
                  ) : (
                    <Button size="sm" variant="secondary" onClick={() => ack(a.id)}>
                      <Send className="mr-1 h-3.5 w-3.5" />
                      Resend
                    </Button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </ScrollArea>

      <footer className="flex items-center justify-between border-t border-border px-4 py-2.5 text-[11px] text-muted-foreground">
        <span>
          Recipients pool: 24 rangers · 6 vet staff · 11 village WhatsApp groups
        </span>
        <span>Last broadcast 2 min ago</span>
      </footer>
    </div>
  );
}