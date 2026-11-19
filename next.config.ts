import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // ImgBB, where every uploaded image is hosted.
      { protocol: "https", hostname: "i.ibb.co" },
      // Google profile photos from OAuth sign-in.
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
}

export default nextConfig
