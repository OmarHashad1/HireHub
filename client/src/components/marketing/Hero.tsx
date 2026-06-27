import { ArrowRight, Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { AtsPreview } from "@/components/marketing/ProductPreview";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 80% at 50% -10%, rgba(86,69,212,0.22) 0%, rgba(86,69,212,0.05) 32%, transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.55]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(35,37,42,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(35,37,42,0.6) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(100% 70% at 50% 0%, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(100% 70% at 50% 0%, black 30%, transparent 75%)",
        }}
      />

      <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-4 pb-16 pt-16 sm:px-6 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24 lg:pt-24">
        <div className="animate-rise">
          <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-1/70 px-3 py-1.5 text-[12px] text-ink-muted backdrop-blur">
            <Sparkles className="size-3.5 text-primary-hover" />
            Now screening résumés with Gemini
          </span>

          <h1 className="mt-6 text-display-xl text-balance">
            Find work that fits.
            <br />
            <span className="text-ink-subtle">Hire people who fit.</span>
          </h1>

          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-ink-muted sm:text-lg">
            HireHub is the AI-assisted job board with the restraint of a great
            tool. Seekers get sharper matches; recruiters run a faster, fairer
            pipeline — all on one quiet, focused surface.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/jobs" size="lg" className="group">
              Find your next role
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </ButtonLink>
            <ButtonLink href="/company/apply" variant="secondary" size="lg">
              Post a job
            </ButtonLink>
          </div>

          <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-hairline pt-8">
            {[
              { k: "12k+", v: "Open roles" },
              { k: "3.2k", v: "Companies hiring" },
              { k: "< 48h", v: "Avg. screen time" },
            ].map((s) => (
              <div key={s.v}>
                <dt className="text-2xl font-semibold tracking-tight text-ink">
                  {s.k}
                </dt>
                <dd className="mt-1 text-[13px] text-ink-subtle">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="animate-rise [animation-delay:120ms]">
          <AtsPreview />
        </div>
      </div>
    </section>
  );
}
