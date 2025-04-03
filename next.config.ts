import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.ghost.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.ghost.io",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/**",
        port: "2368",
      },
    ],
  },
};

export default nextConfig;
