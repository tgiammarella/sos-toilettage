import { AdminSidebar } from "@/components/dashboard/AdminSidebar";

interface AdminShellProps {
  locale: string;
  children: React.ReactNode;
}

export async function AdminShell({ locale, children }: AdminShellProps) {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar locale={locale} />
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
