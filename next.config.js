/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Adiciona o lodash como fallback
    config.resolve.fallback = {
      ...config.resolve.fallback,
      lodash: require.resolve('lodash'),
    };
    return config;
  },
};

module.exports = nextConfig; 