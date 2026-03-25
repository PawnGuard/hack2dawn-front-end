// data/sidebar.ts
import {
  IconHome,
  IconFlag,
  IconTrophy,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";
import type { ComponentType } from "react";

export type SidebarLinkData = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

export const sidebarLinks: SidebarLinkData[] = [
  {
    label: "Home",
    href: "/home",
    icon: IconHome,
  },
  {
    label: "Challenges",
    href: "/challenges",
    icon: IconFlag,
  },
  {
    label: "Scoreboard",
    href: "/scoreboard",
    icon: IconTrophy,
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: IconUser,
  },
  {
    label: "Team",
    href: "/dashboard/team",
    icon: IconUsers,
  },
];