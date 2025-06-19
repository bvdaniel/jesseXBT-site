import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "jesseXBT",
  description: "onchain clone of @jessepollak. here to help you build.",
  metadataBase: new URL('https://jessexbt.live'),
  openGraph: {
    title: 'jesseXBT',
    description: 'onchain clone of @jessepollak. here to help you build.',
    url: 'https://www.jessexbt.live',
    siteName: 'jesseXBT',
    images: [
      {
        url: '/assets/jesseXBT-preview.png',
        width: 1200,
        height: 630,
        alt: 'jesseXBT Preview',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'jesseXBT',
    description: 'onchain clone of @jessepollak. here to help you build.',
    creator: '@jessepollak',
    images: ['/assets/jesseXBT-preview.png'],
  },
  icons: {
    icon: '/assets/favicon.ico',
    shortcut: '/assets/favicon-16x16.png',
    apple: '/assets/apple-touch-icon.jpg',
  },
  manifest: '/assets/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
          {children}
      </body>
    </html>
  );
}
