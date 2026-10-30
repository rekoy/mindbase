import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { logout } from "@/app/actions/auth";
import { Logo } from "@/components/logo";
import { requireSessionEmail } from "@/lib/session";
import { getUserData } from "@/lib/store";
import { Wizard } from "./wizard";

export const metadata: Metadata = { title: "Buat project — mindbase" };

export default function OnboardingPage() {
  return (
    <div className="flex flex-1 flex-col bg-mint">
      <header className="bg-noir">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Logo light />
          <form action={logout}>
            <button type="submit" className="text-sm font-medium text-mint hover:text-forsythia">
              Keluar
            </button>
          </form>
        </div>
      </header>
      <Suspense fallback={<div className="mx-auto mt-16 h-96 w-full max-w-3xl bg-arctic/60" aria-hidden />}>
        <OnboardingGate />
      </Suspense>
    </div>
  );
}

async function OnboardingGate() {
  const email = await requireSessionEmail();
  const { project } = await getUserData(email);
  if (project) redirect("/dashboard");
  return <Wizard email={email} />;
}
