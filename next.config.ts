import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pino", "pino-pretty"],
  experimental: {
    optimizeCss: false, // Disable Lightning CSS
  },
  allowedDevOrigins: [
    "http://192.168.56.1:3000",
    "http://192.168.1.41:3000",
  ],
  images: {
    remotePatterns: [{ hostname: "res.cloudinary.com" }],
  },
};

export default nextConfig;
