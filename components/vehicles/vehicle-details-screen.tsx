"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Calendar, Car, CarFront, Edit2, Palette, Tag, Trash2 } from "lucide-react";
import { deleteVehicle, fetchVehicle } from "@/lib/api";
import { Vehicle } from "@/lib/types";
import { formatTimestamp } from "@/lib/vehicle";
import { StatusBanner } from "@/components/ui/status-banner";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

const detailCards = [
  {
    label: "Ano",
    icon: Calendar,
    iconClassName: "bg-indigo-100 text-indigo-600",
    getValue: (vehicle: Vehicle) => String(vehicle.year),
  },
  {
    label: "Cor",
    icon: Palette,
    iconClassName: "bg-pink-100 text-pink-600",
    getValue: (vehicle: Vehicle) => vehicle.color,
  },
  {
    label: "Marca",
    icon: Car,
    iconClassName: "bg-emerald-100 text-emerald-600",
    getValue: (vehicle: Vehicle) => vehicle.brand,
  },
  {
    label: "Modelo",
    icon: Tag,
    iconClassName: "bg-amber-100 text-amber-600",
    getValue: (vehicle: Vehicle) => vehicle.model,
  },
] as const;

export function VehicleDetailsScreen({ vehicleId }: { vehicleId: string }) {
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    async function loadVehicle() {
      try {
        const result = await fetchVehicle(vehicleId);
        setVehicle(result);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Não foi possível carregar o veículo.";
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    }

    void loadVehicle();
  }, [vehicleId]);

  async function handleDelete() {
    setIsDeleting(true);

    try {
      await deleteVehicle(vehicleId);
      router.push("/vehicles");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível remover o veículo.";
      setErrorMessage(message);
      setConfirmOpen(false);
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading && !vehicle && !errorMessage) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (errorMessage && !vehicle) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-slate-500">
        <AlertCircle className="mb-4 size-12 text-rose-300" />
        <p className="text-lg">{errorMessage}</p>
        <Link href="/vehicles" className="mt-4 font-semibold text-indigo-600 hover:underline">
          Voltar para a lista
        </Link>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <StatusBanner
        severity="warning"
        title="Veículo não encontrado"
        message="O registro solicitado não está disponível no momento."
      />
    );
  }

  return (
    <>
      <div className="mx-auto max-w-5xl space-y-6 animate-in fade-in duration-500">
        {errorMessage ? <StatusBanner severity="error" title="Atencao" message={errorMessage} /> : null}

        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/vehicles"
              className="-ml-2 rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
              aria-label="Voltar para a lista de veículos"
            >
              <ArrowLeft className="size-6" />
            </Link>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Link href="/vehicles" className="transition-colors hover:text-slate-900">
                Veículos
              </Link>
              <span>/</span>
              <span className="text-slate-900">{vehicle.plate}</span>
            </div>
          </div>
        </div>

        <Card className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
          <CardContent className="flex flex-col p-0 md:flex-row">
            <div className="relative min-h-[300px] overflow-hidden md:w-2/5 md:min-h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500" />
              <div className="absolute -right-16 -top-16 size-40 rounded-full bg-white/12" />
              <div className="absolute left-8 top-10 size-24 rounded-full bg-cyan-300/20 blur-2xl" />
              <div className="absolute bottom-10 right-10 size-28 rounded-full bg-pink-300/20 blur-2xl" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.22),transparent_24%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.18),transparent_28%)]" />

              <div className="absolute inset-0 z-10 flex flex-col justify-between p-8 text-white">
                <div className="flex items-center gap-3">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md">
                    <CarFront className="size-7" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">Registro veicular</p>
                    <p className="text-sm font-medium text-white/85">Detalhes do cadastro atual</p>
                  </div>
                </div>

                <div>
                  <span className="mb-4 inline-flex w-max items-center rounded-lg border border-white/30 bg-white/20 px-3 py-1 text-sm font-bold tracking-widest backdrop-blur-md">
                    {vehicle.plate}
                  </span>
                  <h1 className="mb-1 text-4xl font-black">{vehicle.model}</h1>
                  <p className="text-lg font-medium text-white/80">{vehicle.brand}</p>
                  <p className="mt-4 max-w-xs text-sm leading-6 text-white/75">
                    Visualização detalhada do veículo com base apenas nas informações reais cadastradas na plataforma.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col p-8 md:w-3/5 lg:p-10">
              <div className="mb-8 flex justify-end gap-3">
                <Link
                  href={`/vehicles/${vehicle.id}/edit`}
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "rounded-xl border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100",
                  )}
                >
                  <Edit2 className="mr-2 size-4" />
                  Editar dados
                </Link>
                <button
                  type="button"
                  onClick={() => setConfirmOpen(true)}
                  className="inline-flex items-center justify-center rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-rose-200 transition-colors hover:bg-rose-700"
                >
                  <Trash2 className="mr-2 size-4" />
                  Excluir
                </button>
              </div>

              <div className="mb-8 grid flex-1 grid-cols-1 gap-6 sm:grid-cols-2">
                {detailCards.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                      <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", item.iconClassName)}>
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">{item.label}</p>
                        <p className="text-lg font-bold text-slate-900">{item.getValue(vehicle)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-xs font-medium text-slate-400">Criado em</p>
                  <p className="text-sm text-slate-700">{formatTimestamp(vehicle.createdAt)}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-slate-400">Última atualização</p>
                  <p className="text-sm text-slate-700">{formatTimestamp(vehicle.updatedAt)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Excluir veículo?"
        description={`Essa ação remove o registro da placa ${vehicle.plate}. Confirme apenas se tiver certeza.`}
        confirmLabel="Excluir"
        confirmVariant="destructive"
        isConfirming={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  );
}
