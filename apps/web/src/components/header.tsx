"use client";
import Link from "next/link";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
  const links = [
    { to: "/#planner", label: "Planner" },
    { to: "/#method", label: "Method" },
  ] as const;

  return (
    <header className="sticky top-0 z-50 border-b border-foreground/10 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center border border-foreground/10 bg-primary text-sm font-semibold tracking-[0.3em] text-primary-foreground">
            G
          </span>
          <div className="hidden sm:block">
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-muted-foreground">
              Glide
            </p>
            <p className="text-sm font-medium">Daily runway planner</p>
          </div>
        </Link>

        <nav className="hidden gap-6 text-sm text-muted-foreground md:flex">
          {links.map(({ to, label }) => {
            return (
              <Link key={to} href={to} className="transition-colors hover:text-foreground">
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
