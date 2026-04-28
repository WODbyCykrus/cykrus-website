/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },

  experimental: {
    optimizePackageImports: ['@react-three/drei', 'framer-motion'],
  },

  // GLB/AVIF assets nicht durch JS-Loader leiten
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glb|gltf|hdr|ktx2)$/,
      type: 'asset/resource',
    })
    return config
  },

  async headers() {
    return [
      {
        source: '/:all*(woff2|avif|webp|glb|gltf|ktx2|hdr)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },
}

export default nextConfig
