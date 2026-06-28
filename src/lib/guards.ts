import { auth } from "@/auth";
import { redirect } from "next/navigation";
export async function requireStudent() { const session = await auth(); if (!session) redirect("/login"); if (session.user.role !== "STUDENT") redirect("/admin"); return session; }
export async function requireAdmin() { const session = await auth(); if (!session) redirect("/login"); if (session.user.role !== "ADMIN") redirect("/dashboard"); return session; }
