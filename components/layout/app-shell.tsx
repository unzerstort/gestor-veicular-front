"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { CarFront, ChevronRight, CirclePlus, Grid2x2, Menu, X } from "lucide-react";
import { buildCreateVehicleHref, getCurrentPathWithQuery } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: Grid2x2 },
  { href: "/vehicles", label: "Veículos", icon: CarFront },
  { href: "/vehicles/new", label: "Cadastrar", icon: CirclePlus },
];

function isNavItemActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  if (href === "/vehicles") {
    return pathname === "/vehicles" || pathname.startsWith("/vehicles/") && !pathname.startsWith("/vehicles/new");
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const createVehicleHref = useMemo(() => {
    const currentRoute = getCurrentPathWithQuery(pathname, searchParams);
    return buildCreateVehicleHref(currentRoute);
  }, [pathname, searchParams]);

  const sidebar = (
    <div className="flex h-full flex-col border-r border-slate-200 bg-white shadow-sm">
      <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
        <span className="text-[2rem] font-black tracking-tight text-slate-800">
          Auto<span className="text-indigo-600">Manager</span>
        </span>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isNavItemActive(pathname, item.href);
          const href = item.href === "/vehicles/new" ? createVehicleHref : item.href;

          return (
            <Link
              key={item.href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "group flex items-center justify-between rounded-2xl px-4 py-3.5 transition-all duration-200",
                isActive
                  ? "bg-indigo-50 text-indigo-700 shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              <div className="flex items-center gap-3 font-semibold">
                <Icon className={cn("size-5 transition-colors", isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-700")} />
                {item.label}
              </div>
              {isActive ? <ChevronRight className="size-4 text-indigo-400" /> : null}
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-slate-50/40">
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {sidebar}
      </aside>

      <aside className="hidden lg:block lg:w-72 lg:shrink-0">
        <div className="fixed inset-y-0 left-0 z-30 w-72">{sidebar}</div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md sm:px-6 lg:justify-end lg:px-8">
          <button
            type="button"
            onClick={() => setMobileOpen((current) => !current)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 lg:hidden"
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          >
            {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>

          <div className="flex items-center gap-4">
            <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-tr from-pink-400 to-indigo-400 text-sm font-bold text-white shadow-md shadow-pink-200 ring-2 ring-white">
              AD
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
