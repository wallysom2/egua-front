import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Adiciona o lodash como fallback
    config.resolve.fallback = {
      ...config.resolve.fallback,
      lodash: require.resolve('lodash'),
    };
    return config;
  },
};

export default nextConfig;
