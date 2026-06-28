"use server";

import { createHash, randomBytes } from "crypto";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { getResend } from "@/lib/resend";
import { passwordResetEmail } from "@/lib/password-reset-email";

type ActionState = { success?: string; error?: string } | undefined;
const forgotSchema = z.object({ email: z.string().trim().email() });
const resetSchema = z.object({
  token: z.string().min(32),
  password: z.string().min(8, "Password must contain at least 8 characters."),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function requestOrigin() {
  const configured = process.env.APP_URL?.replace(/\/$/, "");
  if (configured) return configured;
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host?.includes("localhost") ? "http" : "https");
  if (!host) throw new Error("Application URL is unavailable.");
  return `${protocol}://${host}`;
}

export async function requestPasswordReset(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = forgotSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: "Enter a valid email address." };

  const genericSuccess = "If an account exists for that email, a reset link has been sent.";
  const db = getDb();
  const user = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user) return { success: genericSuccess };

  const recentToken = await db.passwordResetToken.findFirst({
    where: { userId: user.id, createdAt: { gt: new Date(Date.now() - 60_000) } },
  });
  if (recentToken) return { success: genericSuccess };

  const token = randomBytes(32).toString("hex");
  await db.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });
  await db.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + 30 * 60_000),
    },
  });

  try {
    const resetUrl = `${await requestOrigin()}/reset-password?token=${encodeURIComponent(token)}`;
    const from = process.env.RESEND_FROM_EMAIL ?? "Smart Grade Calculator <onboarding@resend.dev>";
    const { error } = await getResend().emails.send({
      from,
      to: user.email,
      subject: "Reset your Smart Grade Calculator password",
      html: passwordResetEmail(user.name, resetUrl),
    });
    if (error) throw new Error(error.message);
  } catch (error) {
    console.error("Password reset email failed:", error);
  }

  return { success: genericSuccess };
}

export async function resetPassword(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = resetSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const db = getDb();
  const resetToken = await db.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(parsed.data.token) },
  });
  if (!resetToken || resetToken.usedAt || resetToken.expiresAt <= new Date()) {
    return { error: "This reset link is invalid or has expired. Request a new link." };
  }

  await db.user.update({
    where: { id: resetToken.userId },
    data: { passwordHash: await bcrypt.hash(parsed.data.password, 12) },
  });
  await db.passwordResetToken.update({
    where: { id: resetToken.id },
    data: { usedAt: new Date() },
  });
  await db.passwordResetToken.deleteMany({
    where: { userId: resetToken.userId, id: { not: resetToken.id }, usedAt: null },
  });

  return { success: "Password updated. You can now sign in with your new password." };
}
