import type { Metadata } from "next";
import "./globals.css";
import ClientProvider from "@/components/provider/ClientProvider";

export const metadata: Metadata = {
  title: "Volair Aviation",
  description: "Volair Aviation",
  generator: "Volair Aviation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ClientProvider>{children}</ClientProvider>
      </body>
    </html>
  );
}
