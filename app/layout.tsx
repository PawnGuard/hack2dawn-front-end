import type { Metadata } from "next";
import { Geist, Geist_Mono, Chakra_Petch, Space_Grotesk, JetBrains_Mono, Press_Start_2P} from "next/font/google";
import "./globals.css";
import localFont from 'next/font/local';
import FuzzyOverlay from "@/components/shared/FuzzyOverlay";
import { Analytics } from "@vercel/analytics/next"; 
import { CustomCursor } from "@/components/ui/CustomCursor";
import { getSessionUser } from "@/lib/session";
import { UserProvider } from "@/context/UserContext";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  const user = await getSessionUser()

  return (
    <html lang="es" className={`${chakraPetch.variable} ${watchdogs.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className={"font-body bg-black text-white"}>
        <UserProvider initialUser={user}>
          <FuzzyOverlay />
          {children}
          <Analytics />
          <CustomCursor />
        </UserProvider>
      </body>
    </html>
  );
}
