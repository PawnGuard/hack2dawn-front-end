import type { ReactNode } from "react";
import { HackTheBoxIcon } from "../components/icons/HackTheBox";

export type Sponsor = {
  name: string;
  website?: string;
  logo: ReactNode;
};

export const SPONSORS: Sponsor[] = [
  {
    name: "HackTheBox",
    website: "https://example.com",
    logo: <img src="/images/HacktheBox Logo.webp" alt="HackTheBox" className="h-8" />
  },
  {
    name: "Ooooo",
    website: "https://example.com",
    logo: <img src="/images/HacktheBox Logo.webp" alt="HackTheBox" className="h-8" />
  },
  {
    name: "Ooooo",
    website: "https://example.com",
    logo: <img src="/images/HacktheBox Logo.webp" alt="HackTheBox" className="h-8" />
  },
];
