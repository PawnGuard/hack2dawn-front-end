import Link from "next/link";
import { footerConfig } from "@/data/footer";

export function Footer() {
    const { navLinks, socialLinks } = footerConfig;

    return (
        <footer className="bg-[var(--color-background)]">
            <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
                <h1 className="font-display text-4xl md:text-4xl text-sw-text leading-tight
                     drop-shadow-[0_0_30px_#FF1F8C] text-center">
                    Hack2Dawn
                </h1>
                <ul className="mt-12 flex flex-wrap justify-center gap-6 md:gap-8 lg:gap-12">
                    {navLinks.map((link) => (
                        <li key={link.label}>
                            <Link
                                className="text-gray-700 transition hover:text-gray-700/75 dark:text-white dark:hover:text-white/75"
                                href={link.href}
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                <ul className="mt-12 flex justify-center gap-6 md:gap-12">
                    {socialLinks.map((social) => {
                        const Icon = social.icon;
                        return (
                            <li key={social.label}>
                                <a
                                    href={social.href}
                                    rel="noreferrer"
                                    target="_blank"
                                    className="text-gray-700 transition hover:text-gray-700/75 dark:text-white dark:hover:text-white/75"
                                >
                                    <span className="sr-only">{social.label}</span>
                                    <Icon className="w-8 h-8" aria-hidden="true" />
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </footer>
    )
}