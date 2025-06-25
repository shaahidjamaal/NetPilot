
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
    // This is to prevent the client bundle from trying to include the 'node-routeros' library,
    // which uses Node.js-specific APIs not available in the browser.
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'node-routeros': false, // an empty module
        net: false, // an empty module
        tls: false, // an empty module
      };
    }

    return config;
  },
};

export default nextConfig;
