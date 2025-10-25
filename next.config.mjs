/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: { unoptimized: true },
    // ❌ Remove "output: 'export'"
    // ✅ Let Amplify handle server rendering
  };
  
  export default nextConfig;
  