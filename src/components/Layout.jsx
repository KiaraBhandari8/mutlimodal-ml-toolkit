import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Cpu, Type, Table, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { to: "/", label: "Next-Word", icon: Type, end: true },
  { to: "/csv-classifier", label: "CSV Classifier", icon: Table },
  { to: "/media", label: "Media Analyzer", icon: ImageIcon },
];

export default function Layout() {
  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(60%_45%_at_12%_-5%,hsl(258_88%_68%/0.18),transparent_70%),radial-gradient(55%_40%_at_88%_0%,hsl(188_92%_52%/0.12),transparent_70%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.05] [background-image:linear-gradient(to_right,hsl(210_30%_96%)_1px,transparent_1px),linear-gradient(to_bottom,hsl(210_30%_96%)_1px,transparent_1px)] [background-size:46px_46px]" />

      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3 sm:px-8">
          <div className="flex items-center gap-2.5">
            <span className="grid h-7 w-7 place-items-center rounded-md border border-primary/40 bg-primary/10 text-primary">
              <Cpu className="h-3.5 w-3.5" />
            </span>
            <span className="font-heading text-[15px] font-medium tracking-tight text-foreground">
              Model Lab
            </span>
          </div>

          <nav className="thin-scroll flex flex-1 items-center gap-1 overflow-x-auto">
            {LINKS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    "flex shrink-0 items-center gap-2 rounded-md px-3 py-1.5 text-[13px] transition-colors duration-200",
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  )
                }
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-24 pt-8 sm:px-8">
        <Outlet />
      </main>
    </div>
  );
}