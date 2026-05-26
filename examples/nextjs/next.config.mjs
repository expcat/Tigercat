/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  transpilePackages: ['@expcat/tigercat-core', '@expcat/tigercat-react']
}

export default nextConfig
