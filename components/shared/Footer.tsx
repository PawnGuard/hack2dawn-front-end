import Link from "next/link";
import { footerConfig } from "@/data/footer";

export function Footer() {
    const { description, navLinks, socialLinks } = footerConfig;

    return (
        <footer className="bg-color-background">
            <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="flex justify-center text-teal-600 dark:text-teal-300">
                    <span className="font-display">Hack2Dawn</span>
                </div>

                <p className="mx-auto mt-6 max-w-md text-center leading-relaxed text-gray-500 dark:text-gray-400">
                    {description}
                </p>

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

                <ul className="mt-12 flex justify-center gap-6 md:gap-8">
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
                                    <Icon className="w-6 h-6" aria-hidden="true" />
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </footer>
    )
}