import type { NextConfig } from "next";

const APP_ONLY_ROUTES = [
  "/login",
  "/dashboard",
  "/onboarding",
  "/profile",
  "/settings",
  "/activities",
  "/agent",
  "/meal-plans",
  "/nutrition",
];

const nextConfig: NextConfig = {
  images: {
    domains: [],
  },
  async redirects() {
    return APP_ONLY_ROUTES.map((source) => ({
      source,
      destination: "/",
      permanent: false,
    }));
  },
};

export default nextConfig;
