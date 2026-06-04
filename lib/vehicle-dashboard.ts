import {
  Vehicle,
  VehicleActivityItem,
  VehicleBrandDistributionItem,
  VehicleDashboardSummary,
  VehicleYearBucketDistributionItem,
} from "@/lib/types";

const RECENT_WINDOW_DAYS = 7;
const ACTIVITY_LIMIT = 5;

const yearBuckets = [
  { label: "Até 2010", matches: (year: number) => year <= 2010 },
  { label: "2011 a 2015", matches: (year: number) => year >= 2011 && year <= 2015 },
  { label: "2016 a 2020", matches: (year: number) => year >= 2016 && year <= 2020 },
  { label: "2021 a 2025", matches: (year: number) => year >= 2021 && year <= 2025 },
  { label: "2026+", matches: (year: number) => year >= 2026 },
] as const;

function parseTimestamp(value: string) {
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
}

function buildActivityItems(vehicles: Vehicle[], key: "createdAt" | "updatedAt"): VehicleActivityItem[] {
  return vehicles
    .map((vehicle) => {
      const parsedTimestamp = parseTimestamp(vehicle[key]);

      if (parsedTimestamp === null) {
        return null;
      }

      return {
        id: vehicle.id,
        plate: vehicle.plate,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        timestamp: vehicle[key],
        parsedTimestamp,
      };
    })
    .filter((item): item is VehicleActivityItem & { parsedTimestamp: number } => item !== null)
    .sort((left, right) => right.parsedTimestamp - left.parsedTimestamp)
    .slice(0, ACTIVITY_LIMIT)
    .map(({ parsedTimestamp: _parsedTimestamp, ...item }) => item);
}

function countRecentVehicles(vehicles: Vehicle[], key: "createdAt" | "updatedAt") {
  const threshold = Date.now() - RECENT_WINDOW_DAYS * 24 * 60 * 60 * 1000;

  return vehicles.reduce((count, vehicle) => {
    const parsedTimestamp = parseTimestamp(vehicle[key]);

    if (parsedTimestamp === null || parsedTimestamp < threshold) {
      return count;
    }

    return count + 1;
  }, 0);
}

function getVehiclesByBrand(vehicles: Vehicle[]): VehicleBrandDistributionItem[] {
  const brandCount = new Map<string, number>();

  vehicles.forEach((vehicle) => {
    const brand = vehicle.brand.trim() || "Sem marca";
    brandCount.set(brand, (brandCount.get(brand) ?? 0) + 1);
  });

  const items = Array.from(brandCount.entries())
    .map(([brand, count]) => ({ brand, count }))
    .sort((left, right) => right.count - left.count || left.brand.localeCompare(right.brand, "pt-BR"))
    .slice(0, 5);

  const maxCount = items[0]?.count ?? 0;

  return items.map((item) => ({
    ...item,
    percentage: maxCount === 0 ? 0 : Math.round((item.count / maxCount) * 100),
  }));
}

function getVehiclesByYearBucket(vehicles: Vehicle[]): VehicleYearBucketDistributionItem[] {
  const bucketCounts = yearBuckets.map((bucket) => ({
    label: bucket.label,
    count: vehicles.filter((vehicle) => bucket.matches(vehicle.year)).length,
  }));

  const maxCount = Math.max(...bucketCounts.map((bucket) => bucket.count), 0);

  return bucketCounts.map((bucket) => ({
    ...bucket,
    percentage: maxCount === 0 ? 0 : Math.round((bucket.count / maxCount) * 100),
  }));
}

function getFleetRange(vehicles: Vehicle[]) {
  const years = vehicles
    .map((vehicle) => vehicle.year)
    .filter((year) => Number.isInteger(year) && year >= 1886 && year <= 9999)
    .sort((left, right) => left - right);

  return {
    oldestVehicleYear: years[0] ?? null,
    newestVehicleYear: years[years.length - 1] ?? null,
  };
}

export function buildVehicleDashboardSummary(vehicles: Vehicle[]): VehicleDashboardSummary {
  const vehiclesByBrand = getVehiclesByBrand(vehicles);
  const vehiclesByYearBucket = getVehiclesByYearBucket(vehicles);
  const { oldestVehicleYear, newestVehicleYear } = getFleetRange(vehicles);

  return {
    totalVehicles: vehicles.length,
    recentlyCreatedCount: countRecentVehicles(vehicles, "createdAt"),
    recentlyUpdatedCount: countRecentVehicles(vehicles, "updatedAt"),
    oldestVehicleYear,
    newestVehicleYear,
    featuredBrand: vehiclesByBrand[0]?.brand,
    recentlyCreatedVehicles: buildActivityItems(vehicles, "createdAt"),
    recentlyUpdatedVehicles: buildActivityItems(vehicles, "updatedAt"),
    vehiclesByBrand,
    vehiclesByYearBucket,
  };
}
