"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { UserIcon } from "@/components/icons/UserIcon";
import { sidebarLinks } from "@/data/sidebar"; // ← única fuente de verdad

const ICON_CLASS = "h-5 w-5 flex-shrink-0 text-neutral-400";

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-950">
      <div className="relative z-50 flex-shrink-0">
        <Sidebar open={open} setOpen={setOpen}>
          <SidebarBody className="flex flex-col justify-between gap-10">
            <div className="flex flex-col flex-1 overflow-x-hidden overflow-y-auto">
              {open ? <Logo /> : <LogoIcon />}

              <nav className="mt-8 flex flex-col gap-2">
                {sidebarLinks.map((link) => (
                  <SidebarLink
                    key={link.href}
                    link={{
                      label: link.label,
                      href: link.href,
                      // Aquí instancias el icono con su className
                      icon: <link.icon className={ICON_CLASS} />,
                    }}
                  />
                ))}
              </nav>
            </div>

            {/* User avatar al fondo */}
            <div className="flex items-center gap-2">
              <UserIcon className="h-8 w-8 rounded-full bg-neutral-700" />
              {open && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-neutral-300 whitespace-pre"
                >
                  Hack2Dawn
                </motion.span>
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
  <Link
    href="/home"
    className="flex items-center gap-2 py-1 text-sm font-medium text-white"
  >
    <div className="h-5 w-6 flex-shrink-0 rounded-md bg-white" />
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="whitespace-pre font-semibold text-white"
    >
      Hack2Dawn
    </motion.span>
  </Link>
);

const LogoIcon = () => (
  <Link href="/home" className="flex items-center py-1">
    <div className="h-5 w-6 flex-shrink-0 rounded-md bg-white" />
  </Link>
);