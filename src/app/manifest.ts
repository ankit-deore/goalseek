import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { routes } from "@/config/routes";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.name,
    description: site.description,
    start_url: routes.inbox,
    display: "standalone",
    background_color: site.backgroundColor,
    theme_color: site.themeColor,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    // Lets Android "Share → GoalSeek" send links straight into the inbox.
    share_target: {
      action: routes.share,
      method: "GET",
      params: { title: "title", text: "text", url: "url" },
    },
  } as MetadataRoute.Manifest;
}
