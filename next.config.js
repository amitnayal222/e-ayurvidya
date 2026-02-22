/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public', // service worker goes in public
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  reactStrictMode: true,
  turbopack: {}, // keeps your current config
};

module.exports = withPWA(nextConfig);

