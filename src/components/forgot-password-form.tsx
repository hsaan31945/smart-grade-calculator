"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/app/password-actions";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, undefined);
  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="email">Account email</Label>
        <Input id="email" name="email" type="email" className="mt-2" placeholder="you@university.edu" required />
      </div>
      {state?.error && <p role="alert" className="rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300">{state.error}</p>}
      {state?.success && <p role="status" className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-300">{state.success}</p>}
      <Button className="w-full" disabled={pending}>{pending ? "Sending…" : "Send reset link"}</Button>
      <p className="text-center text-sm text-slate-500"><Link href="/login" className="text-cyan-300 hover:underline">Back to login</Link></p>
    </form>
  );
}
