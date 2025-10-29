import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Family Expense Manager",
  description: "Quản lý chi tiêu gia đình thông minh với tính năng theo dõi giao dịch, ngân sách, mục tiêu tiết kiệm và báo cáo chi tiết.",
  keywords: ["quản lý chi tiêu", "gia đình", "ngân sách", "tiết kiệm", "giao dịch", "báo cáo"],
  authors: [{ name: "Family Expense Manager Team" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "Family Expense Manager",
    description: "Quản lý chi tiêu gia đình thông minh",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <Providers>
            {children}
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
