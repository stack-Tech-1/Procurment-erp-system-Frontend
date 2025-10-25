/** @type {import('next').NextConfig} */
const nextConfig = {
    // CRUCIAL: Set this for static export to the 'out' directory
    output: 'export', 
    
    // OPTIONAL: Keep this if you use images
    images: {
      unoptimized: true,
    },
      
  };
  
  // Use the ES Module 'export default' syntax
  export default nextConfig; 
  