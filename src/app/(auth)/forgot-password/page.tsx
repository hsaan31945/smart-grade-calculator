import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  return <Card className="border-white/7 bg-white/[.025]"><CardHeader><CardTitle className="text-2xl">Forgot your password?</CardTitle><CardDescription>Enter your account email. We’ll send a secure link that expires in 30 minutes.</CardDescription></CardHeader><CardContent><ForgotPasswordForm /></CardContent></Card>;
}
