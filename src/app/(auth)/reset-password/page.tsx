import { ResetPasswordForm } from "@/components/reset-password-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  return <Card className="border-white/7 bg-white/[.025]"><CardHeader><CardTitle className="text-2xl">Choose a new password</CardTitle><CardDescription>Use at least 8 characters. The reset link can only be used once.</CardDescription></CardHeader><CardContent>{token ? <ResetPasswordForm token={token} /> : <p className="rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300">The reset link is missing its secure token. Request a new link.</p>}</CardContent></Card>;
}
