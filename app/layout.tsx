import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";
import "./globals.css";

export const dynamic = "force-dynamic";

const url = siteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title: {
    default: "B&B Trading Academy",
    template: "%s · B&B Trading Academy",
  },
  description: "Formación de trading por niveles, exámenes, membresía y mesa en vivo.",
  alternates: { canonical: url },
  openGraph: {
    title: "B&B Trading Academy",
    description: "Formación por niveles, exámenes y trading en vivo.",
    url,
    siteName: "B&B Trading Academy",
    locale: "es_DO",
    type: "website",
    images: [{ url: "/brand/logo.png", width: 512, height: 512, alt: "B&B Trading Academy" }],
  },
  icons: {
    icon: "/brand/logo.png",
    apple: "/brand/logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Manrope:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
