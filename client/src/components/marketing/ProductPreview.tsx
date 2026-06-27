import { Sparkles, Check } from "lucide-react";
import { ScoreRing } from "@/components/ScoreRing";
import { SkillTag } from "@/components/SkillTag";

function WindowFrame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="grain overflow-hidden rounded-xl border border-hairline bg-surface-1 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)]">
      <div className="flex items-center gap-2 border-b border-hairline bg-surface-2/60 px-4 py-3">
        <span className="size-2.5 rounded-full bg-hairline-tertiary" />
        <span className="size-2.5 rounded-full bg-hairline-tertiary" />
        <span className="size-2.5 rounded-full bg-hairline-tertiary" />
        <span className="ml-2 font-mono text-[11px] text-ink-tertiary">
          {label}
        </span>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

const pipeline = [
  { stage: "Applied", count: 48, tone: "tag-sky" },
  { stage: "Reviewed", count: 21, tone: "tag-lavender" },
  { stage: "Interview", count: 7, tone: "primary" },
];

const applicants = [
  { name: "Amira K.", role: "Senior Frontend", score: 92, tags: ["React", "TypeScript"] },
  { name: "Youssef M.", role: "Product Designer", score: 78, tags: ["Figma", "UX"] },
  { name: "Lina H.", role: "Backend Engineer", score: 64, tags: ["Node", "AWS"] },
];

export function AtsPreview() {
  return (
    <WindowFrame label="hirehub.app/recruiter/jobs/frontend">
      <div className="mb-4 grid grid-cols-3 gap-2.5">
        {pipeline.map((p) => (
          <div
            key={p.stage}
            className="rounded-lg border border-hairline bg-surface-2/50 p-3"
          >
            <p className="text-[11px] text-ink-subtle">{p.stage}</p>
            <p className="mt-1 text-xl font-semibold tracking-tight text-ink">
              {p.count}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-2.5">
        {applicants.map((a) => (
          <div
            key={a.name}
            className="flex items-center gap-3 rounded-lg border border-hairline bg-surface-2/40 p-3"
          >
            <ScoreRing value={a.score} size={40} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-ink">
                {a.name}
              </p>
              <p className="truncate text-[12px] text-ink-subtle">{a.role}</p>
            </div>
            <div className="hidden gap-1.5 sm:flex">
              {a.tags.map((t) => (
                <SkillTag key={t} label={t} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </WindowFrame>
  );
}

export function AiScorePreview() {
  return (
    <WindowFrame label="gemini · résumé scoring">
      <div className="flex items-center gap-4">
        <ScoreRing value={88} size={72} />
        <div>
          <p className="inline-flex items-center gap-1.5 text-[12px] font-medium text-primary-hover">
            <Sparkles className="size-3.5" /> Strong match
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            5 of 6 required skills, 4 years relevant experience.
          </p>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {[
          "Matches React + TypeScript stack",
          "Led a team of 4 engineers",
          "Ships accessible, tested UI",
        ].map((line) => (
          <p
            key={line}
            className="flex items-start gap-2 rounded-md border border-hairline bg-surface-2/40 px-3 py-2 text-[13px] text-ink-muted"
          >
            <Check className="mt-0.5 size-3.5 shrink-0 text-tag-mint" />
            {line}
          </p>
        ))}
      </div>
    </WindowFrame>
  );
}
