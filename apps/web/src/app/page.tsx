import { Badge } from "@my-better-t-app/ui/components/badge";
import { buttonVariants } from "@my-better-t-app/ui/components/button";
import { Card, CardContent } from "@my-better-t-app/ui/components/card";
import { cn } from "@my-better-t-app/ui/lib/utils";
import {
  ArrowRight,
  Clock3,
  Layers3,
  NotebookPen,
  Sparkles,
  Target,
} from "lucide-react";
import Link from "next/link";

import RunwayPlanner from "@/components/runway-planner";

const principles = [
  {
    title: "Capture fast",
    body: "Drop every task in one place with a time estimate and the energy it needs.",
    icon: NotebookPen,
  },
  {
    title: "Limit the day",
    body: "Pick a realistic focus budget so the plan fits the day you actually have.",
    icon: Clock3,
  },
  {
    title: "Move with intention",
    body: "Work from a three-item runway instead of burning energy re-prioritizing all day.",
    icon: Target,
  },
] as const;

const benefits = [
  "Three-task runway instead of an endless list",
  "Time-boxed planning that stays in your browser",
  "Designed for solo builders, freelancers, and overloaded teams",
] as const;

export default function Home() {
  return (
    <div className="page-shell min-h-full">
      <main>
        <section className="mx-auto grid max-w-6xl gap-12 px-4 pb-14 pt-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pt-16">
          <div className="grid gap-8">
            <div className="fade-up grid gap-5">
              <Badge
                variant="outline"
                className="w-fit border-primary/20 bg-primary/10 px-3 py-1 text-primary"
              >
                Glide turns a messy task list into a workable day
              </Badge>

              <div className="grid gap-4">
                <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.06em] sm:text-6xl lg:text-7xl">
                  Stop planning like you have twelve versions of yourself.
                </h1>
                <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
                  Glide is a local-first runway planner. You throw in the tasks competing for your
                  attention, choose how much focus they need, and get a short plan you can actually
                  finish.
                </p>
              </div>
            </div>

            <div className="fade-up fade-up-delay flex flex-wrap gap-3">
              <Link href="/#planner" className={buttonVariants({ className: "h-10 px-4 text-sm" })}>
                Open the planner
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/#method"
                className={buttonVariants({
                  variant: "outline",
                  className: "h-10 border-foreground/15 bg-background/40 px-4 text-sm",
                })}
              >
                See why it works
              </Link>
            </div>

            <div className="fade-up fade-up-delay-2 grid gap-3 sm:grid-cols-3">
              {benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="section-glass border border-foreground/10 bg-card/65 p-4 text-sm text-muted-foreground"
                >
                  {benefit}
                </div>
              ))}
            </div>
          </div>

          <div className="fade-up fade-up-delay-2 relative">
            <div className="hero-orb absolute -left-10 top-4 h-28 w-28 bg-primary/25" />
            <div className="hero-orb absolute right-4 top-28 h-24 w-24 bg-amber-300/25 [animation-delay:2s]" />

            <Card className="section-glass relative overflow-hidden border border-foreground/10 bg-card/80">
              <CardContent className="grid gap-6 p-6">
                <div className="grid gap-2 border-b border-foreground/10 pb-6">
                  <p className="text-[0.7rem] uppercase tracking-[0.35em] text-muted-foreground">
                    Sample runway
                  </p>
                  <h2 className="text-2xl font-semibold tracking-[-0.04em]">
                    The next three moves, not the next thirty.
                  </h2>
                </div>

                <div className="grid gap-3">
                  {[
                    ["Outline the homepage copy", "45m", "Deep work", "w-4/5"],
                    ["Send the proposal follow-up", "15m", "Quick win", "w-1/3"],
                    ["Prep tomorrow's client check-in", "30m", "Core block", "w-3/5"],
                  ].map(([title, time, label, width]) => (
                    <div
                      key={title}
                      className="grid gap-3 border border-foreground/10 bg-background/55 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium">{title}</p>
                        <Badge variant="outline" className="border-foreground/15 bg-background/40">
                          {time}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                        <span>{label}</span>
                        <span>Protected on today&apos;s runway</span>
                      </div>
                      <div className="h-1 bg-muted">
                        <div className={cn("h-full bg-primary", width)} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 border-t border-foreground/10 pt-4 sm:grid-cols-3">
                  <div>
                    <p className="text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground">
                      Focus cap
                    </p>
                    <p className="mt-2 text-2xl font-semibold">90m</p>
                  </div>
                  <div>
                    <p className="text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground">
                      Open tabs
                    </p>
                    <p className="mt-2 text-2xl font-semibold">4</p>
                  </div>
                  <div>
                    <p className="text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground">
                      Done rate
                    </p>
                    <p className="mt-2 text-2xl font-semibold">75%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="planner" className="mx-auto max-w-6xl px-4 pb-20 scroll-mt-28">
          <div className="mb-8 grid gap-3">
            <Badge variant="outline" className="w-fit border-foreground/15 bg-background/40 px-3 py-1">
              Working planner
            </Badge>
            <h2 className="text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
              Build a day you can land.
            </h2>
            <p className="max-w-2xl text-base text-muted-foreground">
              The planner below is the product. It stores your tasks locally, creates a realistic
              runway, and keeps the rest parked so your focus does not leak away.
            </p>
          </div>

          <RunwayPlanner />
        </section>

        <section id="method" className="mx-auto max-w-6xl px-4 pb-20 scroll-mt-28">
          <div className="mb-8 grid gap-3">
            <Badge variant="outline" className="w-fit border-foreground/15 bg-background/40 px-3 py-1">
              Why this works
            </Badge>
            <h2 className="text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
              The system is simple on purpose.
            </h2>
            <p className="max-w-2xl text-base text-muted-foreground">
              Most productivity tools collapse under their own setup cost. Glide stays useful
              because it does one thing well: it helps you decide what deserves your next block of
              attention.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {principles.map(({ title, body, icon: Icon }) => (
              <Card key={title} className="section-glass border border-foreground/10 bg-card/70">
                <CardContent className="grid gap-4 p-6">
                  <div className="flex size-10 items-center justify-center border border-foreground/10 bg-background/70 text-primary">
                    <Icon className="size-4" />
                  </div>
                  <div className="grid gap-2">
                    <h3 className="text-lg font-medium">{title}</h3>
                    <p className="text-sm text-muted-foreground">{body}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-10 grid gap-4 border border-foreground/10 bg-card/70 p-6 md:grid-cols-[auto_1fr_auto] md:items-center">
            <div className="flex size-12 items-center justify-center border border-primary/20 bg-primary/10 text-primary">
              <Layers3 className="size-5" />
            </div>
            <div className="grid gap-1">
              <p className="text-lg font-medium">Built for builders who are already in motion.</p>
              <p className="text-sm text-muted-foreground">
                Solo founder, agency lead, operator, or student: if your brain is overloaded, Glide
                helps you turn noise into a clean first pass.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="size-4 text-primary" />
              Local-first and ready now
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
