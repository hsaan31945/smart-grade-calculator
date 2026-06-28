import { DashboardShell } from "@/components/dashboard-shell"; import { requireStudent } from "@/lib/guards";
export default async function StudentLayout({children}:{children:React.ReactNode}){const s=await requireStudent();return <DashboardShell role="STUDENT" name={s.user.name??"Student"}>{children}</DashboardShell>}
