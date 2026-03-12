import type { ReactNode } from "react";
import Image from "next/image";
import { HackTheBoxIcon } from "../components/icons/HackTheBox";

export type Sponsor = {
  name: string;
  website?: string;
  logo: ReactNode;
};

export const SPONSORS: Sponsor[] = [
  {
    name: "Tec de Monterrey",
    website: "https://tec.mx/es",
    logo: <Image src="/images/tec-logo.webp" alt="Tec de Monterrey" className="h-20 w-auto object-contain" width={240} height={80} />
  },
  {
    name: "PawnGuard",
    website: "https://github.com/PawnGuard",
    logo: <Image src="/images/pwg-logo.webp" alt="PawnGuard" className="h-20 w-auto object-contain" width={240} height={80} />
  },
  {
    name: "Sponsor 3",
    website: "https://example.com",
    logo: <Image src="/images/sponsor-placeholder-3.webp" alt="Sponsor 3" className="h-20 w-auto object-contain" width={240} height={80} />
  },
  {
    name: "Sponsor 4",
    website: "https://example.com",
    logo: <Image src="/images/sponsor-placeholder-4.webp" alt="Sponsor 4" className="h-20 w-auto object-contain" width={240} height={80} />
  }
];
