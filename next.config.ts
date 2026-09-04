import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "aquacare.udayamarketing.in",
        pathname: "/**",
      },

      {
        protocol: "https",
        hostname: "**.udayamarketing.in",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "**.udayamarketing.in",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/**",
      },
      {
        // Fallback for any remaining http://example.com placeholder thumbnails
        protocol: "http",
        hostname: "example.com",
        pathname: "/**",
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
