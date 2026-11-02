"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";
import { AuthTabs } from "@/components/auth/auth-tabs";
import { SocialButtons } from "@/components/auth/social-buttons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignUpValues = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const router = useRouter();

  const [values, setValues] = useState<SignUpValues>({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof SignUpValues, string>>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    const result = signUpSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof SignUpValues, string>> = {};
      for (const issue of result.error.issues) {
        const path = issue.path[0] as keyof SignUpValues;
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
      const { error } = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      if (error) {
        setGeneralError(error.message || "Could not complete registration. Please try again.");
        setIsPending(false);
        return;
      }

      // Successful registration redirects to /onboarding
      router.push("/onboarding");
      router.refresh();
    } catch {
      setGeneralError("An unexpected error occurred. Please try again.");
      setIsPending(false);
    }
  };

  return (
    <div className="w-full">
      <AuthTabs activeTab="sign-up" />

      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Create your account
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Start your journey to sustainable health.
        </p>
      </div>

      {generalError && (
        <div className="mb-5 rounded-lg bg-red-50 border border-red-200/80 p-3 text-xs text-red-700">
          {generalError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name Field */}
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs font-semibold text-gray-700">
            Full Name
          </Label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <Input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="e.g. Alex Smith"
              value={values.name}
              onChange={(e) => {
                setValues((prev) => ({ ...prev, name: e.target.value }));
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              className="h-11 pl-10 rounded-lg bg-white border-gray-200 text-sm focus-visible:ring-[#185a37]"
            />
          </div>
          {errors.name && (
            <p className="text-xs text-red-600 mt-1">{errors.name}</p>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-semibold text-gray-700">
            Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
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
              className="h-11 pl-10 rounded-lg bg-white border-gray-200 text-sm focus-visible:ring-[#185a37]"
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-600 mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs font-semibold text-gray-700">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={values.password}
              onChange={(e) => {
                setValues((prev) => ({ ...prev, password: e.target.value }));
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              className="h-11 pl-10 pr-10 rounded-lg bg-white border-gray-200 text-sm focus-visible:ring-[#185a37]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-600 mt-1">{errors.password}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isPending}
          className="h-11 w-full rounded-lg bg-[#185a37] hover:bg-[#12452a] text-white font-semibold text-sm shadow-xs transition-all cursor-pointer mt-2"
        >
          {isPending ? "Creating account..." : "Create account"}
        </Button>
      </form>

      {/* Social Logins */}
      <div className="mt-6">
        <SocialButtons hasGoogleAuth={false} />
      </div>

      {/* Switch to Sign In */}
      <div className="mt-8 text-center text-xs text-gray-600">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-semibold text-[#185a37] hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}

