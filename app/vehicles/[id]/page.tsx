import { VehicleDetailsScreen } from "@/components/vehicles/vehicle-details-screen";

type VehicleDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function VehicleDetailsPage({
  params,
}: VehicleDetailsPageProps) {
  const { id } = await params;

  return <VehicleDetailsScreen vehicleId={id} />;
}
