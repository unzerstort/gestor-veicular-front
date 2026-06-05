const DEFAULT_RETURN_PATH = "/vehicles";
const CREATE_VEHICLE_PATH = "/vehicles/new";
const ABSOLUTE_URL_BASE = "http://localhost";

function isInternalPath(path: string) {
  return path.startsWith("/") && !path.startsWith("//");
}

function normalizeReturnPathValue(from: string | null | undefined, depth = 0): string {
  if (!from || depth > 3 || !isInternalPath(from)) {
    return DEFAULT_RETURN_PATH;
  }

  if (!from.startsWith(CREATE_VEHICLE_PATH)) {
    return from;
  }

  try {
    const parsed = new URL(from, ABSOLUTE_URL_BASE);
    return normalizeReturnPathValue(parsed.searchParams.get("from"), depth + 1);
  } catch {
    return DEFAULT_RETURN_PATH;
  }
}

export function normalizeReturnPath(from: string | null | undefined) {
  return normalizeReturnPathValue(from);
}

export function getCurrentPathWithQuery(pathname: string, searchParams?: Pick<URLSearchParams, "toString"> | null) {
  const query = searchParams?.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function buildCreateVehicleHref(from: string) {
  return `${CREATE_VEHICLE_PATH}?from=${encodeURIComponent(normalizeReturnPath(from))}`;
}

export function getReturnLabel(from: string | null | undefined) {
  const normalized = normalizeReturnPath(from);

  if (normalized === "/") {
    return "Dashboard";
  }

  if (normalized.startsWith("/vehicles")) {
    return "Veículos";
  }

  return "Voltar";
}
