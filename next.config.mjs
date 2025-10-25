/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'standalone', // 👈 ADD THIS
    images: {
      unoptimized: true,
    },
  };
  
  export default nextConfig;
  