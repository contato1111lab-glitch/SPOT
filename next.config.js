/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  allowedDevOrigins: [
    'ais-dev-ji5ifuc3yawfsd4xshyruy-22946754136.us-west2.run.app',
    'ais-pre-ji5ifuc3yawfsd4xshyruy-22946754136.us-west2.run.app',
    'localhost:3000',
    '*.run.app',
  ],
};
module.exports = nextConfig;
