// C:\Users\SMC\Documents\GitHub\procurement-erp-system\frontend\src\app\layout.js
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import I18nProvider from "@/components/I18nProvider"; // Add this import

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "KUN Procurement System",
  description: "KUN Real Estate Procurement & Contracts Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
          async
          defer
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Wrap children with I18nProvider */}
        <I18nProvider>
          {children}
          <Toaster position="top-right" reverseOrder={false} />
        </I18nProvider>
      </body>
    </html>
  );
}