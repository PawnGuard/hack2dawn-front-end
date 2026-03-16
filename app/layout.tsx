import type { Metadata } from "next";
import { Geist, Geist_Mono, Chakra_Petch, Space_Grotesk, JetBrains_Mono, Press_Start_2P} from "next/font/google";
import "./globals.css";
import localFont from 'next/font/local';
import FuzzyOverlay from "@/components/shared/FuzzyOverlay";

// -----Fuentes Locales----- //
const watchdogs = localFont({
  src: '../public/fonts/watch-dogs.ttf',
  display: 'swap',
  variable: '--font-display',
})

// -----Fuentes de Google----- //
const chakraPetch = Chakra_Petch({
  variable: "--font-heading",
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mono',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-body",
  weight: ['400', '500', '700'],
})

// -----Metadatos de la pàgina----- //
export const metadata: Metadata = {
  title: "Hack2Dawn CTF",
  description: "PawnGuard CTF competition",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${chakraPetch.variable} ${watchdogs.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className={"font-body bg-black text-white"}>
        {children}
        <FuzzyOverlay />
      </body>
    </html>
  );
}
