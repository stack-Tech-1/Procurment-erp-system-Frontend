"use client";
export default function AuthLayout({
  title, // Title and Subtitle are now handled inside LoginPage's columns, but we keep them for flexibility
  subtitle,
  children,
  background,
}) {
  return (
    // 1. Ensure the outermost container is full-screen and flex-centered
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      
      {/* 2. Custom background (kept outside the content area) */}
      {background || (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="absolute inset-0 overflow-hidden">
            {/* ... default background elements ... */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-float-slow"></div>
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float-medium"></div>
            <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-float-slow"></div>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>
          </div>
        </div>
      )}

      {/* 3. This is the **NEW/MODIFIED** content wrapper. 
          We remove max-w-md, p-8, and the fixed background/blur 
          so the content (LoginPage) can stretch and define its own columns. 
          The w-full ensures it uses the available space.
      */}
      <div className="relative z-10 w-full min-h-screen lg:flex lg:justify-center">
        {/*
          We are removing the title/subtitle here as the LoginPage now owns the
          layout and titles for the two columns.
        */}
        {children}
      </div>
    </div>
  );
}