"use client";

import dynamic from "next/dynamic";

const TrackingView = dynamic(() => import("@/app/components/tracking"), {
  ssr: false,
});

const App: React.FC = () => {
  return (
    <main>
      <TrackingView />
    </main>
  );
};

export default App;
