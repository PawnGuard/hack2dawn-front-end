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
  description: string;
  navLinks: NavLink[];
  socialLinks: SocialLink[];
};

export const footerConfig: FooterConfig = {
  description:
    'Listo para hackear? Què esperas?',
  navLinks: [
    { label: 'Home',    href: '/' },
    { label: 'Login',  href: '/login' },
    { label: 'Registro',  href: '/register' },
    { label: 'Credits', href: '/credits' },
    { label: 'Rules', href: '/rules' },
    { label: 'QA & Support',     href: '/faq' },
  ],
  socialLinks: [
    { label: 'GitHub',    href: '#', icon: GithubIcon    },
    { label: 'Discord',    href: '#', icon: DiscordIcon    },
    { label: 'Instagram',    href: '#', icon: InstagramIcon    },
    { label: 'Linkedin',    href: '#', icon: LinkedinIcon    },
  ],
};