/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  allowedDevOrigins: [
    'ais-dev-5r3muatmwvxqsdwjrpjpgg-181216241107.us-east5.run.app',
    'ais-pre-5r3muatmwvxqsdwjrpjpgg-181216241107.us-east5.run.app',
    'localhost:3000',
    '*.run.app',
  ],
};
module.exports = nextConfig;
