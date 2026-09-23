"use client";

import { ReactNode } from "react";
import { Authenticated, Unauthenticated, ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";
import { WelcomeView } from "@/components/welcome-view";
import { AppHeader } from "@/components/app-header";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <Authenticated>
        <AppHeader />
        {children}
      </Authenticated>
      <Unauthenticated>
        <WelcomeView />
      </Unauthenticated> 
    </ConvexProviderWithClerk>
  );
}
