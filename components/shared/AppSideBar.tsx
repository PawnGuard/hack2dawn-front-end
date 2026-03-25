"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { UserIcon } from "@/components/icons/UserIcon";
import { sidebarLinks } from "@/data/sidebar";
import Image from "next/image";

const ICON_CLASS = "h-5 w-5 flex-shrink-0 text-[#940992]";

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0006]">
      <div
        className="relative z-50 flex-shrink-0"
        style={{ borderRight: "1px solid #2a003f" }}
      >
        <Sidebar open={open} setOpen={setOpen}>
          <SidebarBody
            className="flex flex-col justify-between gap-10 bg-[#08000f]"
          >
            {/* ── Logo + Nav ── */}
            <div className="flex flex-col flex-1 overflow-x-hidden overflow-y-auto">
              {open ? <Logo /> : <LogoIcon />}

              {/* Separador simple */}
              <div className="mt-4 mb-2 h-px bg-[#2a003f]" />

              <nav className="mt-2 flex flex-col gap-1">
                {sidebarLinks.map((link) => (
                  <SidebarLink
                    key={link.href}
                    link={{
                      label: link.label,
                      href: link.href,
                      icon: (
                        <i
                          className={`${link.iconClass} ${ICON_CLASS} group-hover/link:text-[#EF01BA] transition-colors duration-150`}
                          aria-hidden="true"
                        />
                      ),
                    }}
                    className="font-mono text-xs tracking-wide text-[#F4EDF2]/60 hover:text-[#EF01BA] transition-colors duration-150 rounded-none px-2 py-2 group/link"
                  />
                ))}
              </nav>
            </div>

            {/* ── Usuario + Logout ── */}
            <div
              className="flex items-center gap-2 pt-3"
              style={{ borderTop: "1px solid #2a003f" }}
            >
              <Image
                src="/images/pwg-logo.webp"
                alt=""
                width={28}
                height={28}
                className="flex-shrink-0 rounded-none"
              />

              {open && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col flex-1 min-w-0"
                  >
                    <span className="text-xs text-[#F4EDF2]/80 truncate font-heading">
                      PawnGuard
                    </span>
                    <span className="text-[10px] text-[#940992] truncate font-heading tracking-wider">
                      pawnguard.ctf
                    </span>
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={handleLogout}
                    aria-label="Cerrar sesión"
                    title="Cerrar sesión"
                    className="flex-shrink-0 text-[#2a003f] hover:text-[#EF01BA] transition-colors duration-150 cursor-pointer"
                  >
                    <i className="hn hn-logout-solid text-base" aria-hidden="true" />
                  </motion.button>
                </>
              )}
            </div>

          </SidebarBody>
        </Sidebar>
      </div>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

const Logo = () => (
  <Link href="/home" className="flex items-center gap-2.5 py-1 group">
    <Image
      src="/images/hack2dawn-logo.webp"
      alt="Hack2Dawn"
      width={28}
      height={28}
      className="flex-shrink-0 rounded-none"
      priority
    />
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="whitespace-pre font-heading text-sm font-bold tracking-[0.15em] uppercase text-[#F4EDF2]/90 group-hover:text-[#EF01BA] transition-colors duration-150"
    >
      Hack2Dawn
    </motion.span>
  </Link>
);

const LogoIcon = () => (
  <Link href="/home" className="flex items-center py-1">
    <Image
      src="/images/hack2dawn-logo.webp"
      alt="Hack2Dawn"
      width={28}
      height={28}
      className="flex-shrink-0 rounded-none"
      priority
    />
  </Link>
);