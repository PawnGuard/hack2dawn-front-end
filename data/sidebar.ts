import "@hackernoon/pixel-icon-library/fonts/iconfont.css";
import type { ComponentType } from "react";

export type SidebarLinkData = {
  label: string;
  href: string;
  iconClass: string;
};

export const sidebarLinks: SidebarLinkData[] = [
  {
    label: "Home",
    href: "/home",
    iconClass: "hn hn-home-solid",
  },
  {
    label: "Challenges",
    href: "/challenges",
    iconClass: "hn hn-flag-solid",
  },
  {
    label: "Scoreboard",
    href: "/home#scoreboard",
    iconClass: "hn hn-trophy-solid",
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    iconClass: "hn hn-user-solid",
  },
  {
    label: "Team",
    href: "/dashboard/team",
    iconClass: "hn hn-users-solid",
  },
];