/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/ddragon\.leagueoflegends\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'riot-api-cache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
  ],
});

const nextConfig = {
  images: {
    domains: ['ddragon.leagueoflegends.com'],
    unoptimized: false,
  },
  // Enable standalone mode for better PWA performance
  output: 'standalone',
};

module.exports = withPWA(nextConfig);