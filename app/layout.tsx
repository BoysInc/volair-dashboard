import type { Metadata } from "next";
import "./globals.css";
import ClientProvider from "@/components/provider/ClientProvider";
import NextTopLoader from "nextjs-toploader";

export const metadata: Metadata = {
  title: "Volair Aviation Dashboard",
  description: "Volair Aviation Dashboard",
  generator: "Volair Aviation Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <NextTopLoader
          color="var(--color-primary)"
          height={3}
          showSpinner={false}
          easing="ease"
          speed={200}
          crawlSpeed={200}
          initialPosition={0.08}
          crawl={true}
          shadow="0 0 10px var(--color-primary), 0 0 5px var(--color-primary)"
          zIndex={1600}
        />
        <ClientProvider>{children}</ClientProvider>
      </body>
    </html>
  );
}
