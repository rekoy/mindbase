"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sprite } from "@/components/sprite";
import { C, ICONS } from "@/components/sprites";

const NAV = [
  { label: "Ringkasan", href: "/dashboard", icon: ICONS.home },
  { label: "Analisis", href: "/dashboard/analisis", icon: ICONS.search },
  { label: "Buat konten", href: "/dashboard/konten/baru", icon: ICONS.plus },
  { label: "Brand Hub", href: "/dashboard/brand", icon: ICONS.star },
  { label: "Jadwal", icon: ICONS.calendar },
  { label: "Hasil", icon: ICONS.chart },
];

export function DashboardNav({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();

  if (compact) {
    return (
      <nav aria-label="Dashboard" className="flex gap-1 overflow-x-auto bg-nocturnal px-2 py-2">
        {NAV.filter((item) => item.href).map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.label} href={item.href!} aria-current={active ? "page" : undefined} className={"shrink-0 px-3 py-1.5 text-sm font-semibold " + (active ? "bg-forsythia text-noir" : "text-mint")}>
              {item.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="mt-10 flex-1" aria-label="Dashboard">
      <ul className="space-y-1">
        {NAV.map((item) => {
          const active = pathname === item.href;
          const content = (
            <>
              <Sprite grid={item.icon} colors={{ k: C.current }} scale={2} />
              {item.label}
            </>
          );
          return (
            <li key={item.label}>
              {item.href ? (
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={"flex items-center gap-3 px-3 py-2.5 font-medium " + (active ? "bg-forsythia text-noir" : "hover:bg-nocturnal hover:text-arctic")}
                >
                  {content}
                </Link>
              ) : (
                <span className="flex items-center gap-3 px-3 py-2.5 font-medium text-mint/50">
                  {content}
                  <span className="ml-auto text-[11px] font-semibold uppercase">segera</span>
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
