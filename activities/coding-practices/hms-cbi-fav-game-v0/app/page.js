import { Suspense } from "react";
import "../styles/globals.css";
import PageWrapper from "./components/PageWrapper/PageWrapper";

export default function ObstacleListPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <PageWrapper />
    </Suspense>
  );
}