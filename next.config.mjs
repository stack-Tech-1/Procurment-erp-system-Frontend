/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export', // ✅ new way to enable static export
    images: {
      unoptimized: true, // ✅ needed for static export
    },
  };
  
  export default nextConfig;
  