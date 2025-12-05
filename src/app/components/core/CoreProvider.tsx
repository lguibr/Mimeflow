"use client";

import { FileProvider } from "@/app/contexts/File";
import { GameProvider } from "@/app/contexts/Game";
import { SnackbarProvider } from "@/app/contexts/Snackbar";
import { AuthProvider } from "@/app/contexts/Auth";

export default function CoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SnackbarProvider>
      <AuthProvider>
        <GameProvider>
          <FileProvider>{children}</FileProvider>
        </GameProvider>
      </AuthProvider>
    </SnackbarProvider>
  );
}
