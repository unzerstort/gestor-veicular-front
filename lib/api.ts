import { ProblemDetails, Vehicle, VehicleFilters } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export class ApiError extends Error {
  constructor(public problem: ProblemDetails) {
    super(problem.detail || problem.title);
  }
}

function createUrl(path: string, params?: Record<string, string | undefined>) {
  if (!API_BASE_URL) {
    throw new Error("Defina NEXT_PUBLIC_API_BASE_URL para conectar o front-end ao backend.");
  }

  const url = new URL(path, API_BASE_URL);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      }
    });
  }

  return url;
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  let problem: ProblemDetails = {
    type: "about:blank",
    title: "Erro inesperado",
    status: response.status,
    detail: "Não foi possível concluir a requisição.",
  };

  try {
    problem = (await response.json()) as ProblemDetails;
  } catch {
    if (response.statusText) {
      problem.detail = response.statusText;
    }
  }

  throw new ApiError(problem);
}

export async function fetchHealth() {
  const response = await fetch(createUrl("/api/health"), {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  return parseResponse<{ status: string }>(response);
}

export async function fetchVehicles(filters: VehicleFilters) {
  const response = await fetch(
    createUrl("/api/vehicles", {
      brand: filters.brand?.trim() || undefined,
      year: filters.year?.trim() || undefined,
    }),
    {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  return parseResponse<Vehicle[]>(response);
}

export async function fetchVehicle(id: string) {
  const response = await fetch(createUrl(`/api/vehicles/${id}`), {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  return parseResponse<Vehicle>(response);
}

export async function createVehicle(payload: {
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
}) {
  const response = await fetch(createUrl("/api/vehicles"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, application/problem+json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse<Vehicle>(response);
}

export async function updateVehicle(
  id: string,
  payload: Partial<{
    plate: string;
    brand: string;
    model: string;
    year: number;
    color: string;
  }>,
) {
  const response = await fetch(createUrl(`/api/vehicles/${id}`), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, application/problem+json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse<Vehicle>(response);
}

export async function deleteVehicle(id: string) {
  const response = await fetch(createUrl(`/api/vehicles/${id}`), {
    method: "DELETE",
    headers: {
      Accept: "application/json, application/problem+json",
    },
  });

  return parseResponse<void>(response);
}
