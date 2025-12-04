"use client";

import dynamic from "next/dynamic";
import MainLayout from "@/app/components/layout/MainLayout";
const WebcamPoseTracking = dynamic(
  () => import("@/app/components/tracking/WebcamPoseTracking"),
  {
    ssr: false,
  }
);

const YoutubePoseTracking = dynamic(
  () => import("@/app/components/tracking/YoutubePoseTracking"),
  {
    ssr: false,
  }
);

export default function TrackingPage() {
  return (
    <MainLayout
      leftPanel={<YoutubePoseTracking />}
      rightPanel={<WebcamPoseTracking />}
    >
      {/* Fallback or additional content if needed */}
    </MainLayout>
  );
}
