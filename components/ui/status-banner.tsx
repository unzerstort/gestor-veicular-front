import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type StatusBannerProps = {
  severity: "error" | "warning" | "info" | "success";
  title: string;
  message: string;
};

export function StatusBanner({ severity, title, message }: StatusBannerProps) {
  const variantMap = {
    error: "error",
    warning: "warning",
    info: "info",
    success: "success",
  } as const;

  return (
    <Alert variant={variantMap[severity]}>
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
