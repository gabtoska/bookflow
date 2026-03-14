import { Sidebar } from "@/components/layout/sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";

interface DashboardShellProps {
  children: React.ReactNode;
  userName: string;
  businessName: string;
}

export function DashboardShell({ children, userName, businessName }: DashboardShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      <Sidebar businessName={businessName} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader userName={userName} businessName={businessName} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
