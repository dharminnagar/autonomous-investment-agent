import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ArweaveWalletKit } from "arweave-wallet-kit";
import { Header } from "@/components/Header";

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
            permissions: [
              "ACCESS_ADDRESS",
              "ACCESS_PUBLIC_KEY",
              "SIGN_TRANSACTION",
              "DISPATCH",
            ],
            ensurePermissions: true,
          }}
          theme={{
            displayTheme: "light",
          }}
          >
            <Header />
        {children}
        </ArweaveWalletKit>
      </body>
    </html>
  );
}
