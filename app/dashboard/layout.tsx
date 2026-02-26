import { AppNav } from "@/components/app/AppNav";
import { AppFooter } from "@/components/app/AppFooter";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#08090D] flex flex-col">
      <AppNav />
      <main className="flex-1">
        {children}
      </main>
      <AppFooter />
    </div>
  );
}
