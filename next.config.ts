import type { NextConfig } from 'next';

const imageKitUrlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

let imageKitHost = '';

if (imageKitUrlEndpoint) {
  try {
    imageKitHost = new URL(imageKitUrlEndpoint).hostname;
  } catch {
    imageKitHost = '';
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      ...(imageKitHost
        ? [
            {
              protocol: 'https' as const,
              hostname: imageKitHost,
              pathname: '/**',
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;