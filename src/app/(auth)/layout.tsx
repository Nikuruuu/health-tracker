import type { ReactNode } from "react";
import { Flame, Droplets, Footprints } from "lucide-react";

export default function AuthLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-background text-foreground">
      {/* Left Brand Showcase Panel (Desktop & Tablet) */}
      <aside className="relative hidden lg:flex lg:w-1/2 xl:w-[52%] bg-brand-forest-dark text-white flex-col justify-between p-10 xl:p-16 overflow-hidden">
        {/* Subtle decorative background curves */}
        <div className="pointer-events-none absolute inset-0 z-0 opacity-40">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary blur-3xl" />
          <div className="absolute top-1/3 -right-24 w-[32rem] h-[32rem] rounded-full bg-brand-forest blur-3xl" />
          <div className="absolute -bottom-24 left-1/4 w-[28rem] h-[28rem] rounded-full bg-brand-forest-light blur-3xl" />
        </div>

        {/* Top Header: VitaPath Brand Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md">
            <svg
              className="w-5 h-5 text-brand-forest"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5c0 3.1 2.2 4.6 4 5 .4-.9.9-1.9 1.4-2.8C9.5 12 13.5 9 17 8z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">VitaPath</span>
        </div>

        {/* Middle Hero Content & Preview Card */}
        <div className="relative z-10 max-w-xl my-auto py-8">
          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-[1.12]">
            From 90 kg to a life you can maintain.
          </h1>
          <p className="mt-4 text-base xl:text-lg text-white/80 leading-relaxed font-normal">
            Phase-based weight loss that shifts seamlessly into long-term maintenance.
          </p>

          {/* Maya's Journey Live Metric Card */}
          <div className="mt-8 rounded-2xl bg-white/[0.09] backdrop-blur-md border border-white/15 p-5 xl:p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white/90">Maya&apos;s journey</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-white/20 text-white border border-white/10">
                Phase 2
              </span>
            </div>

            <div className="mt-4 flex items-baseline justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white">-6.6</span>
                <span className="text-sm font-medium text-white/80">kg</span>
              </div>
              <span className="text-xs text-white/70 font-mono tracking-wide">
                90.0 → 83.4 kg
              </span>
            </div>

            {/* Progress Bar with Metric Calories Accent */}
            <div className="mt-3 w-full bg-white/20 h-2 rounded-full overflow-hidden">
              <div className="bg-metric-calories h-full w-[26.4%] rounded-full shadow-sm" />
            </div>

            {/* 3 Metric Pills */}
            <div className="mt-4 grid grid-cols-3 gap-2.5 text-center">
              <div className="rounded-xl bg-white/[0.08] border border-white/10 py-2.5 px-1.5">
                <Flame className="w-4 h-4 text-metric-calories mx-auto mb-1" />
                <div className="text-xs font-bold text-white">12-day</div>
                <div className="text-[10px] text-white/70">streak</div>
              </div>
              <div className="rounded-xl bg-white/[0.08] border border-white/10 py-2.5 px-1.5">
                <Droplets className="w-4 h-4 text-sky-300 mx-auto mb-1" />
                <div className="text-xs font-bold text-white">3.0 L</div>
                <div className="text-[10px] text-white/70">water</div>
              </div>
              <div className="rounded-xl bg-white/[0.08] border border-white/10 py-2.5 px-1.5">
                <Footprints className="w-4 h-4 text-emerald-300 mx-auto mb-1" />
                <div className="text-xs font-bold text-white">7,240</div>
                <div className="text-[10px] text-white/70">avg steps</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer Note */}
        <div className="relative z-10 text-xs text-white/75">
          Track nutrition, movement and body trends in one place.
        </div>
      </aside>

      {/* Right Form Area (Mobile & Desktop) */}
      <main className="w-full lg:w-1/2 xl:w-[48%] flex flex-col justify-center items-center px-4 py-8 sm:px-8 md:px-12 min-h-screen">
        {/* Mobile Header Branding (Visible on < lg) */}
        <div className="flex lg:hidden items-center gap-2 mb-6 self-center">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
            <svg
              className="w-5 h-5 text-primary-foreground"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5c0 3.1 2.2 4.6 4 5 .4-.9.9-1.9 1.4-2.8C9.5 12 13.5 9 17 8z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">VitaPath</span>
        </div>

        <div className="w-full max-w-[400px] flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
}
