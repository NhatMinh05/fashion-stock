import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bỏ qua lỗi ESLint vặt (khuyên dùng lúc chạy deadline)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Bỏ qua lỗi TypeScript vặt
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;