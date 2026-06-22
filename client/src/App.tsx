import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { AppShell } from "./components/layout/AppShell";
import { Skeleton } from "./components/ui/Skeleton";
import { UploadPage } from "./features/upload/UploadPage";

const LandingPage = lazy(() =>
  import("./features/home/LandingPage").then((m) => ({ default: m.LandingPage })),
);
const AnalysisPage = lazy(() =>
  import("./features/analysis/AnalysisPage").then((m) => ({ default: m.AnalysisPage })),
);

function RouteFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

export default function App() {
  return (
    <AppShell>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/analyze" element={<UploadPage />} />
          <Route path="/analysis/:taskId" element={<AnalysisPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AppShell>
  );
}
