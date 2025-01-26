import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const next = requestUrl.searchParams.get("next") ?? "/clients";
    
    if (!code) {
      return NextResponse.redirect(new URL("/auth/auth-code-error", request.url));
    }

    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Auth callback error:", error.message);
      return NextResponse.redirect(new URL("/auth/auth-code-error", request.url));
    }

    // Successful verification
    return NextResponse.redirect(new URL(next, request.url));
  } catch (err) {
    console.error("Auth callback error:", err);
    return NextResponse.redirect(new URL("/auth/auth-code-error", request.url));
  }
} 