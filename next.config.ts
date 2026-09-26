import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This project lives on an exFAT volume.
  // Turbopack's on-disk cache cannot open there, so the dev server exits after "Ready".
  // The image optimizer also writes AppleDouble sidecars and then serves those
  // instead of the pictures, so product photos stay black. Serve the files directly.
  images: {
    unoptimized: true,
  },
  experimental: {
    turbopackFileSystemCacheForDev: false,
    turbopackFileSystemCacheForBuild: false,
  },
};

export default nextConfig;
