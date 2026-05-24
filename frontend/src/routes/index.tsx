import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { Activity, Radio, ShieldCheck, Waypoints } from "lucide-react";
import { ANIMALS, ALERTS } from "@/lib/wildlife/data";
import { AnimalSidebar } from "@/components/dashboard/AnimalSidebar";
import { BehaviorPanel } from "@/components/dashboard/BehaviorPanel";
import { AlertConsole } from "@/components/dashboard/AlertConsole";

const ReserveMap = lazy(() => import("@/components/dashboard/ReserveMap"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vanrakshak · Wildlife Operations Console" },
      {
        name: "description",
        content:
          "Real-time geofence, behavioural analytics and alert dispatch for elephants, tigers and rhinos.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [selectedId, setSelectedId] = useState<string | null>(ANIMALS[0].id);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const selected = ANIMALS.find((a) => a.id === selectedId) ?? ANIMALS[0];
  const breaches = ANIMALS.filter((a) => !a.insideGeofence).length;
  const critical = ALERTS.filter((a) => a.level === "critical" && !a.acknowledged).length;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-border bg-sidebar px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/15 text-primary">
            <Waypoints className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold leading-none">
              Vanrakshak <span className="text-muted-foreground">/ Operations Console</span>
            </h1>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Kaziranga Reserve · LSTM behavioural engine · LoRa gateway 3 of 3 online
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill icon={Radio} label="MQTT" value="Connected" tone="ok" />
          <StatusPill icon={Activity} label="WS clients" value="14" tone="ok" />
          <StatusPill
            icon={ShieldCheck}
            label="Breaches"
            value={String(breaches)}
            tone={breaches > 0 ? "crit" : "ok"}
          />
          <StatusPill
            icon={Activity}
            label="Critical alerts"
            value={String(critical)}
            tone={critical > 0 ? "crit" : "ok"}
          />
        </div>
      </header>

      {/* Main split */}
      <div className="grid flex-1 grid-cols-[1fr_360px]">
        <div className="flex min-h-0 flex-col gap-4 p-4">
          {/* Map */}
          <div className="relative h-[58vh] overflow-hidden rounded-xl border border-border bg-card">
            <div className="absolute left-3 top-3 z-[400] flex flex-col gap-1 rounded-lg border border-border bg-card/85 px-3 py-2 text-xs backdrop-blur">
              <div className="font-semibold">Active geofence</div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className="inline-block h-2 w-2 rounded-sm bg-primary/70" />
                Core zone
                <span className="ml-2 inline-block h-2 w-2 rounded-sm bg-accent/70" />
                Buffer (dashed)
              </div>
            </div>
            <div className="absolute right-3 top-3 z-[400] flex items-center gap-1.5 rounded-full border border-border bg-card/85 px-3 py-1 text-[11px] backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-primary pulse-dot" />
              Live · {ANIMALS.length} collars streaming
            </div>
            {mounted ? (
              <Suspense
                fallback={
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    Loading reserve map…
                  </div>
                }
              >
                <ReserveMap selectedId={selectedId} onSelect={setSelectedId} />
              </Suspense>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Initialising reserve map…
              </div>
            )}
          </div>

          {/* Behavior + alerts */}
          <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
            <BehaviorPanel animal={selected} />
            <AlertConsole />
          </div>
        </div>

        <AnimalSidebar selectedId={selectedId} onSelect={setSelectedId} />
      </div>
    </div>
  );
}

function StatusPill({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  tone: "ok" | "crit";
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs">
      <Icon
        className={
          tone === "crit" ? "h-3.5 w-3.5 text-destructive" : "h-3.5 w-3.5 text-primary"
        }
      />
      <span className="text-muted-foreground">{label}</span>
      <span
        className={
          tone === "crit"
            ? "font-semibold tabular-nums text-destructive"
            : "font-semibold tabular-nums"
        }
      >
        {value}
      </span>
    </div>
  );
}
