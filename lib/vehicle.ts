import { Vehicle, VehicleFormValues } from "@/lib/types";

const platePattern = /^[A-Z]{3}\d{4}$|^[A-Z]{3}\d[A-Z]\d{2}$/;
const INVALID_DATE_LABEL = "Data indisponível";

export const MIN_VEHICLE_YEAR = 1950;
export const MAX_VEHICLE_YEAR = 2026;

export function normalizePlate(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function createVehicleFormValues(vehicle?: Vehicle): VehicleFormValues {
  return {
    plate: vehicle?.plate ?? "",
    brand: vehicle?.brand ?? "",
    model: vehicle?.model ?? "",
    year: vehicle?.year ? String(vehicle.year) : "",
    color: vehicle?.color ?? "",
  };
}

export function validateVehicle(values: VehicleFormValues, partial = false) {
  const errors: Partial<Record<keyof VehicleFormValues, string>> = {};

  const plate = normalizePlate(values.plate);
  const brand = values.brand.trim();
  const model = values.model.trim();
  const color = values.color.trim();
  const year = values.year.trim();

  if (!partial || plate) {
    if (!plate) {
      errors.plate = "Informe a placa do veículo.";
    } else if (!platePattern.test(plate)) {
      errors.plate = "Use os formatos ABC1234 ou ABC1D23.";
    }
  }

  if (!partial || brand) {
    if (!brand) {
      errors.brand = "Informe a marca.";
    } else if (brand.length > 120) {
      errors.brand = "A marca deve ter no máximo 120 caracteres.";
    }
  }

  if (!partial || model) {
    if (!model) {
      errors.model = "Informe o modelo.";
    } else if (model.length > 120) {
      errors.model = "O modelo deve ter no máximo 120 caracteres.";
    }
  }

  if (!partial || year) {
    const numericYear = Number(year);

    if (!year) {
      errors.year = "Informe o ano.";
    } else if (!Number.isInteger(numericYear) || numericYear < MIN_VEHICLE_YEAR || numericYear > MAX_VEHICLE_YEAR) {
      errors.year = `Use um ano inteiro entre ${MIN_VEHICLE_YEAR} e ${MAX_VEHICLE_YEAR}.`;
    }
  }

  if (!partial || color) {
    if (!color) {
      errors.color = "Informe a cor.";
    } else if (color.length > 60) {
      errors.color = "A cor deve ter no máximo 60 caracteres.";
    }
  }

  return errors;
}

export function buildVehiclePayload(values: VehicleFormValues) {
  return {
    plate: normalizePlate(values.plate),
    brand: values.brand.trim(),
    model: values.model.trim(),
    year: Number(values.year),
    color: values.color.trim(),
  };
}

export function buildVehiclePatchPayload(initial: Vehicle, values: VehicleFormValues) {
  const normalizedNext = buildVehiclePayload(values);
  const payload: Partial<ReturnType<typeof buildVehiclePayload>> = {};

  if (normalizedNext.plate !== initial.plate) payload.plate = normalizedNext.plate;
  if (normalizedNext.brand !== initial.brand) payload.brand = normalizedNext.brand;
  if (normalizedNext.model !== initial.model) payload.model = normalizedNext.model;
  if (normalizedNext.year !== initial.year) payload.year = normalizedNext.year;
  if (normalizedNext.color !== initial.color) payload.color = normalizedNext.color;

  return payload;
}

export function formatTimestamp(value: string) {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return INVALID_DATE_LABEL;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedDate);
}
