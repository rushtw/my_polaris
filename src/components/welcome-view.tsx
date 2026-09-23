"use client"

import {
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs";

import { Button } from "@/components/ui/button";

export function WelcomeView() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-bold">Welcome to My_Polaris</h1>
      <div className="flex gap-3">
        <SignInButton>
          <Button variant="outline">Sign In</Button>
        </SignInButton>
        <SignUpButton>
          <Button>Sign Up</Button>
        </SignUpButton>
      </div>
    </div>
  );
}