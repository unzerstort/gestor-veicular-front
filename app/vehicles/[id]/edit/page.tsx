import { VehicleEditScreen } from "@/components/vehicles/vehicle-edit-screen";

type VehicleEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function VehicleEditPage({ params }: VehicleEditPageProps) {
  const { id } = await params;

  return <VehicleEditScreen vehicleId={id} />;
}
