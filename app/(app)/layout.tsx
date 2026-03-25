import { AppSidebar } from "@/components/shared/AppSideBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppSidebar>
      {children}
    </AppSidebar>
  )
}