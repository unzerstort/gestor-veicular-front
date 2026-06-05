"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Activity, ArrowRight, CarFront, CirclePlus, LayoutDashboard, ListFilter, Server } from "lucide-react";
import { fetchHealth, fetchVehicles } from "@/lib/api";
import { Vehicle } from "@/lib/types";
import { buildVehicleDashboardSummary } from "@/lib/vehicle-dashboard";
import { formatTimestamp } from "@/lib/vehicle";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StatusBanner } from "@/components/ui/status-banner";
import { buildCreateVehicleHref, getCurrentPathWithQuery } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const metricAccentStyles = [
  {
    color: "text-indigo-600",
    bg: "bg-indigo-100",
    blob: "bg-gradient-to-br from-indigo-500 to-violet-500",
  },
  {
    color: "text-emerald-600",
    bg: "bg-emerald-100",
    blob: "bg-gradient-to-br from-emerald-400 to-cyan-400",
  },
  {
    color: "text-pink-600",
    bg: "bg-pink-100",
    blob: "bg-gradient-to-br from-pink-400 to-rose-400",
  },
  {
    color: "text-amber-600",
    bg: "bg-amber-100",
    blob: "bg-gradient-to-br from-amber-300 to-yellow-300",
  },
] as const;

function DashboardMetricSkeleton() {
  return (
    <Card className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <CardContent className="space-y-3 p-0">
        <div className="h-4 w-24 animate-pulse rounded-full bg-slate-100" />
        <div className="h-9 w-20 animate-pulse rounded-full bg-slate-100" />
        <div className="h-4 w-32 animate-pulse rounded-full bg-slate-100" />
      </CardContent>
    </Card>
  );
}

