import type { Metadata } from "next";
import "./globals.css";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import AuthProvider from "@/components/auth/AuthProvider";

export const metadata: Metadata = {
  title: "MAREF - Intelligence Decisionnelle",
  description: "Moteur d intelligence decisionnelle applique a l achat",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="app-shell text-gray-900 antialiased">
        <AuthProvider>
          <TopBar />
          <main className="page-wrap min-h-screen pb-24 pt-16 md:pb-8">
            <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
