"use client";

import dynamic from "next/dynamic";
const HomeView = dynamic(() => import("@/app/components/home"), {
  ssr: false,
});

const HomePage: React.FC = () => {
  return (
    <main>
      <HomeView />
    </main>
  );
};

export default HomePage;