function DashboardSectionSkeleton() {
  return (
    <Card className="rounded-2xl border border-slate-100 bg-white shadow-sm">
      <CardHeader className="p-6 pb-2">
        <div className="h-5 w-40 animate-pulse rounded-full bg-slate-100" />
        <div className="h-4 w-56 animate-pulse rounded-full bg-slate-100" />
      </CardHeader>
      <CardContent className="space-y-4 p-6 pt-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded-full bg-slate-100" />
            <div className="h-3 w-4/5 animate-pulse rounded-full bg-slate-100" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function BrandBarChart({
  items,
  emptyMessage,
}: {
  items: Array<{ label: string; count: number; percentage: number }>;
  emptyMessage: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-400">{emptyMessage}</p>;
  }

  const gridTicks = [0, 25, 50, 75, 100];
  const maxCount = Math.max(...items.map((item) => item.count), 0);

  return (
    <div className="space-y-4">
      <div className="relative h-[280px] rounded-2xl bg-slate-50/60 px-4 pb-10 pt-6">
        <div className="pointer-events-none absolute inset-x-4 inset-y-6">
          {gridTicks.map((tick) => (
            <div
              key={tick}
              className="absolute inset-x-0 border-t border-dashed border-slate-200"
              style={{ bottom: `${tick}%` }}
            />
          ))}
        </div>

        <div className="relative z-10 flex h-full items-end justify-around gap-3">
          {items.map((item) => (
            <div key={item.label} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-3">
              <span className="text-sm font-semibold text-slate-500">{item.count}</span>
              <div className="flex h-full w-full items-end justify-center">
                <div
                  className="w-full max-w-[72px] rounded-t-2xl bg-gradient-to-t from-emerald-500 to-teal-400 shadow-[0_10px_24px_rgba(16,185,129,0.22)] transition-all duration-500"
                  style={{ height: `${Math.max(item.percentage, item.count > 0 ? 14 : 0)}%` }}
                  aria-label={`${item.label}: ${item.count} veículos`}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-5 gap-3 text-center">
          {items.map((item) => (
            <div key={item.label} className="truncate text-xs font-semibold text-slate-500" title={item.label}>
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function YearHorizontalChart({
  items,
  emptyMessage,
}: {
  items: Array<{ label: string; count: number; percentage: number }>;
  emptyMessage: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-400">{emptyMessage}</p>;
  }

  return (
    <ul className="space-y-5">
      {items.map((item) => (
        <li key={item.label} className="space-y-2.5">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="font-semibold text-slate-600">{item.label}</span>
            <span className="text-slate-500">{item.count}</span>
          </div>
          <div className="h-3 rounded-full bg-slate-100">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 shadow-[0_8px_18px_rgba(99,102,241,0.18)] transition-all duration-500"
              style={{ width: `${Math.max(item.percentage, item.count > 0 ? 8 : 0)}%` }}
              aria-label={`${item.label}: ${item.count} veículos`}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function ActivityList({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: Array<{ id: string; plate: string; brand: string; model: string; year: number; timestamp: string }>;
}) {
  return (
    <Card className="rounded-2xl border border-slate-100 bg-white shadow-sm">
      <CardHeader className="p-6 pb-3">
        <CardTitle className="text-xl font-bold text-slate-800">{title}</CardTitle>
        <CardDescription className="text-slate-500">{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-3">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-5 text-sm text-slate-400">
            Nenhum movimento recente por enquanto. Cadastre um novo veículo para iniciar a atividade.
          </div>
        ) : (
          <ul className="space-y-4">
            {items.map((item, index) => (
              <li key={`${item.id}-${item.timestamp}`} className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-base font-bold text-slate-800">{item.plate}</p>
                    <p className="text-sm text-slate-500">
                      {item.brand} • {item.model} • {item.year}
                    </p>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{formatTimestamp(item.timestamp)}</p>
                  </div>
                  <Link href={`/vehicles/${item.id}`} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700")}>
                    Abrir
                  </Link>
                </div>
                {index < items.length - 1 ? <Separator className="bg-slate-100" /> : null}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function VehicleDashboardScreen() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const createVehicleHref = useMemo(() => buildCreateVehicleHref(getCurrentPathWithQuery(pathname, searchParams)), [pathname, searchParams]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehiclesError, setVehiclesError] = useState("");
  const [isVehiclesLoading, setIsVehiclesLoading] = useState(true);
  const [healthStatus, setHealthStatus] = useState("Verificando conexão...");

  useEffect(() => {
    async function loadDashboard() {
      setIsVehiclesLoading(true);
      setVehiclesError("");

      try {
        const data = await fetchVehicles({});
        setVehicles(data);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Não foi possível carregar os dados da frota.";
        setVehiclesError(message);
      } finally {
        setIsVehiclesLoading(false);
      }
    }

    void loadDashboard();

    void fetchHealth()
      .then((response) => setHealthStatus(response.status))
      .catch(() => setHealthStatus("Back-end indisponível"));
  }, []);

  const summary = useMemo(() => buildVehicleDashboardSummary(vehicles), [vehicles]);
  const healthVariant = healthStatus === "ok" ? "success" : healthStatus === "Verificando conexão..." ? "outline" : "warning";
  const fleetRangeLabel =
    summary.oldestVehicleYear !== null && summary.newestVehicleYear !== null
      ? `${summary.oldestVehicleYear} - ${summary.newestVehicleYear}`
      : "Sem dados";

  const summaryCards = [
    {
      title: "Total de veículos",
      value: String(summary.totalVehicles),
      description: summary.totalVehicles === 0 ? "Nenhum item cadastrado ainda." : "Base completa disponível para consulta.",
      icon: CarFront,
    },
    {
      title: "Cadastrados recentemente",
      value: String(summary.recentlyCreatedCount),
      description: "Novos registros nos últimos 7 dias.",
      icon: CirclePlus,
    },
    {
      title: "Atualizados recentemente",
      value: String(summary.recentlyUpdatedCount),
      description: "Movimentação registrada nos últimos 7 dias.",
      icon: Activity,
    },
    {
      title: "Faixa da frota",
      value: fleetRangeLabel,
      description: "Ano mais antigo e mais novo disponíveis.",
      icon: LayoutDashboard,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Badge variant={healthVariant} className="border-transparent px-3 py-1">
            API: {healthStatus}
          </Badge>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-[3.25rem]">
          Boas vindas ao <span className="font-black">Auto<span className="text-indigo-600">Manager</span></span>!
        </h1>
        <p className="text-slate-500 sm:text-xl">Visão geral da sua frota e atividades recentes.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link href={createVehicleHref} className={cn(buttonVariants(), "bg-gradient-to-r from-indigo-500 to-violet-600 shadow-lg shadow-indigo-200 hover:opacity-95")}>
          <CirclePlus className="h-4 w-4" />
          Cadastrar veículo
        </Link>
        <Link href="/vehicles" className={cn(buttonVariants({ variant: "outline" }), "border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50")}>
          <ArrowRight className="h-4 w-4" />
          Ver frota completa
        </Link>
        {summary.featuredBrand ? (
          <Link href={`/vehicles?brand=${encodeURIComponent(summary.featuredBrand)}`} className={cn(buttonVariants({ variant: "ghost" }), "text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700")}>
            <ListFilter className="h-4 w-4" />
            Filtrar por {summary.featuredBrand}
          </Link>
        ) : null}
      </div>

      {vehiclesError ? <StatusBanner severity="error" title="Falha ao carregar" message={vehiclesError} /> : null}

      <section aria-labelledby="dashboard-summary-title">
        <h2 id="dashboard-summary-title" className="sr-only">
          Resumo da operação
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {isVehiclesLoading
            ? Array.from({ length: 4 }).map((_, index) => <DashboardMetricSkeleton key={index} />)
            : summaryCards.map((item, index) => {
              const Icon = item.icon;
              const accent = metricAccentStyles[index % metricAccentStyles.length];

              return (
                <Card
                  key={item.title}
                  className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className={cn("absolute -right-6 -top-6 size-24 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-150", accent.blob)} />
                  <CardContent className="relative z-10 flex items-center justify-between p-0">
                    <div>
                      <p className="mb-1 max-w-[13ch] text-sm font-semibold text-slate-500">{item.title}</p>
                      <p className="text-3xl font-black text-slate-800">{item.value}</p>
                      <p className="mt-2 max-w-[22ch] text-sm text-slate-500">{item.description}</p>
                    </div>
                    <div className={cn("flex size-14 items-center justify-center rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-110", accent.bg, accent.color)}>
                      <Icon className="size-7" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      </section>

      {!isVehiclesLoading && !vehiclesError && summary.totalVehicles === 0 ? (
        <Card className="rounded-2xl border border-dashed border-slate-200 bg-white shadow-sm">
          <CardContent className="flex flex-col items-start gap-4 p-8 text-left sm:items-center sm:text-center">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Sua frota ainda esta vazia</h2>
              <p className="max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Cadastre o primeiro veículo para liberar os indicadores da dashboard, acompanhar atividade recente e começar a organizar a operação.
              </p>
            </div>
            <Link href={createVehicleHref} className={cn(buttonVariants(), "bg-gradient-to-r from-indigo-500 to-violet-600 shadow-lg shadow-indigo-200")}>
              <CirclePlus className="h-4 w-4" />
              Cadastrar primeiro veículo
            </Link>
          </CardContent>
        </Card>
      ) : null}

      <section aria-labelledby="dashboard-activity-title" className="space-y-4">
        <div className="space-y-1">
          <h2 id="dashboard-activity-title" className="text-2xl font-bold text-slate-800">Atividade recente</h2>
          <p className="text-slate-500">Os registros mais novos e as últimas alterações feitas na base.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {isVehiclesLoading ? (
            <>
              <DashboardSectionSkeleton />
              <DashboardSectionSkeleton />
            </>
          ) : (
            <>
              <ActivityList
                title="Últimos cadastrados"
                description="Veículos criados mais recentemente."
                items={summary.recentlyCreatedVehicles}
              />
              <ActivityList
                title="Últimas atualizações"
                description="Registros com mudanças mais recentes."
                items={summary.recentlyUpdatedVehicles}
              />
            </>
          )}
        </div>
      </section>

      <section aria-labelledby="dashboard-distribution-title" className="space-y-4">
        <div className="space-y-1">
          <h2 id="dashboard-distribution-title" className="text-2xl font-bold text-slate-800">Distribuição da frota</h2>
          <p className="text-slate-500">Agrupamentos simples para orientar pesquisa e leitura da base.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {isVehiclesLoading ? (
            <>
              <div className="lg:col-span-2">
                <DashboardSectionSkeleton />
              </div>
              <DashboardSectionSkeleton />
            </>
          ) : (
            <>
              <Card className="rounded-2xl border border-slate-100 bg-white shadow-sm lg:col-span-2">
                <CardHeader className="p-6 pb-2">
                  <CardTitle className="text-xl font-bold text-slate-800">Distribuição por Marca</CardTitle>
                  <CardDescription className="text-slate-500">Top 5 marcas com mais registros na frota.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-4">
                  <BrandBarChart
                    items={summary.vehiclesByBrand.map((item) => ({ label: item.brand, count: item.count, percentage: item.percentage }))}
                    emptyMessage="Nenhuma marca disponível para distribuição ainda."
                  />
                </CardContent>
              </Card>
              <Card className="rounded-2xl border border-slate-100 bg-white shadow-sm">
                <CardHeader className="p-6 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 shadow-sm">
                      <Server className="size-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-slate-800">Por faixa de ano</CardTitle>
                      <CardDescription className="text-slate-500">Contagem fixa por faixas para leitura operacional.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-4">
                  <YearHorizontalChart
                    items={summary.vehiclesByYearBucket}
                    emptyMessage="Nenhum ano disponível para distribuição ainda."
                  />
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
