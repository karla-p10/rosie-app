"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {
    try {
      setSigningIn(true);
      setError(null);
      await signInWithGoogle();
    } catch {
      setError("Something went wrong. Please try again.");
      setSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center animate-pulse">
            <span className="text-white text-lg font-bold font-display">R</span>
          </div>
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo + branding */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <div className="relative w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/30">
              <span className="text-white text-3xl font-display font-bold leading-none">R</span>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full border-2 border-background" />
            </div>
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Rosie</h1>
            <p className="text-muted-foreground text-sm mt-1">Your Family Command Center</p>
          </div>
        </div>

        {/* Sign-in card */}
        <div className="bg-card rounded-3xl border border-border p-8 space-y-6 shadow-xl shadow-black/5">
          <div className="space-y-1.5">
            <h2 className="font-display text-xl font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Sign in to access your tasks, calendar, and family command center.
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm rounded-xl px-4 py-3 border border-destructive/20">
              {error}
            </div>
          )}

          {/* Google sign-in button */}
          <Button
            onClick={handleGoogleSignIn}
            disabled={signingIn}
            className="w-full h-12 rounded-xl bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm font-medium gap-3 text-sm"
            variant="outline"
          >
            {signingIn ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-gray-400 border-t-transparent animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                {/* Google logo SVG */}
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground leading-relaxed">
            By signing in, you agree to our terms of service and privacy policy.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground/60">
          <Sparkles className="w-3 h-3" />
          <span>Made with love for busy moms</span>
        </div>
      </div>
    </div>
  );
}
