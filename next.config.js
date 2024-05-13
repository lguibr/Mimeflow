const withPWA = require('next-pwa')({
  dest: 'public',
  reloadOnOnline: true,
  cacheOnFrontEndNav: true,
  navigationPreload: true,
  buildExcludes: ["app-build-manifest.json"],
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
        },
      },
    },
    {
      urlPattern: /^http?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
        },
      },
    },
  ],
  register: true,
  cacheStartUrl: true,
  dynamicStartUrl: true,
  skipWaiting: true,

})

const nextConfig = {
  compiler: { styledComponents: true },
}

module.exports = withPWA(nextConfig);
