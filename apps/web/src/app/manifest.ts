import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Glide",
    short_name: "Glide",
    description: "A local-first planner that turns a messy task list into a realistic daily runway.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f5eb",
    theme_color: "#1f8f83",
    icons: [
      {
        src: "/favicon/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/favicon/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
