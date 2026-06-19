import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/app/providers/reduxProvider";
import { Providers } from "./providers/authProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "Avenue Bookstore | New Releases, Book Deals & Bestsellers Online",
    template: "%s | Avenue Bookstore",
  },
  description:
    "Bringing the bookstore to your door we collate every new release, every book deal and every exciting launch from your favourite brick and mortar stores in one welcoming space – Avenue Bookstore.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProvider>
          <Providers>{children}</Providers>
        </ReduxProvider>
      </body>
    </html>
  );
}
