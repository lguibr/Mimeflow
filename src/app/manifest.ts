import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MimeFlow 0.1 - The Pose Matching Application",
    short_name: "MimeFlow 0.1",
    orientation: "any",
    scope: "/",
    start_url: "/",
    display: "standalone",
    theme_color: "#111",
    background_color: "#222",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
