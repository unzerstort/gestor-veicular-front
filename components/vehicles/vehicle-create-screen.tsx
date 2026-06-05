"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createVehicle } from "@/lib/api";
import { VehicleForm } from "@/components/vehicles/vehicle-form";
import { VehicleFormValues } from "@/lib/types";
import { buildVehiclePayload } from "@/lib/vehicle";
import { getReturnLabel, normalizeReturnPath } from "@/lib/navigation";

export function VehicleCreateScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const returnHref = useMemo(() => normalizeReturnPath(searchParams.get("from")), [searchParams]);
  const returnLabel = useMemo(() => getReturnLabel(searchParams.get("from")), [searchParams]);

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
      backHref={returnHref}
      breadcrumbHref={returnHref}
      breadcrumbLabel={returnLabel}
    />
  );
}
