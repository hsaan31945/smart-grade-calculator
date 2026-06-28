import { DashboardShell } from "@/components/dashboard-shell"; import { requireAdmin } from "@/lib/guards";
export default async function AdminLayout({children}:{children:React.ReactNode}){const s=await requireAdmin();return <DashboardShell role="ADMIN" name={s.user.name??"Admin"}>{children}</DashboardShell>}
