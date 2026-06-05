"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { ApiError } from "@/lib/api";
import { ProblemDetails, Vehicle, VehicleFormValues } from "@/lib/types";
import {
  createVehicleFormValues,
  MAX_VEHICLE_YEAR,
  MIN_VEHICLE_YEAR,
  normalizePlate,
  validateVehicle,
} from "@/lib/vehicle";
import { StatusBanner } from "@/components/ui/status-banner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type VehicleFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  mode: "create" | "edit";
  initialVehicle?: Vehicle;
  isSubmitting: boolean;
  onSubmit: (values: VehicleFormValues) => Promise<void>;
  breadcrumbHref?: string;
  breadcrumbLabel?: string;
  backHref?: string;
};

export function VehicleForm({
  title,
  description,
  submitLabel,
  mode,
  initialVehicle,
  isSubmitting,
  onSubmit,
  breadcrumbHref,
  breadcrumbLabel,
  backHref,
}: VehicleFormProps) {
  const [values, setValues] = useState(() => createVehicleFormValues(initialVehicle));
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof VehicleFormValues, string>>>({});
  const [formError, setFormError] = useState("");

  const helperText = useMemo(
    () => ({
      plate: "Formatos aceitos: ABC1234 ou ABC1D23.",
      year: `Ano entre ${MIN_VEHICLE_YEAR} e ${MAX_VEHICLE_YEAR}.`,
      brand: "Até 120 caracteres.",
      model: "Até 120 caracteres.",
      color: "Até 60 caracteres.",
    }),
    [],
  );

  function applyProblemDetails(problem: ProblemDetails) {
    const nextErrors: Partial<Record<keyof VehicleFormValues, string>> = {};

    problem.errors?.forEach((error) => {
      const fieldName = error.path.replace(/^\//, "") as keyof VehicleFormValues;
      if (fieldName in values) {
        nextErrors[fieldName] = error.message;
      }
    });

    setFieldErrors(nextErrors);
    setFormError(Object.keys(nextErrors).length === 0 ? problem.detail : "");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextValues = {
      ...values,
      plate: normalizePlate(values.plate),
    };

    const validationErrors = validateVehicle(nextValues, mode === "edit");
    setFieldErrors(validationErrors);
    setFormError("");

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      await onSubmit(nextValues);
    } catch (error) {
      if (error instanceof ApiError) {
        applyProblemDetails(error.problem);
        return;
      }

      setFormError("Não foi possível salvar os dados do veículo.");
    }
  }

  function updateValue(field: keyof VehicleFormValues, value: string) {
    setValues((current) => ({
      ...current,
      [field]: field === "plate" ? normalizePlate(value) : value,
    }));

    setFieldErrors((current) => ({
      ...current,
      [field]: "",
    }));
  }

  const fields: Array<{
    id: keyof VehicleFormValues;
    label: string;
    type?: string;
    maxLength?: number;
    min?: number;
    max?: number;
  }> = [
    { id: "plate", label: "Placa", maxLength: 7 },
    { id: "year", label: "Ano", type: "number", min: MIN_VEHICLE_YEAR, max: MAX_VEHICLE_YEAR },
    { id: "brand", label: "Marca", maxLength: 120 },
    { id: "model", label: "Modelo", maxLength: 120 },
    { id: "color", label: "Cor", maxLength: 60 },
  ];

  const shouldShowBreadcrumb = Boolean(backHref || breadcrumbHref || breadcrumbLabel);

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-in fade-in duration-500">
      {shouldShowBreadcrumb ? (
        <div className="flex items-center gap-3">
          <Link
            href={backHref ?? "/vehicles"}
            className="-ml-2 rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
            aria-label="Voltar"
          >
            <ArrowLeft className="size-6" />
          </Link>

          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            {mode === "edit" ? (
              <>
                <Link href="/vehicles" className="transition-colors hover:text-slate-900">
                  Veículos
                </Link>
                <span>/</span>
                {breadcrumbHref && breadcrumbLabel ? (
                  <>
                    <Link href={breadcrumbHref} className="transition-colors hover:text-slate-900">
                      {breadcrumbLabel}
                    </Link>
                    <span>/</span>
                  </>
                ) : null}
                <span className="text-slate-900">Editar</span>
              </>
            ) : (
              <>
                {breadcrumbHref && breadcrumbLabel ? (
                  <>
                    <Link href={breadcrumbHref} className="transition-colors hover:text-slate-900">
                      {breadcrumbLabel}
                    </Link>
                    <span>/</span>
                  </>
                ) : null}
                <span className="text-slate-900">Cadastrar</span>
              </>
            )}
          </div>
        </div>
      ) : null}

      <section className="space-y-6" aria-labelledby="vehicle-form-title">
        <div className="space-y-2">
          <h1 id="vehicle-form-title" className="text-3xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="text-slate-500">{description}</p>
        </div>

        <Card className="rounded-2xl border border-slate-100 bg-white shadow-sm">
          <CardContent className="p-0">
            <form className="space-y-6 p-6 sm:p-8" onSubmit={handleSubmit} noValidate>
              {formError ? <StatusBanner severity="error" title="Falha ao salvar" message={formError} /> : null}

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {fields.map((field) => {
                  const error = fieldErrors[field.id];
                  const isFullWidth = field.id === "color";
                  const helper = helperText[field.id];
                  const inputId = `vehicle-${field.id}`;
                  const describedBy = `${inputId}-hint`;

                  return (
                    <div key={field.id} className={cn("space-y-2", isFullWidth && "sm:col-span-2")}>
                      <Label htmlFor={inputId} className="text-sm font-semibold text-slate-700">
                        {field.label}
                      </Label>
                      <Input
                        id={inputId}
                        type={field.type}
                        value={values[field.id]}
                        onChange={(event) => updateValue(field.id, event.target.value)}
                        required={mode === "create"}
                        aria-invalid={Boolean(error)}
                        aria-describedby={describedBy}
                        className={cn(
                          "h-11 rounded-xl border bg-slate-50 px-4 text-sm transition-all focus-visible:ring-2",
                          error
                            ? "border-rose-300 focus-visible:border-rose-500 focus-visible:ring-rose-500/20"
                            : "border-slate-200 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20",
                        )}
                        maxLength={field.maxLength}
                        min={field.min}
                        max={field.max}
                      />
                      <p id={describedBy} className={cn("text-xs font-medium text-slate-500", error && "text-rose-500")}>
                        {error || helper}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-6">
                <Link
                  href={backHref ?? "/vehicles"}
                  className="inline-flex items-center justify-center rounded-xl px-6 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition-all active:scale-95 disabled:opacity-70 hover:bg-indigo-700"
                >
                  <Save className="mr-2 size-4" />
                  {submitLabel}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
