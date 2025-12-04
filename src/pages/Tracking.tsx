import MainLayout from "@/app/components/layout/MainLayout";
import WebcamPoseTracking from "@/app/components/tracking/WebcamPoseTracking";
import YoutubePoseTracking from "@/app/components/tracking/YoutubePoseTracking";

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
