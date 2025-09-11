import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Video Generation App",
  description: "Create stunning videos with AI-powered generation using advanced models",
  keywords: "AI, video generation, artificial intelligence, video creation, automation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Navigation */}
            <nav className="border-b border-white/10 bg-black/20 backdrop-blur-lg">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                  <div className="flex items-center space-x-8">
                    <Link href="/" className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">AI</span>
                      </div>
                      <span className="text-white font-semibold text-lg">VideoGen</span>
                    </Link>
                    
                    <div className="hidden md:flex space-x-6">
                      <Link href="/">
                        <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/10">
                          Generate
                        </Button>
                      </Link>
                      <Link href="/history">
                        <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/10">
                          History
                        </Button>
                      </Link>
                      <Link href="/settings">
                        <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/10">
                          Settings
                        </Button>
                      </Link>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-green-500/20 rounded-full">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-sm font-medium">AI Ready</span>
                    </div>
                  </div>
                </div>
                
                {/* Mobile Navigation */}
                <div className="md:hidden pb-3">
                  <div className="flex space-x-4">
                    <Link href="/">
                      <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-white/10">
                        Generate
                      </Button>
                    </Link>
                    <Link href="/history">
                      <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-white/10">
                        History
                      </Button>
                    </Link>
                    <Link href="/settings">
                      <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-white/10">
                        Settings
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10">
              {children}
            </main>

            {/* Background Effects */}
            <div className="fixed inset-0 z-0">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>
          </div>
          
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}