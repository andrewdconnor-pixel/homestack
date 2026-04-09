import type { Metadata } from "next";
import "./globals.css";
import { product } from "@new-app-suite/shared";

export const metadata: Metadata = {
  title: `${product.name} | App + Website Starter`,
  description: product.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
