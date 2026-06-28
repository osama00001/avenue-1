/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://192.168.1.10:3000",
  ],
  async redirects() {
    return [
      { source: "/terms", destination: "/cms/terms", permanent: true },
      { source: "/privacy", destination: "/cms/privacy", permanent: true },
      { source: "/cms/terms-conditions", destination: "/cms/terms", permanent: true },
      { source: "/cms/privacy-notice", destination: "/cms/privacy", permanent: true },
      { source: "/cms/cookie-policy", destination: "/cms/cookies", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.avenuebookstore.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
