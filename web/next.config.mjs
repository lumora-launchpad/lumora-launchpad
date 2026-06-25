/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Style lint rules should not block a deploy. Type checking stays on.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
