import { LoginForm } from "@/components/login-form";
import Image from "next/image";
export default function LoginPage() {
  return (
    <div className="min-h-screen w-screen bg-white font-[var(--font-manrope)]">
      <div className="grid min-h-screen w-full grid-cols-1 md:grid-cols-[1.1fr_1fr]">
        <aside className="relative overflow-hidden">
          <Image
            src="/bg.png"
            alt=""
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0" aria-hidden />
          <div className="relative z-10 flex h-full flex-col justify-between p-8 text-white md:p-10">
            <div className="flex items-center justify-between text-sm text-white/80"></div>
            <div className="space-y-4">
              <h1 className="text-4xl font-medium leading-tight md:text-5xl">
                Kelola Inventaris
                <br />
                Tanpa Hambatan.
              </h1>
              <p className="max-w-sm text-sm leading-relaxed text-white/75 md:text-base">
                KJI membantu tim produksi memantau stok, checkout material, dan
                laporan dengan cepat dan akurat.
              </p>
            </div>
          </div>
        </aside>
        <main className="flex h-full items-center justify-center bg-white px-6 py-10 md:px-10">
          <div className="w-full max-w-[420px]">
            <LoginForm />
          </div>
        </main>
      </div>
    </div>
  );
}
