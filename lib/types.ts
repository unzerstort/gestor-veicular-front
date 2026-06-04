export type Vehicle = {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  createdAt: string;
  updatedAt: string;
};

export type ProblemDetails = {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  errors?: {
    path: string;
    message: string;
    code: string;
  }[];
};

export type VehicleFilters = {
  brand?: string;
  year?: string;
};

export type VehicleFormValues = {
  plate: string;
  brand: string;
  model: string;
  year: string;
  color: string;
};

export type VehicleActivityItem = {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  timestamp: string;
};

export type VehicleBrandDistributionItem = {
  brand: string;
  count: number;
  percentage: number;
};

export type VehicleYearBucketDistributionItem = {
  label: string;
  count: number;
  percentage: number;
};

export type VehicleDashboardSummary = {
  totalVehicles: number;
  recentlyCreatedCount: number;
  recentlyUpdatedCount: number;
  oldestVehicleYear: number | null;
  newestVehicleYear: number | null;
  featuredBrand?: string;
  recentlyCreatedVehicles: VehicleActivityItem[];
  recentlyUpdatedVehicles: VehicleActivityItem[];
  vehiclesByBrand: VehicleBrandDistributionItem[];
  vehiclesByYearBucket: VehicleYearBucketDistributionItem[];
};
