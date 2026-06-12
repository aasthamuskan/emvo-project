import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { ParticleBackground } from "@/components/ui/ParticleBackground";
import { QueryProvider } from "@/components/providers/QueryProvider";

export const metadata: Metadata = {
  title: "EMVO NEXUS — AI-Native CRM",
  description:
    "Next-generation AI-powered CRM. Reach your shoppers intelligently with real-time segmentation, campaign orchestration, and natural language commands.",
  keywords: ["CRM", "AI", "marketing", "campaigns", "customer engagement", "WhatsApp", "SMS"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <QueryProvider>
          {/* Interactive particle background */}
          <ParticleBackground />

          {/* CRT scanline overlay */}
          <div className="scanline-overlay" />

          {/* App shell */}
          <div
            style={{
              display: "flex",
              height: "100vh",
              overflow: "hidden",
              position: "relative",
              zIndex: 1,
            }}
          >
            <Sidebar />
            <main style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
              <div style={{ flex: 1 }}>
                {children}
              </div>
              <Footer />
            </main>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
