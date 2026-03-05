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
    name: "Sponsor 1",
    website: "https://example.com",
    logo: <Image src="/images/sponsor-placeholder-1.webp" alt="Sponsor 1" className="h-10 w-auto object-contain" width={120} height={40} />
  },
  {
    name: "Sponsor 2",
    website: "https://example.com",
    logo: <Image src="/images/sponsor-placeholder-2.webp" alt="Sponsor 2" className="h-10 w-auto object-contain" width={120} height={40} />
  },
  {
    name: "Sponsor 3",
    website: "https://example.com",
    logo: <Image src="/images/sponsor-placeholder-3.webp" alt="Sponsor 3" className="h-10 w-auto object-contain" width={120} height={40} />
  },
  {
    name: "Sponsor 4",
    website: "https://example.com",
    logo: <Image src="/images/sponsor-placeholder-4.webp" alt="Sponsor 4" className="h-10 w-auto object-contain" width={120} height={40} />
  }
];
