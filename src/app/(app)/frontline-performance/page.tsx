import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { getApplicationRoute } from "@/modules/application/routes";

export default function FrontlinePerformancePage() {
  const route = getApplicationRoute("/frontline-performance");

  return (
    <>
      <PageHeader eyebrow={route.eyebrow} title={route.title} />
      <EmptyState description={route.description} signal={route.signal} />
    </>
  );
}
