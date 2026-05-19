"use client";

import { Badge } from "@my-better-t-app/ui/components/badge";
import { Button } from "@my-better-t-app/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@my-better-t-app/ui/components/card";
import { Checkbox } from "@my-better-t-app/ui/components/checkbox";
import { Input } from "@my-better-t-app/ui/components/input";
import { Label } from "@my-better-t-app/ui/components/label";
import {
  Progress,
} from "@my-better-t-app/ui/components/progress";
import { cn } from "@my-better-t-app/ui/lib/utils";
import { CheckCircle2, Clock3, Sparkles, Trash2 } from "lucide-react";
import { startTransition, useEffect, useEffectEvent, useState } from "react";

type Energy = "light" | "steady" | "deep";

type RunwayTask = {
  id: string;
  title: string;
  minutes: number;
  energy: Energy;
  done: boolean;
  createdAt: string;
};

type StoredRunwayState = {
  tasks: RunwayTask[];
  capacity: number;
};

const STORAGE_KEY = "glide-runway-v1";
const DEFAULT_CAPACITY = 90;
const MINUTE_OPTIONS = [15, 30, 45, 60] as const;
const CAPACITY_OPTIONS = [60, 90, 120, 180] as const;
const DEFAULT_ENERGY: Energy = "steady";

const SAMPLE_TASKS: RunwayTask[] = [
  {
    id: "sample-1",
    title: "Send the proposal follow-up",
    minutes: 15,
    energy: "light",
    done: false,
    createdAt: "2026-05-19T08:00:00.000Z",
  },
  {
    id: "sample-2",
    title: "Outline the homepage copy",
    minutes: 45,
    energy: "deep",
    done: false,
    createdAt: "2026-05-19T08:05:00.000Z",
  },
  {
    id: "sample-3",
    title: "Prep tomorrow's client check-in",
    minutes: 30,
    energy: "steady",
    done: false,
    createdAt: "2026-05-19T08:10:00.000Z",
  },
  {
    id: "sample-4",
    title: "Clean up the overflowing notes doc",
    minutes: 60,
    energy: "deep",
    done: false,
    createdAt: "2026-05-19T08:15:00.000Z",
  },
];

const energyOrder: Record<Energy, number> = {
  deep: 3,
  steady: 2,
  light: 1,
};

function isRunwayTask(value: unknown): value is RunwayTask {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<RunwayTask>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.minutes === "number" &&
    (candidate.energy === "light" ||
      candidate.energy === "steady" ||
      candidate.energy === "deep") &&
    typeof candidate.done === "boolean" &&
    typeof candidate.createdAt === "string"
  );
}

function parseStoredState(raw: string | null): StoredRunwayState | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredRunwayState>;
    if (!Array.isArray(parsed.tasks) || !parsed.tasks.every(isRunwayTask)) {
      return null;
    }

    if (typeof parsed.capacity !== "number") {
      return null;
    }

    return {
      tasks: parsed.tasks,
      capacity: parsed.capacity,
    };
  } catch {
    return null;
  }
}

