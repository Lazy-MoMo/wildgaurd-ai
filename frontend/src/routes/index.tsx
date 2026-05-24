import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { Activity, AlertTriangle, Radio, ShieldCheck, Waypoints } from "lucide-react";
import { AnimalSidebar } from "@/components/dashboard/AnimalSidebar";
import { BehaviorPanel } from "@/components/dashboard/BehaviorPanel";
import { AlertConsole } from "@/components/dashboard/AlertConsole";
import { api, liveUrl } from "@/lib/api.ts";
import {
  type AlertItem,
  type Animal,
  type DashboardStats,
  type Geofence,
  isCriticalAlert,
  latestAlertFor,
} from "@/lib/wildlife/data";

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
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [stats, setStats] = useState<DashboardStats>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        const [nextAnimals, nextAlerts, nextGeofences, nextStats] = await Promise.all([
          api.animals(),
          api.alerts(),
          api.geofences(),
          api.stats(),
        ]);

        if (!active) return;
        setAnimals(nextAnimals);
        setAlerts(nextAlerts);
        setGeofences(nextGeofences);
        setStats(nextStats);
        setSelectedId((current) => current ?? nextAnimals[0]?.animal_id ?? null);
        setError(null);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Unable to load dashboard data");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const socket = new WebSocket(liveUrl());

    socket.onopen = () => setWsConnected(true);
    socket.onclose = () => setWsConnected(false);
    socket.onerror = () => setWsConnected(false);
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data) as { type?: string; data?: Animal | AlertItem };
      if (message.type === "animal_update" && message.data) {
        const update = message.data as Animal;
        setAnimals((current) =>
          current.map((animal) =>
            animal.animal_id === update.animal_id ? { ...animal, ...update } : animal,
          ),
        );
      }
      if (message.type === "new_alert" && message.data) {
        setAlerts((current) => [message.data as AlertItem, ...current]);
      }
    };

    return () => socket.close();
  }, [mounted]);

  const selected = animals.find((a) => a.animal_id === selectedId) ?? animals[0] ?? null;
  const critical = alerts.filter(isCriticalAlert).length;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
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
              {stats.system_uptime
                ? `System uptime ${stats.system_uptime}`
                : "Backend status pending"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill
            icon={Radio}
            label="Live feed"
            value={wsConnected ? "Connected" : "Offline"}
            tone={wsConnected ? "ok" : "crit"}
          />
          <StatusPill
            icon={Activity}
            label="Tracked"
            value={String(stats.total_animals_tracked ?? animals.length)}
            tone="ok"
          />
          <StatusPill
            icon={ShieldCheck}
            label="High risk"
            value={String(stats.high_risk_animals ?? 0)}
            tone={(stats.high_risk_animals ?? 0) > 0 ? "crit" : "ok"}
          />
          <StatusPill
            icon={AlertTriangle}
            label="Critical alerts"
            value={String(critical)}
            tone={critical > 0 ? "crit" : "ok"}
          />
        </div>
      </header>

      <div className="grid flex-1 grid-cols-[1fr_360px]">
        <div className="flex min-h-0 flex-col gap-4 p-4">
          <div className="relative h-[58vh] overflow-hidden rounded-xl border border-border bg-card">
            <div className="absolute left-3 top-3 z-[400] flex flex-col gap-1 rounded-lg border border-border bg-card/85 px-3 py-2 text-xs backdrop-blur">
              <div className="font-semibold">Geofences</div>
              <div className="text-[11px] text-muted-foreground">{geofences.length} loaded</div>
            </div>
            <div className="absolute right-3 top-3 z-[400] flex items-center gap-1.5 rounded-full border border-border bg-card/85 px-3 py-1 text-[11px] backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-primary pulse-dot" />
              {animals.length} collars
            </div>
            {error && (
              <div className="absolute inset-x-4 top-14 z-[450] rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </div>
            )}
            {mounted ? (
              <Suspense
                fallback={
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    Loading reserve map…
                  </div>
                }
              >
                <ReserveMap
                  animals={animals}
                  geofences={geofences}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
              </Suspense>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Initialising reserve map…
              </div>
            )}
          </div>

          <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
            <BehaviorPanel
              animal={selected}
              latestAlert={selected ? latestAlertFor(selected.animal_id, alerts) : undefined}
              loading={loading}
            />
            <AlertConsole alerts={alerts} />
          </div>
        </div>

        <AnimalSidebar
          animals={animals}
          alerts={alerts}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
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
        className={tone === "crit" ? "h-3.5 w-3.5 text-destructive" : "h-3.5 w-3.5 text-primary"}
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
