import { AppSidebar } from "@/components/shared/AppSideBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar>
        <main className="flex-1 pt-16 md:pt-0">
          {children}
        </main>
      </AppSidebar>
    </div>
  )
}