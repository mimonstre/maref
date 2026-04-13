import type { Metadata } from "next";
import "./globals.css";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import AuthProvider from "@/components/auth/AuthProvider";
import GlobalQuestToast from "@/components/shared/GlobalQuestToast";

export const metadata: Metadata = {
  title: "MAREF - L'intelligence de vos choix",
  description: "MAREF aide à comprendre, comparer et décider plus clairement avant un achat.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="app-shell text-gray-900 antialiased">
        <AuthProvider>
          <TopBar />
          <GlobalQuestToast />
          <main className="page-wrap min-h-screen pb-24 pt-18 md:pb-8">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