function orderTasks(tasks: RunwayTask[]) {
  return [...tasks].sort((a, b) => {
    if (a.done !== b.done) {
      return Number(a.done) - Number(b.done);
    }

    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

function buildRunway(tasks: RunwayTask[], capacity: number) {
  const ranked = [...tasks].sort((a, b) => {
    const energyDelta = energyOrder[b.energy] - energyOrder[a.energy];
    if (energyDelta !== 0) {
      return energyDelta;
    }

    return a.minutes - b.minutes;
  });

  const selection: RunwayTask[] = [];
  let usedMinutes = 0;

  for (const task of ranked) {
    if (selection.length >= 3) {
      break;
    }

    const hasRoom = usedMinutes + task.minutes <= capacity;
    if (hasRoom || selection.length === 0) {
      selection.push(task);
      usedMinutes += task.minutes;
    }
  }

  if (selection.length < Math.min(3, ranked.length)) {
    const chosenIds = new Set(selection.map((task) => task.id));

    for (const task of ranked) {
      if (selection.length >= 3 || chosenIds.has(task.id)) {
        continue;
      }

      const hasCloseEnoughRoom = usedMinutes + task.minutes <= capacity + 15;
      if (hasCloseEnoughRoom) {
        selection.push(task);
        chosenIds.add(task.id);
        usedMinutes += task.minutes;
      }
    }
  }

  return {
    tasks: selection,
    usedMinutes,
    spareMinutes: Math.max(capacity - usedMinutes, 0),
  };
}

function energyBadgeClass(energy: Energy) {
  switch (energy) {
    case "light":
      return "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
    case "steady":
      return "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300";
    case "deep":
      return "border-orange-500/25 bg-orange-500/10 text-orange-700 dark:text-orange-300";
  }
}

function energyCopy(energy: Energy) {
  switch (energy) {
    case "light":
      return "Light lift";
    case "steady":
      return "Steady focus";
    case "deep":
      return "Deep work";
  }
}

function laneLabel(energy: Energy) {
  switch (energy) {
    case "light":
      return "Quick win";
    case "steady":
      return "Core block";
    case "deep":
      return "Anchor task";
  }
}

function createTask(title: string, minutes: number, energy: Energy): RunwayTask {
  return {
    id: crypto.randomUUID(),
    title,
    minutes,
    energy,
    done: false,
    createdAt: new Date().toISOString(),
  };
}

export default function RunwayPlanner() {
  const [title, setTitle] = useState("");
  const [minutes, setMinutes] = useState<number>(30);
  const [energy, setEnergy] = useState<Energy>(DEFAULT_ENERGY);
  const [capacity, setCapacity] = useState<number>(DEFAULT_CAPACITY);
  const [tasks, setTasks] = useState<RunwayTask[]>([]);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const stored = parseStoredState(window.localStorage.getItem(STORAGE_KEY));

    if (stored) {
      setTasks(orderTasks(stored.tasks));
      setCapacity(stored.capacity);
    }

    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    const nextState: StoredRunwayState = {
      tasks,
      capacity,
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  }, [capacity, hasHydrated, tasks]);

  const syncAcrossTabs = useEffectEvent((event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) {
      return;
    }

    const stored = parseStoredState(event.newValue);
    if (!stored) {
      return;
    }

    startTransition(() => {
      setTasks(orderTasks(stored.tasks));
      setCapacity(stored.capacity);
    });
  });

  useEffect(() => {
    window.addEventListener("storage", syncAcrossTabs);
    return () => {
      window.removeEventListener("storage", syncAcrossTabs);
    };
  }, [syncAcrossTabs]);

  const orderedTasks = orderTasks(tasks);
  const openTasks = orderedTasks.filter((task) => !task.done);
  const completedTasks = orderedTasks.filter((task) => task.done);
  const runway = buildRunway(openTasks, capacity);
  const runwayIds = new Set(runway.tasks.map((task) => task.id));
  const quickWinIds = new Set(
    openTasks
      .filter((task) => !runwayIds.has(task.id) && (task.minutes <= 30 || task.energy === "light"))
      .map((task) => task.id),
  );
  const quickWins = openTasks.filter((task) => quickWinIds.has(task.id));
  const parked = openTasks.filter((task) => !runwayIds.has(task.id) && !quickWinIds.has(task.id));
  const completionValue = orderedTasks.length
    ? Math.round((completedTasks.length / orderedTasks.length) * 100)
    : 0;
  const usedPercent = capacity ? Math.min(100, Math.round((runway.usedMinutes / capacity) * 100)) : 0;

  function resetComposer() {
    setTitle("");
    setMinutes(30);
    setEnergy(DEFAULT_ENERGY);
  }

  function addTask() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return;
    }

    startTransition(() => {
      setTasks((currentTasks) =>
        orderTasks([...currentTasks, createTask(trimmedTitle, minutes, energy)]),
      );
      resetComposer();
    });
  }

  function removeTask(taskId: string) {
    startTransition(() => {
      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
    });
  }

  function toggleTask(taskId: string, checked: boolean) {
    startTransition(() => {
      setTasks((currentTasks) =>
        orderTasks(
          currentTasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  done: checked,
                }
              : task,
          ),
        ),
      );
    });
  }

  function loadSampleTasks() {
    startTransition(() => {
      setTasks(orderTasks(SAMPLE_TASKS));
      setCapacity(DEFAULT_CAPACITY);
    });
  }

  function clearCompleted() {
    startTransition(() => {
      setTasks((currentTasks) => currentTasks.filter((task) => !task.done));
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <Card className="section-glass border border-foreground/10 bg-card/75">
        <CardHeader className="border-b border-foreground/10">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4 text-primary" />
            Build your next three moves
          </CardTitle>
          <CardDescription>
            Add what is competing for your attention. Glide keeps today realistic by shaping a short
            runway instead of a giant list.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 pt-5">
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              addTask();
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="task-title">What needs to happen?</Label>
              <Input
                id="task-title"
                value={title}
                placeholder="Ship the invoice, tighten the hero copy, prep the call..."
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>How long will it take?</Label>
                <div className="flex flex-wrap gap-2">
                  {MINUTE_OPTIONS.map((option) => (
                    <Button
                      key={option}
                      type="button"
                      variant={minutes === option ? "default" : "outline"}
                      className={cn(
                        "min-w-16",
                        minutes === option && "shadow-[4px_4px_0_0_rgba(0,0,0,0.12)]",
                      )}
                      onClick={() => setMinutes(option)}
                    >
                      {option}m
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid gap-2">
                <Label>How much energy does it need?</Label>
                <div className="flex flex-wrap gap-2">
                  {(["light", "steady", "deep"] as const).map((option) => (
                    <Button
                      key={option}
                      type="button"
                      variant={energy === option ? "default" : "outline"}
                      className={cn(
                        energy === option && "shadow-[4px_4px_0_0_rgba(0,0,0,0.12)]",
                      )}
                      onClick={() => setEnergy(option)}
                    >
                      {energyCopy(option)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="submit">Add to runway</Button>
              <Button type="button" variant="outline" onClick={loadSampleTasks}>
                Load a sample day
              </Button>
              {completedTasks.length > 0 ? (
                <Button type="button" variant="ghost" onClick={clearCompleted}>
                  Clear completed
                </Button>
              ) : null}
            </div>
          </form>

          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Task stack</p>
                <p className="text-xs text-muted-foreground">
                  Everything stays in your browser, so the list is ready when you come back.
                </p>
              </div>
              <Badge variant="outline" className="border-foreground/15 bg-background/40">
                {orderedTasks.length} item{orderedTasks.length === 1 ? "" : "s"}
              </Badge>
            </div>

            {orderedTasks.length === 0 ? (
              <div className="border border-dashed border-foreground/15 bg-background/40 px-4 py-8 text-sm text-muted-foreground">
                Start with one task or load the sample day. The planner will instantly shape a
                workable runway on the right.
              </div>
            ) : (
              <div className="grid gap-2">
                {orderedTasks.map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      "grid gap-3 border border-foreground/10 bg-background/55 px-3 py-3 transition-colors md:grid-cols-[auto_1fr_auto]",
                      task.done && "opacity-60",
                    )}
                  >
                    <div className="pt-0.5">
                      <Checkbox
                        checked={task.done}
                        onCheckedChange={(checked) => toggleTask(task.id, checked)}
                      />
                    </div>

                    <div className="grid gap-2">
                      <p className={cn("text-sm font-medium", task.done && "line-through")}>
                        {task.title}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className={energyBadgeClass(task.energy)}>
                          {laneLabel(task.energy)}
                        </Badge>
                        <Badge variant="outline" className="border-foreground/15 bg-background/60">
                          <Clock3 className="size-3" />
                          {task.minutes} minutes
                        </Badge>
                        {runwayIds.has(task.id) && !task.done ? (
                          <Badge
                            variant="outline"
                            className="border-primary/20 bg-primary/10 text-primary"
                          >
                            Today lane
                          </Badge>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-start justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`Remove ${task.title}`}
                        onClick={() => removeTask(task.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <Card className="section-glass border border-foreground/10 bg-card/80">
          <CardHeader className="border-b border-foreground/10">
            <CardTitle className="text-base">Your realistic runway</CardTitle>
            <CardDescription>
              Pick how much focus you actually have today. Glide will keep the recommendation tight.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 pt-5">
            <div className="grid gap-2">
              <Label>Available focus time</Label>
              <div className="flex flex-wrap gap-2">
                {CAPACITY_OPTIONS.map((option) => (
                  <Button
                    key={option}
                    type="button"
                    variant={capacity === option ? "default" : "outline"}
                    onClick={() => setCapacity(option)}
                  >
                    {option}m
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-2 border border-foreground/10 bg-background/55 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Runway fill</p>
                  <p className="text-xs text-muted-foreground">
                    {runway.usedMinutes} of {capacity} minutes assigned
                  </p>
                </div>
                <Badge variant="outline" className="border-foreground/15 bg-background/40">
                  {runway.spareMinutes}m spare
                </Badge>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Focus load</span>
                <span className="tabular-nums text-muted-foreground">{usedPercent}%</span>
              </div>
              <Progress value={usedPercent} />
            </div>

            <RunwayLane
              title="Focus now"
              description="The three moves worth protecting."
              tasks={runway.tasks}
              emptyCopy="Add a few tasks and Glide will choose a first-pass runway for you."
            />

            <RunwayLane
              title="Quick wins"
              description="Small items that fit between bigger blocks."
              tasks={quickWins}
              emptyCopy="No quick wins queued right now."
            />

            <RunwayLane
              title="Park later"
              description="Important, but not for the next block."
              tasks={parked}
              emptyCopy="Nothing is parked. Your list is already lean."
            />
          </CardContent>
        </Card>

        <Card className="section-glass border border-foreground/10 bg-card/70">
          <CardHeader className="border-b border-foreground/10">
            <CardTitle className="text-base">Momentum snapshot</CardTitle>
            <CardDescription>
              A small list works best when it is visible, measurable, and easy to reset.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 pt-5 sm:grid-cols-3">
            <MetricBlock label="Completed" value={`${completedTasks.length}`} note="Done today" />
            <MetricBlock
              label="Stored locally"
              value={hasHydrated ? "Yes" : "Loading"}
              note="Browser-first"
            />
            <MetricBlock
              label="Finish rate"
              value={`${completionValue}%`}
              note="Across this list"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function RunwayLane({
  title,
  description,
  tasks,
  emptyCopy,
}: {
  title: string;
  description: string;
  tasks: RunwayTask[];
  emptyCopy: string;
}) {
  return (
    <div className="grid gap-3 border border-foreground/10 bg-background/55 p-4">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      {tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyCopy}</p>
      ) : (
        <div className="grid gap-2">
          {tasks.map((task) => (
            <div key={task.id} className="grid gap-2 border border-foreground/10 bg-card/70 p-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium">{task.title}</p>
                <Badge variant="outline" className={energyBadgeClass(task.energy)}>
                  {energyCopy(task.energy)}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock3 className="size-3.5" />
                <span>{task.minutes} minutes</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MetricBlock({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="border border-foreground/10 bg-background/55 p-4">
      <p className="text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">{label}</p>
      <p className="mt-3 flex items-center gap-2 text-2xl font-semibold">
        <CheckCircle2 className="size-5 text-primary" />
        {value}
      </p>
      <p className="mt-2 text-xs text-muted-foreground">{note}</p>
    </div>
  );
}
