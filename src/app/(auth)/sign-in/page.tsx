"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";
import { AuthTabs } from "@/components/auth/auth-tabs";
import { SocialButtons } from "@/components/auth/social-buttons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

const signInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type SignInValues = z.infer<typeof signInSchema>;

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [values, setValues] = useState<SignInValues>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof SignInValues, string>>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    const result = signInSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof SignInValues, string>> = {};
      for (const issue of result.error.issues) {
        const path = issue.path[0] as keyof SignInValues;
        if (!fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsPending(true);

    try {
      const { error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
        rememberMe: keepSignedIn,
      });

      if (error) {
        // Generic sign-in error to avoid user enumeration / revealing account existence
        setGeneralError("Invalid email or password. Please check your credentials.");
        setIsPending(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setGeneralError("An unexpected error occurred. Please try again.");
      setIsPending(false);
    }
  };

  return (
    <div className="w-full">
      <AuthTabs activeTab="sign-in" />

      <div className="rounded-2xl bg-card border border-border shadow-sm p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Welcome back
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to pick up today&apos;s plan.
          </p>
        </div>

        {generalError && (
          <div className="mb-5 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold text-foreground">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={values.email}
                onChange={(e) => {
                  setValues((prev) => ({ ...prev, email: e.target.value }));
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                className="h-11 pl-10 rounded-lg bg-background border-input text-foreground text-sm focus-visible:ring-ring"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-semibold text-foreground">
                Password
              </Label>
              <button
                type="button"
                onClick={() => alert("Password reset link will be sent to your email.")}
                className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline cursor-pointer"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={values.password}
                onChange={(e) => {
                  setValues((prev) => ({ ...prev, password: e.target.value }));
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                className="h-11 pl-10 pr-10 rounded-lg bg-background border-input text-foreground text-sm focus-visible:ring-ring"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive mt-1">{errors.password}</p>
            )}
          </div>

          {/* Keep Me Signed In Checkbox */}
          <div className="flex items-center space-x-2 pt-1 pb-1">
            <Checkbox
              id="remember"
              checked={keepSignedIn}
              onCheckedChange={(checked) => setKeepSignedIn(!!checked)}
            />
            <Label
              htmlFor="remember"
              className="text-xs text-muted-foreground font-normal cursor-pointer select-none"
            >
              Keep me signed in
            </Label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isPending}
            className="h-11 w-full rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-xs transition-all cursor-pointer"
          >
            {isPending ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        {/* Social Logins */}
        <div className="mt-6">
          <SocialButtons hasGoogleAuth={false} />
        </div>
      </div>

      {/* Switch to Sign Up */}
      <div className="mt-6 text-center text-xs text-muted-foreground">
        New to VitaPath?{" "}
        <Link href="/sign-up" className="font-semibold text-foreground underline underline-offset-4 hover:text-muted-foreground">
          Create an account
        </Link>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading sign in...</div>}>
      <SignInForm />
    </Suspense>
  );
}
