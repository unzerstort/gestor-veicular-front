"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createVehicle } from "@/lib/api";
import { VehicleForm } from "@/components/vehicles/vehicle-form";
import { VehicleFormValues } from "@/lib/types";
import { buildVehiclePayload } from "@/lib/vehicle";

export function VehicleCreateScreen() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(values: VehicleFormValues) {
    setIsSubmitting(true);

    try {
      const vehicle = await createVehicle(buildVehiclePayload(values));
      router.push(`/vehicles/${vehicle.id}`);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <VehicleForm
      title="Cadastrar veículo"
      description="Preencha os campos abaixo para incluir um novo item na frota."
      submitLabel={isSubmitting ? "Salvando..." : "Salvar veículo"}
      mode="create"
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
    />
  );
}
