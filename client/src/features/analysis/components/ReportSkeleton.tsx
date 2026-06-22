import { Card, CardBody } from "../../../components/ui/card";
import { Skeleton } from "../../../components/ui/Skeleton";
import { LoadingStages } from "./LoadingStages";

/** Mirrors the report layout so there is no blank screen and no layout shift. */
export function ReportSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardBody className="space-y-3">
          <LoadingStages />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardBody>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <Card key={i}>
            <CardBody className="space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-12" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </CardBody>
          </Card>
        ))}
      </div>

      {[0, 1].map((i) => (
        <Skeleton key={i} className="h-20 w-full rounded-xl" />
      ))}
    </div>
  );
}
