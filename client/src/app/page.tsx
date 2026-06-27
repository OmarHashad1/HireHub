import {
  Brain,
  Filter,
  Gauge,
  LayoutGrid,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { Hero } from "@/components/marketing/Hero";
import { JobTeaser } from "@/components/marketing/JobTeaser";
import { AiScorePreview } from "@/components/marketing/ProductPreview";
import { ButtonLink } from "@/components/ui/Button";

const seekerFeatures = [
  {
    icon: Filter,
    title: "Split-pane search",
    body: "A LinkedIn-grade results rail with a sticky reading pane. Scan, open, apply — no page reloads.",
  },
  {
    icon: Gauge,
    title: "Know where you stand",
    body: "Every application shows its live status and AI score the moment screening finishes.",
  },
  {
    icon: ShieldCheck,
    title: "One profile, reused",
    body: "Your CV, experience, and skills snapshot into each application so later edits never rewrite history.",
  },
];

const recruiterFeatures = [
  {
    icon: LayoutGrid,
    title: "An ATS, not a spreadsheet",
    body: "Applicants flow across a pipeline board grouped by status, with notes and one-click stage moves.",
  },
  {
    icon: Workflow,
    title: "Dashboards that are charts",
    body: "Every KPI is a live recharts visual — jobs by status, applicant trends, pipeline funnels, AI gauges.",
  },
  {
    icon: Brain,
    title: "Optional auto-reject",
    body: "Set a threshold and let Gemini filter below-bar résumés — fully opt-in, always auditable.",
  },
];

function FeatureGrid({
  features,
}: {
  features: { icon: typeof Filter; title: string; body: string }[];
}) {
  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-3">
      {features.map((f) => (
        <div
          key={f.title}
          className="rounded-lg border border-hairline bg-surface-1 p-5 transition-colors hover:border-hairline-strong"
        >
          <span className="grid size-9 place-items-center rounded-md border border-hairline bg-surface-2 text-primary-hover">
            <f.icon className="size-[18px]" />
          </span>
          <h3 className="mt-4 text-[15px] font-semibold tracking-tight text-ink">
            {f.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-subtle">
            {f.body}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />

        <section id="how" className="mx-auto max-w-[1280px] px-4 py-20 sm:px-6">
          <p className="text-eyebrow text-primary-hover">For job seekers</p>
          <h2 className="mt-2 max-w-2xl text-display-md text-balance">
            The search experience the work deserves.
          </h2>
          <FeatureGrid features={seekerFeatures} />
        </section>

        <section id="ai" className="border-y border-hairline bg-surface-1/30">
          <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <AiScorePreview />
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-eyebrow text-primary-hover">AI screening</p>
              <h2 className="mt-2 text-display-md text-balance">
                Gemini reads the résumé so the queue stays human.
              </h2>
              <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-ink-muted">
                Each application is scored 0–100 against the job&apos;s real
                requirements, with written reasoning attached. Scoring runs in
                the background — it never blocks an apply, and recruiters stay in
                control of every decision.
              </p>
              <ul className="mt-6 space-y-2.5 text-sm text-ink-muted">
                {[
                  "Structured score + notes on every applicant",
                  "Two-layer validation before anything is saved",
                  "Auto-reject is opt-in and fully logged",
                ].map((line) => (
                  <li key={line} className="flex items-center gap-2.5">
                    <span className="size-1.5 rounded-full bg-primary-hover" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section
          id="recruiters"
          className="mx-auto max-w-[1280px] px-4 py-20 sm:px-6"
        >
          <p className="text-eyebrow text-primary-hover">For recruiters</p>
          <h2 className="mt-2 max-w-2xl text-display-md text-balance">
            Run the whole pipeline from one quiet dashboard.
          </h2>
          <FeatureGrid features={recruiterFeatures} />
        </section>

        <JobTeaser />

        <section className="mx-auto max-w-[1280px] px-4 pb-24 sm:px-6">
          <div className="grain relative overflow-hidden rounded-xl border border-hairline bg-surface-1 px-6 py-14 text-center sm:px-10 sm:py-20">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10"
              style={{
                background:
                  "radial-gradient(80% 120% at 50% 0%, rgba(86,69,212,0.18), transparent 60%)",
              }}
            />
            <h2 className="mx-auto max-w-2xl text-headline text-balance sm:text-display-md">
              Your next role — or your next hire — is one quiet search away.
            </h2>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink href="/jobs" size="lg">
                Find your next role
              </ButtonLink>
              <ButtonLink href="/company/apply" variant="secondary" size="lg">
                Hire on HireHub
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
