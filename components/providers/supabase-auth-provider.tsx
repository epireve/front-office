"use client";

import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { User } from "@supabase/supabase-js";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/ui/loading";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

// Routes that require authentication
const PROTECTED_ROUTES = ["/clients", "/proposals", "/emails"];
// Routes that are only accessible when not authenticated
const AUTH_ROUTES = ["/auth/sign-in", "/auth/sign-up"];
// Routes that are always accessible
const PUBLIC_ROUTES = ["/", "/auth/callback"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  // Memoize the Supabase client
  const supabase = useMemo(() => createClient(), []);

  // Handle routing based on auth state
  const handleAuthRouting = async (currentUser: User | null) => {
    // Skip routing for public routes
    if (PUBLIC_ROUTES.includes(pathname || "")) {
      return;
    }

    const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
      pathname?.startsWith(route),
    );
    const isAuthRoute = AUTH_ROUTES.some((route) =>
      pathname?.startsWith(route),
    );

    if (currentUser) {
      // If user is logged in and tries to access auth routes, redirect to clients
      if (isAuthRoute) {
        await router.replace("/clients");
      }
    } else {
      // If user is not logged in and tries to access protected routes, redirect to sign in
      if (isProtectedRoute) {
        await router.replace("/auth/sign-in");
      }
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get the initial session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        const currentUser = session?.user ?? null;
        setUser(currentUser);
        await handleAuthRouting(currentUser);
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      switch (event) {
        case "SIGNED_IN":
          // Only show welcome toast if user is actually signing in (not just refreshing session)
          if (pathname?.startsWith("/auth/")) {
            toast({
              title: "Welcome back!",
              description: `Signed in as ${session?.user?.email}`,
            });
            await router.replace("/clients");
          }
          break;

        case "SIGNED_OUT":
          toast({
            title: "Signed out",
            description: "You have been signed out successfully.",
          });
          await router.replace("/auth/sign-in");
          break;

        case "USER_UPDATED":
          toast({
            title: "Profile updated",
            description: "Your profile has been updated successfully.",
          });
          break;
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [pathname, router, supabase, toast]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        await router.replace("/clients");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      await router.replace("/auth/sign-in");
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while initializing
  if (!initialized || loading) {
    return <LoadingSpinner />;
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
