import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Fix for "Blocked cross-origin request to Next.js dev resource"
  allowedDevOrigins: ['127.0.0.1'],
};

export default nextConfig;
