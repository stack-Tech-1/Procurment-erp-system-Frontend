/** @type {import('next').NextConfig} */
const nextConfig = {
    // CRUCIAL: Must be set to true for Amplify Static Hosting
    output: 'export',
    
    // Optional: If you use images, set this to prevent errors during export
    images: {
      unoptimized: true,
    },
  }
  
  module.exports = nextConfig
  