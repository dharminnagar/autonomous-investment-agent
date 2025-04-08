import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import WalletConnect from "./components/WalletConnect";
import { ArweaveWalletKit } from '@arweave-wallet-kit/react';
import BrowserWalletStrategy from '@arweave-wallet-kit/browser-wallet-strategy';
import ArConnectStrategy from '@arweave-wallet-kit/arconnect-strategy';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Autonomous Investment Agent",
  description: "This is a autonomous investment agent built on Arweave & AO",
};

// Initialize wallet strategies
const browserWalletStrategy = new BrowserWalletStrategy();
const arConnectStrategy = new ArConnectStrategy();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ArweaveWalletKit
          config={{
            strategies: [browserWalletStrategy, arConnectStrategy],
            permissions: ['ACCESS_ADDRESS', 'SIGN_TRANSACTION', 'ACCESS_PUBLIC_KEY'],
          }}
        >
          <div className="min-h-screen flex flex-col">
            <header className="border-b border-gray-200 dark:border-gray-800">
              <div className="container mx-auto">
                <div className="flex justify-between items-center py-4">
                  <h1 className="text-xl font-bold">Autonomous Investment Agent</h1>
                  <WalletConnect />
                </div>
              </div>
            </header>
            <main className="flex-1 container mx-auto py-8">
              {children}
            </main>
            <footer className="border-t border-gray-200 dark:border-gray-800 py-6">
              <div className="container mx-auto text-center text-sm text-gray-500">
                Built on Arweave & AO
              </div>
            </footer>
          </div>
        </ArweaveWalletKit>
      </body>
    </html>
  );
}
