"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Eye, Filter, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { deleteVehicle, fetchVehicles } from "@/lib/api";
import { Vehicle, VehicleFilters } from "@/lib/types";
import { formatTimestamp } from "@/lib/vehicle";
import { StatusBanner } from "@/components/ui/status-banner";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buildCreateVehicleHref, getCurrentPathWithQuery } from "@/lib/navigation";
import { cn } from "@/lib/utils";

function getFiltersFromSearchParams(searchParams: Pick<URLSearchParams, "get">): VehicleFilters {
  return {
    brand: searchParams.get("brand") ?? "",
    year: searchParams.get("year") ?? "",
  };
}

function getColorSwatch(color: string) {
  const normalized = color.trim().toLowerCase();

  if (normalized === "preto") return "#1f2937";
  if (normalized === "prata") return "#cbd5e1";
  if (normalized === "vermelho") return "#ef4444";
  if (normalized === "branco") return "#f8fafc";
  if (normalized === "azul") return "#3b82f6";
  if (normalized === "cinza") return "#94a3b8";
  if (normalized === "verde") return "#10b981";

  return "#e2e8f0";
}

export function VehicleListScreen() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const initialFilters = useMemo(() => getFiltersFromSearchParams(searchParams), [searchParams]);
  const createVehicleHref = useMemo(() => buildCreateVehicleHref(getCurrentPathWithQuery(pathname, searchParams)), [pathname, searchParams]);

  const [filters, setFilters] = useState<VehicleFilters>(initialFilters);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function loadVehicles(nextFilters: VehicleFilters) {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await fetchVehicles(nextFilters);
      setVehicles(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível carregar os veículos.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  useEffect(() => {
    void loadVehicles(initialFilters);
  }, [initialFilters]);

  function syncUrl(nextFilters: VehicleFilters) {
    const params = new URLSearchParams();

    if (nextFilters.brand?.trim()) {
      params.set("brand", nextFilters.brand.trim());
    }

    if (nextFilters.year?.trim()) {
      params.set("year", nextFilters.year.trim());
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function applyFilters() {
    syncUrl(filters);
  }

  function clearFilters() {
    const nextFilters = { brand: "", year: "" };
    setFilters(nextFilters);
    syncUrl(nextFilters);
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteVehicle(deleteTarget.id);
      setDeleteTarget(null);
      await loadVehicles(initialFilters);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível remover o veículo.";
      setErrorMessage(message);
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Veículos</h1>
            <p className="mt-1 text-slate-500">Gerencie os veículos da sua frota</p>
          </div>
          <Link
            href={createVehicleHref}
            className={cn(
              buttonVariants(),
              "rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-200 hover:bg-indigo-700 hover:shadow-md",
            )}
          >
            <Plus className="mr-2 size-4" />
            Novo veículo
          </Link>
        </div>

        <Card className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <CardContent className="flex flex-col gap-4 p-0 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="brand-filter"
                value={filters.brand}
                onChange={(event) => setFilters((current) => ({ ...current, brand: event.target.value }))}
                placeholder="Filtrar por marca..."
                className="h-10 rounded-xl border-slate-200 bg-slate-50 pl-10 pr-4 text-sm focus-visible:ring-indigo-500/20"
              />
            </div>
            <div className="relative flex-1">
              <Filter className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="year-filter"
                type="number"
                value={filters.year}
                onChange={(event) => setFilters((current) => ({ ...current, year: event.target.value }))}
                placeholder="Filtrar por ano..."
                className="h-10 rounded-xl border-slate-200 bg-slate-50 pl-10 pr-4 text-sm focus-visible:ring-indigo-500/20"
              />
            </div>
            <div className="flex gap-2 sm:w-auto">
              <button
                type="button"
                onClick={applyFilters}
                disabled={isLoading}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition-all hover:bg-indigo-700 disabled:opacity-60"
              >
                Filtrar
              </button>
              <button
                type="button"
                onClick={clearFilters}
                disabled={isLoading}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-60"
              >
                Limpar
              </button>
            </div>
          </CardContent>
        </Card>

        {errorMessage ? <StatusBanner severity="error" title="Falha ao carregar" message={errorMessage} /> : null}

        <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <CardContent className="p-0">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Veículos cadastrados</h2>
                <p className="text-sm text-slate-500">
                  {vehicles.length} {vehicles.length === 1 ? "registro encontrado" : "registros encontrados"}
                </p>
              </div>
              {(filters.brand || filters.year) && !isLoading ? (
                <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">
                  Filtros aplicados
                </Badge>
              ) : null}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center gap-3 px-6 py-12 text-sm text-slate-500">
                <Spinner />
                <span>Carregando veículos...</span>
              </div>
            ) : vehicles.length === 0 ? (
              <div className="px-6 py-8">
                <StatusBanner
                  severity="info"
                  title="Nenhum veículo encontrado"
                  message="Ajuste os filtros ou cadastre um novo veículo para iniciar sua operação."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[840px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-slate-200 bg-slate-50/50 hover:bg-slate-50/50">
                        <TableHead className="px-6 py-4 text-slate-500">Placa</TableHead>
                        <TableHead className="px-6 py-4 text-slate-500">Marca / Modelo</TableHead>
                        <TableHead className="px-6 py-4 text-slate-500">Ano</TableHead>
                        <TableHead className="px-6 py-4 text-slate-500">Cor</TableHead>
                        <TableHead className="px-6 py-4 text-slate-500">Atualizado em</TableHead>
                        <TableHead className="px-6 py-4 text-right text-slate-500">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-slate-100">
                      {vehicles.map((vehicle) => (
                        <TableRow key={vehicle.id} className="border-b-0 hover:bg-slate-50/80">
                          <TableCell className="px-6 py-4">
                            <span className="inline-flex items-center rounded-sm border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-bold tracking-widest text-indigo-700">
                              {vehicle.plate}
                            </span>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <div className="font-semibold text-slate-900">{vehicle.brand}</div>
                            <div className="mt-0.5 text-xs text-slate-500">{vehicle.model}</div>
                          </TableCell>
                          <TableCell className="px-6 py-4 text-slate-600">{vehicle.year}</TableCell>
                          <TableCell className="px-6 py-4">
                            <div className="flex items-center gap-2 text-slate-600">
                              <div
                                className="size-3 rounded-full border border-black/10 shadow-inner"
                                style={{ backgroundColor: getColorSwatch(vehicle.color) }}
                              />
                              {vehicle.color}
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4 text-slate-500">{formatTimestamp(vehicle.updatedAt)}</TableCell>
                          <TableCell className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/vehicles/${vehicle.id}`}
                                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                                title="Visualizar"
                              >
                                <Eye className="size-4" />
                              </Link>
                              <Link
                                href={`/vehicles/${vehicle.id}/edit`}
                                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                                title="Editar"
                              >
                                <Pencil className="size-4" />
                              </Link>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(vehicle)}
                                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                                title="Excluir"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Excluir veículo"
        description={`Tem certeza que deseja excluir o veículo ${deleteTarget?.plate ?? "selecionado"}? Esta ação não pode ser desfeita.`}
        confirmLabel={isDeleting ? "Excluindo..." : "Excluir"}
        cancelLabel="Cancelar"
        onConfirm={() => void handleDelete()}
        onCancel={() => (!isDeleting ? setDeleteTarget(null) : undefined)}
      />
    </>
  );
}
