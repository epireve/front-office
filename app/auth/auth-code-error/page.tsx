"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">
            Verification Failed
          </h1>
          <p className="text-gray-600 mt-2">
            We couldn't verify your email. This might be because:
          </p>
          <ul className="mt-4 text-sm text-gray-600 list-disc list-inside space-y-2">
            <li>The verification link has expired</li>
            <li>The verification link has already been used</li>
            <li>The verification link is invalid</li>
          </ul>
        </div>
        <div className="flex justify-center">
          <Button asChild>
            <Link href="/auth/sign-up">Try signing up again</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
