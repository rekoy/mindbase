import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { Sprite } from "@/components/sprite";
import { C, CLOUD, MASCOT, MASCOT_COLORS, STAR } from "@/components/sprites";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Masuk — mindbase" };

export default function LoginPage() {
  return (
    <main className="grid flex-1 lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-noir p-12 pb-28 text-arctic lg:flex lg:flex-col lg:justify-between">
        <Link href="/" aria-label="Kembali ke beranda">
          <Logo light />
        </Link>
        <span className="anim-twinkle absolute top-[20%] left-[70%]">
          <Sprite grid={STAR} colors={{ y: C.forsythia }} scale={3} />
        </span>
        <span className="anim-twinkle absolute top-[52%] left-[12%]" style={{ animationDelay: "1s" }}>
          <Sprite grid={STAR} colors={{ y: C.forsythia }} scale={3} />
        </span>
        <span className="absolute top-[30%] left-[8%] opacity-80">
          <Sprite grid={CLOUD} colors={{ w: C.arctic, m: C.mint }} scale={4} />
        </span>

        <div className="relative">
          <Sprite grid={MASCOT} colors={MASCOT_COLORS} scale={8} className="anim-bob" title="Mindy, maskot mindbase" />
          <p className="mt-10 max-w-md text-3xl leading-snug font-bold">Lanjutkan siklus kontenmu dari checkpoint terakhir.</p>
          <p className="mt-4 max-w-md text-mint">Rekomendasi, naskah, dan jadwal minggu ini sudah menunggu di dashboard.</p>
        </div>

        <div aria-hidden className="absolute inset-x-0 bottom-0">
          <div className="h-2 bg-[repeating-linear-gradient(90deg,var(--color-forsythia)_0_16px,var(--color-saffron)_16px_32px)]" />
          <div className="h-10 bg-[repeating-linear-gradient(90deg,var(--color-nocturnal)_0_32px,var(--color-noir)_32px_64px)]" />
        </div>
      </section>

      <section className="flex items-center justify-center bg-mint px-4 py-16">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-10 inline-block lg:hidden" aria-label="Kembali ke beranda">
            <Logo />
          </Link>
          <div className="px-box m-1 bg-arctic p-8">
            <h1 className="text-2xl font-bold">Masuk ke mindbase</h1>
            <p className="mt-2 text-nocturnal">Pakai email kerja kamu.</p>
            <LoginForm />
          </div>
          <p className="mt-8 text-center text-sm text-nocturnal">
            Belum punya akun? Masuk dengan email apa pun untuk mencoba mode demo.
          </p>
        </div>
      </section>
    </main>
  );
}
