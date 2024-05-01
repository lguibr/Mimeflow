"use client";

import { FileProvider } from "@/app/contexts/File";
import { GameProvider } from "@/app/contexts/Game";

export default function CoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GameProvider>
      <FileProvider>{children}</FileProvider>
    </GameProvider>
  );
}
