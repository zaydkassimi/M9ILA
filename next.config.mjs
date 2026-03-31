/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
