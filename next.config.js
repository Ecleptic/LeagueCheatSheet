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
          maxEntries: 500, // Increased for more images
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
    {
      // Explicit caching for ability videos from Riot CDN
      urlPattern: /^https:\/\/lol\.dyn\.riotcdn\.net\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'riot-video-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days (videos change less frequently)
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