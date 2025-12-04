"use client";

import React from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Home } from "lucide-react";
import Link from "next/link";

interface MainLayoutProps {
  children?: React.ReactNode;
  leftPanel?: React.ReactNode;
  rightPanel?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  leftPanel,
  rightPanel,
}) => {
  const [direction, setDirection] = React.useState<"horizontal" | "vertical">(
    "horizontal"
  );

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < window.innerHeight) {
        setDirection("vertical");
      } else {
        setDirection("horizontal");
      }
    };

    // Initial check
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Header / Breadcrumb */}
      {/* Home Button */}
      <Link href="/" className="absolute top-4 left-4 z-50">
        <button className="p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-black/60 transition-all">
          <Home className="w-6 h-6" />
        </button>
      </Link>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {leftPanel && rightPanel ? (
          <ResizablePanelGroup direction={direction} className="h-full w-full">
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="h-full w-full relative bg-black/50">
                {leftPanel}
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle className="bg-white/10" />
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="h-full w-full relative bg-black/20">
                {rightPanel}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <div className="h-full w-full">{children}</div>
        )}
      </div>
    </div>
  );
};

export default MainLayout;
