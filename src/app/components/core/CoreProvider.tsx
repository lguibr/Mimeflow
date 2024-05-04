"use client";

import { FileProvider } from "@/app/contexts/File";
import { GameProvider } from "@/app/contexts/Game";
import { SnackbarProvider } from "@/app/contexts/Snackbar";

export default function CoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SnackbarProvider>
      <GameProvider>
        <FileProvider>{children}</FileProvider>
      </GameProvider>
    </SnackbarProvider>
  );
}
