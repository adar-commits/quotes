import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.carpetshop.co.il", pathname: "/**" },
      { protocol: "https", hostname: "quotes.carpetshop.co.il", pathname: "/**" },
      { protocol: "https", hostname: "app.fireberry.com", pathname: "/**" },
      { protocol: "https", hostname: "api.dicebear.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
