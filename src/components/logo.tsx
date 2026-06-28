import { GraduationCap } from "lucide-react";
import Link from "next/link";
export function Logo({ compact=false }: { compact?: boolean }) { return <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight"><span className="grid size-9 place-items-center rounded-xl bg-cyan-400 text-slate-950 shadow-[0_0_30px_rgba(34,211,238,.2)]"><GraduationCap className="size-5" /></span>{!compact && <span>Smart Grade <span className="text-cyan-300">Calculator</span></span>}</Link> }
