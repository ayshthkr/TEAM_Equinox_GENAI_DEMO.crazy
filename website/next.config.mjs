/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        // Proxy API calls to your backend
        source: "/api/:path*",
        destination: "http://40.81.231.20:8000/:path*", 
      },
    ];
  },
};

export default nextConfig;
