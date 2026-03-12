export type SocialPlatform = "linkedin" | "github" | "web-page";

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
}

export interface Contributor {
  id: number;
  name: string;
  role: string;
  contribution: string;
  avatar: string;
  profileUrl: string;
  socials: SocialLink[];
}