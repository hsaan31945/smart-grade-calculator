"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { resetPassword } from "@/app/password-actions";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

function PasswordInput({ id, name, label }: { id: string; name: string; label: string }) {
  const [visible, setVisible] = useState(false);
  return <div><Label htmlFor={id}>{label}</Label><div className="relative mt-2"><Input id={id} name={name} type={visible ? "text" : "password"} className="pr-11" minLength={8} required /><button type="button" onClick={() => setVisible((value) => !value)} className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-md text-slate-500 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`} aria-pressed={visible}>{visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div></div>;
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPassword, undefined);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <PasswordInput id="password" name="password" label="New password" />
      <PasswordInput id="confirmPassword" name="confirmPassword" label="Confirm password" />
      {state?.error && <p role="alert" className="rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300">{state.error}</p>}
      {state?.success && <p role="status" className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-300">{state.success}</p>}
      {!state?.success && <Button className="w-full" disabled={pending || !token}>{pending ? "Updating…" : "Update password"}</Button>}
      <p className="text-center text-sm text-slate-500"><Link href="/login" className="text-cyan-300 hover:underline">Return to login</Link></p>
    </form>
  );
}
