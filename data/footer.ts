import type { ComponentType, SVGProps } from 'react';
import {
  GithubIcon,
  DiscordIcon,
  InstagramIcon,
  LinkedinIcon,
} from '@/components/icons';

export type NavLink = {
  label: string;
  href: string;
};

export type SocialLink = {
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export type FooterConfig = {
  navLinks: NavLink[];
  socialLinks: SocialLink[];
};

export const footerConfig: FooterConfig = {
  navLinks: [
    { label: 'Home',         href: '/' },
    { label: 'Login',        href: '/login' },
    { label: 'Registro',     href: '/register' },
    { label: 'Sponsors',     href: '/#sponsors' },
    { label: 'About',        href: '/#about' },
    { label: 'Schedule',     href: '/#about' },
    { label: 'QA & Support', href: '/#faq' },
    { label: 'Credits',      href: '/credits' }
  ],
  socialLinks: [
    { label: 'GitHub',    href: 'https://github.com/PawnGuard', icon: GithubIcon    },
    { label: 'Discord',    href: 'https://discord.com/invite/EsnyzAuU9w', icon: DiscordIcon    },
    { label: 'Instagram',    href: 'https://www.instagram.com/pawnguard/', icon: InstagramIcon    },
    { label: 'Linkedin',    href: 'https://www.linkedin.com/company/pawnguard', icon: LinkedinIcon    },
  ],
};