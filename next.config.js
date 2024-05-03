const withPWA = require('next-pwa')({
  dest: 'public',
  reloadOnOnline: true,
  cacheOnFrontEndNav: true,
  navigationPreload: true,
})

const nextConfig = {
  compiler: { styledComponents: true },
}

module.exports = withPWA(nextConfig);
