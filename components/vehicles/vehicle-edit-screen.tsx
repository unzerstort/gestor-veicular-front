"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchVehicle, updateVehicle } from "@/lib/api";
import { Vehicle, VehicleFormValues } from "@/lib/types";
import { buildVehiclePatchPayload } from "@/lib/vehicle";
import { StatusBanner } from "@/components/ui/status-banner";
import { Spinner } from "@/components/ui/spinner";
import { VehicleForm } from "@/components/vehicles/vehicle-form";

export function VehicleEditScreen({ vehicleId }: { vehicleId: string }) {
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

  async function handleSubmit(values: VehicleFormValues) {
    if (!vehicle) {
      return;
    }

    const payload = buildVehiclePatchPayload(vehicle, values);

    if (Object.keys(payload).length === 0) {
      router.push(`/vehicles/${vehicle.id}`);
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedVehicle = await updateVehicle(vehicle.id, payload);
      router.push(`/vehicles/${updatedVehicle.id}`);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading && !vehicle && !errorMessage) {
    return (
      <div className="flex items-center justify-center gap-3 py-16 text-sm text-muted-foreground">
        <Spinner />
        <span>Carregando formulário de edição...</span>
      </div>
    );
  }

  if (errorMessage && !vehicle) {
    return <StatusBanner severity="error" title="Falha ao carregar" message={errorMessage} />;
  }

  if (!vehicle) {
    return (
      <StatusBanner
        severity="warning"
        title="Veículo não encontrado"
        message="Não foi possível abrir o registro solicitado para edição."
      />
    );
  }

  return (
    <VehicleForm
      title="Editar Veículo"
      description="Atualize apenas os campos necessários."
      submitLabel={isSubmitting ? "Salvando..." : "Salvar alterações"}
      mode="edit"
      initialVehicle={vehicle}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      breadcrumbHref={`/vehicles/${vehicle.id}`}
      breadcrumbLabel={vehicle.plate}
      backHref={`/vehicles/${vehicle.id}`}
    />
  );
}
