/** @type {import('next').NextConfig} */
const nextConfig = {
  // Shared workspace package ships untranspiled JSX — Next compiles it.
  transpilePackages: ['@platform/shared'],
  env: {
    // Which product this app is (read by @platform/shared/brand).
    NEXT_PUBLIC_PRODUCT: 'taprate',
  },
};

export default nextConfig;
