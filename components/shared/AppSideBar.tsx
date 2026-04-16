"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar, SidebarLink } from "@/components/ui/sidebar";
import { sidebarLinks } from "@/data/sidebar";
import Image from "next/image";

const ICON_CLASS = "h-5 w-5 flex-shrink-0 text-[#940992]";

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // ── Mobile state ──────────────────────────────────────────────
  const [mobileOpen, setMobileOpen] = useState(false);

  // Cierra el drawer al navegar a otra ruta en móvil
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Bloquea el scroll del body cuando el drawer está abierto
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);
  // ─────────────────────────────────────────────────────────────

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const renderSidebarContent = (mobile: boolean) => (
    <Sidebar open={mobile ? true : open} setOpen={setOpen}>
      <motion.div
        className="flex h-full flex-col justify-between gap-10 bg-[#08000f] px-4 py-4"
        animate={{
          width: mobile ? "260px" : (open ? "180px" : "60px"),
        }}
        onMouseEnter={mobile ? undefined : () => setOpen(true)}
        onMouseLeave={mobile ? undefined : () => setOpen(false)}
      >
        {/* ── Logo + Nav ── */}
        <div className="flex flex-col flex-1 overflow-x-hidden overflow-y-auto">
          {mobile || open ? <Logo /> : <LogoIcon />}
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
          {(mobile || open) && (
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
      </motion.div>
    </Sidebar>
  );

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[#0a0006]">

      {/* ── BOTÓN HAMBURGUESA — solo visible en móvil ─────────── */}
      <button
        onClick={() => setMobileOpen((prev) => !prev)}
        aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={mobileOpen}
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 flex flex-col justify-center items-center gap-[5px]"
        style={{
          background: "rgba(10,0,6,0.90)",
          border: "1px solid rgba(239,1,186,0.35)",
          backdropFilter: "blur(8px)",
        }}
      >
        <span
          className="block w-5 h-px transition-all duration-200 origin-center"
          style={{
            background: "#EF01BA",
            transform: mobileOpen
              ? "translateY(6px) rotate(45deg)"
              : "none",
          }}
        />
        <span
          className="block w-5 h-px transition-all duration-200"
          style={{
            background: "#EF01BA",
            opacity: mobileOpen ? 0 : 1,
          }}
        />
        <span
          className="block w-5 h-px transition-all duration-200 origin-center"
          style={{
            background: "#EF01BA",
            transform: mobileOpen
              ? "translateY(-6px) rotate(-45deg)"
              : "none",
          }}
        />
      </button>

      {/* ── OVERLAY OSCURO — toca fuera para cerrar ───────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMobileOpen(false)}
            className="md:hidden fixed inset-0 z-30"
            style={{
              background: "rgba(10,0,6,0.75)",
              backdropFilter: "blur(3px)",
            }}
          />
        )}
      </AnimatePresence>

      {/* ── SIDEBAR DESKTOP — comportamiento original ─────────── */}
      <div
        className="relative z-50 flex-shrink-0 hidden md:block"
        style={{ borderRight: "1px solid #2a003f" }}
      >
        {renderSidebarContent(false)}
      </div>

      {/* ── SIDEBAR MÓVIL — drawer deslizable ─────────────────── */}
      <motion.div
        className="md:hidden fixed top-0 left-0 h-[100dvh] z-40"
        style={{ borderRight: "1px solid #2a003f" }}
        initial={false}
        animate={{
          x: mobileOpen ? 0 : "-100%",
        }}
        transition={{ type: "tween", duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      >
        {renderSidebarContent(true)}
      </motion.div>

      {/* ── CONTENIDO PRINCIPAL ───────────────────────────────── */}
      <main className="flex-1 min-w-0 overflow-y-auto pt-14 md:pt-0">
        {/*
          pt-14 en móvil → deja espacio libre para el botón hamburguesa.
          md:pt-0 → en desktop no hay botón, el padding desaparece.
        */}
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