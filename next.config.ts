import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // These modules are used by `node-routeros` and are not available in the browser.
      // We provide empty fallbacks for them to prevent build errors.
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        'source-map-support': false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
