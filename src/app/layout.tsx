import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Digitaal Nalatenschapsdossier | Veilig digitaal erfgoed beheer",
  description:
    "Een beveiligd digitaal nalatenschapsdossier voor digitale bezittingen. Beheer uw digitale erfenis veilig onder notarieel toezicht.",
  keywords: ["nalatenschap", "digitale bezittingen", "notaris", "erfgenamen", "testament"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
