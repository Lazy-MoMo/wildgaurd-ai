import { Activity, Heart, Moon, Footprints, Leaf, Zap, Baby, ShieldAlert } from "lucide-react";
import { BEHAVIOR_BASELINE, type Animal, type Behavior } from "@/lib/wildlife/data";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const BEHAVIOR_ICON: Record<Behavior, typeof Activity> = {
  Grazing: Leaf,
  Resting: Moon,
  Sleeping: Moon,
  Walking: Footprints,
  Running: Zap,
};

interface Props {
  animal: Animal;
}

function fmtDuration(min: number) {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m}m`;
}

export function BehaviorPanel({ animal }: Props) {
  const baseline = BEHAVIOR_BASELINE[animal.species];
  const Icon = BEHAVIOR_ICON[animal.behavior];

  const restThreshold = animal.species === "Tiger" ? 240 : 180;
  const poachingSuspect =
    (animal.behavior === "Sleeping" || animal.behavior === "Resting") &&
    animal.behaviorSinceMin > restThreshold;

  const pregnancyLikely = (animal.pregnancyProb ?? 0) > 0.6;

  const insights: { icon: typeof Activity; label: string; tone: "ok" | "warn" | "crit" }[] = [];
  if (poachingSuspect)
    insights.push({
      icon: ShieldAlert,
      label: `Excess rest ${fmtDuration(animal.behaviorSinceMin)} — poaching watch triggered`,
      tone: "crit",
    });
  if (pregnancyLikely)
    insights.push({
      icon: Baby,
      label: `Pregnancy pattern detected · ${(animal.pregnancyProb! * 100).toFixed(0)}% confidence`,
      tone: "warn",
    });
  if (animal.heartRate > 80)
    insights.push({
      icon: Heart,
      label: `Elevated HR ${animal.heartRate} bpm — flight response`,
      tone: "warn",
    });
  if (!animal.insideGeofence)
    insights.push({
      icon: ShieldAlert,
      label: "Subject outside core geofence — alert dispatched",
      tone: "crit",
    });
  if (insights.length === 0)
    insights.push({ icon: Activity, label: "All behavioural metrics within baseline.", tone: "ok" });

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Behavioural analysis
          </div>
          <div className="mt-1 flex items-center gap-2">
            <h3 className="text-lg font-semibold">
              {animal.name} <span className="text-muted-foreground">· {animal.code}</span>
            </h3>
            <Badge variant="outline">{animal.species}</Badge>
            {!animal.insideGeofence && (
              <Badge variant="destructive" className="blink">
                GEOFENCE BREACH
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-2">
          <Icon className="h-5 w-5 text-primary" />
          <div>
            <div className="text-sm font-medium">{animal.behavior}</div>
            <div className="text-[11px] text-muted-foreground">
              since {fmtDuration(animal.behaviorSinceMin)}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <div className="mb-2 text-xs font-medium text-muted-foreground">
            LSTM behavioural distribution (24h vs species baseline)
          </div>
          <div className="space-y-2">
            {(Object.keys(baseline) as Behavior[]).map((b) => {
              const pct =
                b === animal.behavior
                  ? Math.min(100, baseline[b] + 12)
                  : Math.max(0, baseline[b] - 3);
              return (
                <div key={b}>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">{b}</span>
                    <span className="tabular-nums">{pct}%</span>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Stat label="Heart rate" value={`${animal.heartRate} bpm`} icon={Heart} />
          <Stat label="Risk score" value={`${animal.riskScore}/100`} icon={ShieldAlert} />
          <Stat
            label="Pregnancy"
            value={animal.pregnancyProb ? `${(animal.pregnancyProb * 100).toFixed(0)}%` : "—"}
            icon={Baby}
          />
          <Stat label="Collar batt." value={`${animal.collarBattery}%`} icon={Activity} />

          <div className="col-span-2 rounded-lg border border-border bg-background/60 p-3">
            <div className="text-[11px] font-medium text-muted-foreground">SYSTEM INSIGHTS</div>
            <ul className="mt-1.5 space-y-1.5">
              {insights.map((i, idx) => {
                const I = i.icon;
                return (
                  <li key={idx} className="flex items-start gap-2 text-xs">
                    <I
                      className={
                        i.tone === "crit"
                          ? "mt-0.5 h-3.5 w-3.5 text-destructive"
                          : i.tone === "warn"
                            ? "mt-0.5 h-3.5 w-3.5 text-accent"
                            : "mt-0.5 h-3.5 w-3.5 text-primary"
                      }
                    />
                    <span>{i.label}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
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
      <div className="mt-1 text-base font-semibold tabular-nums">{value}</div>
    </div>
  );
}