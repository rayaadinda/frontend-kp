import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";
import Image from "next/image";
export default function LoginPage() {
  return (
    <div className="min-h-screen w-screen bg-white font-[var(--font-manrope)]">
      <div className="flex min-h-screen w-full flex-col md:grid md:grid-cols-[1.1fr_1fr]">
        <aside className="relative h-[35vh] min-h-[200px] overflow-hidden rounded-b-3xl md:h-auto md:min-h-screen md:rounded-none">
          <Image
            src="/bg.png"
            alt=""
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0" aria-hidden />
          <div className="relative z-10 flex h-full flex-col justify-end p-6 text-white md:justify-between md:p-10">
            <div className="hidden items-center justify-between text-sm text-white/80 md:flex"></div>
            <div className="space-y-2 md:space-y-4">
              <h1 className="text-2xl font-medium leading-tight sm:text-3xl md:text-5xl">
                Kelola Inventaris
                <br />
                Tanpa Hambatan.
              </h1>
              <p className="max-w-sm text-xs leading-relaxed text-white/75 sm:text-sm md:text-base">
                KJI membantu tim produksi memantau stok, checkout material, dan
                laporan dengan cepat dan akurat.
              </p>
            </div>
          </div>
        </aside>
        <main className="flex flex-1 items-center justify-center bg-white px-6 py-8 md:px-10 md:py-10">
          <div className="w-full max-w-[420px]">
            <Suspense fallback={<div className="h-[420px] w-full" />}>
              <LoginForm />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
