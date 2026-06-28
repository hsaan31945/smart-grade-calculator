"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { loginAction, registerAction } from "@/app/actions";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type Option = { id: string; name: string };

export function AuthForm({
  mode,
  programs = [],
  semesters = [],
  sections = [],
}: {
  mode: "login" | "register";
  programs?: Option[];
  semesters?: Option[];
  sections?: Option[];
}) {
  const [state, action, pending] = useActionState(
    mode === "login" ? loginAction : registerAction,
    undefined,
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={action} className="space-y-4">
      {mode === "register" && (
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" className="mt-2" placeholder="Your full name" required />
        </div>
      )}

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          className="mt-2"
          placeholder="you@university.edu"
          required
        />
      </div>

      <div>
        <div className="flex items-center justify-between"><Label htmlFor="password">Password</Label>{mode === "login" && <Link href="/forgot-password" className="text-xs text-cyan-300 hover:underline">Forgot password?</Link>}</div>
        <div className="relative mt-2">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            className="pr-11"
            placeholder="Minimum 8 characters"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-md text-slate-500 transition hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      {mode === "register" && (
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["programId", "Program", programs],
            ["semesterId", "Semester", semesters],
            ["sectionId", "Section", sections],
          ].map(([name, label, options]) => (
            <div key={name as string}>
              <Label>{label as string}</Label>
              <select
                name={name as string}
                required
                className="mt-2 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              >
                <option value="">Select</option>
                {(options as Option[]).map((option) => (
                  <option className="bg-slate-900" key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {state?.error && (
        <p role="alert" className="rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300">
          {state.error}
        </p>
      )}

      <Button className="w-full" disabled={pending}>
        {pending ? "Please wait…" : mode === "login" ? "Sign in" : "Create student account"}
      </Button>
      <p className="text-center text-sm text-slate-500">
        {mode === "login" ? "New to Smart Grade? " : "Already have an account? "}
        <Link href={mode === "login" ? "/register" : "/login"} className="text-cyan-300 hover:underline">
          {mode === "login" ? "Register" : "Login"}
        </Link>
      </p>
    </form>
  );
}
