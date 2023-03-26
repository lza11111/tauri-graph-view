/** @type {import('next').NextConfig} */

module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    images: {
      unoptimized: true,
    },
  },
  webpack: (config) => {
    config.resolve.alias['@'] = __dirname + '/src';
    return config;
  },
};
