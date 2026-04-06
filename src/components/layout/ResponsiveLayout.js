"use client";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import AIAssistant from "@/components/ai/AIAssistant";

export default function ResponsiveLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
      <AIAssistant />
    </div>
  );
}