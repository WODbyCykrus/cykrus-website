/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tag 1: Static Export für Cloudflare Pages.
  // Sobald Worker-Integration nötig wird → @cloudflare/next-on-pages.
  output: 'export',
  trailingSlash: true,

  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  images: {
    unoptimized: true,
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

  // headers() entfällt im Static-Export-Modus —
  // Cache-Control kommt später über _headers oder Worker.
}

export default nextConfig
