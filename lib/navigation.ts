export function normalizeReturnPath(from: string | null | undefined) {
  if (!from || !from.startsWith("/")) {
    return "/vehicles";
  }

  return from;
}

export function getCurrentPathWithQuery(pathname: string, searchParams?: Pick<URLSearchParams, "toString"> | null) {
  const query = searchParams?.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function buildCreateVehicleHref(from: string) {
  return `/vehicles/new?from=${encodeURIComponent(from)}`;
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
