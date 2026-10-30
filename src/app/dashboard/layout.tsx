import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { logout } from "@/app/actions/auth";
import { resetProject } from "@/app/actions/project";
import { Logo } from "@/components/logo";
import { Sprite } from "@/components/sprite";
import { C, ICONS } from "@/components/sprites";
import { brandOf } from "@/lib/brand";
import { fmtNum } from "@/lib/mock";
import { PLATFORMS } from "@/lib/platforms";
import { requireProject } from "@/lib/session";
import { DashboardNav } from "./nav";

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <div className="flex flex-1 bg-mint">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-noir p-6 text-mint lg:flex">
        <Link href="/" aria-label="Beranda mindbase">
          <Logo light />
        </Link>
        <Suspense fallback={<div className="mt-10 h-28 bg-nocturnal" aria-hidden />}>
          <ProjectBox />
        </Suspense>
        <DashboardNav />
        <div className="border-t-4 border-nocturnal pt-6">
          <Suspense fallback={<p className="h-5 w-40 bg-nocturnal" aria-hidden />}>
            <SidebarUser />
          </Suspense>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="lg:hidden">
          <div className="flex items-center justify-between bg-noir px-4 py-4">
            <Logo light />
            <form action={logout}>
              <button type="submit" className="text-sm font-medium text-mint hover:text-forsythia">
                Keluar
              </button>
            </form>
          </div>
          <DashboardNav compact />
        </header>
        <Suspense fallback={<div className="mx-auto mt-10 h-96 w-full max-w-7xl px-8" aria-hidden />}>
          <ProjectGate>{children}</ProjectGate>
        </Suspense>
      </div>
    </div>
  );
}

// Every dashboard page needs a project with at least one connected account.
async function ProjectGate({ children }: { children: React.ReactNode }) {
  await requireProject();
  return children;
}

async function ProjectBox() {
  const { project } = await requireProject();
  const { logo } = brandOf(project);
  return (
    <Link href="/dashboard/brand" className="mt-10 block bg-nocturnal p-4 hover:outline-4 hover:outline-forsythia" aria-label={`Brand Hub ${project.name}`}>
      <div className="flex items-center gap-3">
        {logo && <Image src={`/api/assets/${logo}`} alt="" width={36} height={36} unoptimized className="h-9 w-9 shrink-0 bg-arctic object-contain p-0.5" />}
        <div className="min-w-0">
          <p className="text-xs text-mint">Project</p>
          <p className="truncate font-bold text-arctic">{project.name}</p>
        </div>
      </div>
      <ul className="mt-3 space-y-1.5">
        {project.accounts.map((a) => (
          <li key={a.platform} className="flex items-center gap-2 text-xs">
            <Sprite grid={ICONS[a.platform]} colors={{ k: C.forsythia }} scale={1.5} />
            <span className="truncate">@{a.handle}</span>
            <span className="ml-auto shrink-0 text-mint/70" title={`${PLATFORMS[a.platform].name} follower`}>
              {fmtNum(a.followers)}
            </span>
          </li>
        ))}
      </ul>
    </Link>
  );
}

async function SidebarUser() {
  const { email } = await requireProject();
  return (
    <>
      <p className="truncate text-sm text-arctic" title={email}>
        {email}
      </p>
      <div className="mt-3 flex items-center justify-between">
        <form action={logout}>
          <button type="submit" className="flex items-center gap-3 text-sm font-medium hover:text-forsythia">
            <Sprite grid={ICONS.door} colors={{ k: C.current }} scale={2} />
            Keluar
          </button>
        </form>
        <form action={resetProject}>
          <button type="submit" className="text-xs text-mint/70 underline underline-offset-4 hover:text-forsythia" title="Hapus project demo dan ulangi onboarding">
            Reset demo
          </button>
        </form>
      </div>
    </>
  );
}
