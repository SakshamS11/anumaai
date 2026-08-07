import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { signOut } from "@/app/(auth)/actions";
import { AppShell } from "@/components/shell/app-shell";
import { getAuthenticatedUser } from "@/lib/auth/session";

export default async function ApplicationLayout({ children }: Readonly<{ children: ReactNode }>) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <AppShell signOut={signOut} userEmail={user.email}>
      {children}
    </AppShell>
  );
}
