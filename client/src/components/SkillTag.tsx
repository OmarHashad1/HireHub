import { cn } from "@/lib/utils";

const palette = [
  "bg-tag-lavender text-[#391c57]",
  "bg-tag-mint text-[#1aae39]",
  "bg-tag-sky text-[#005bab]",
  "bg-tag-peach text-[#793400]",
  "bg-tag-rose text-[#a02e6d]",
  "bg-tag-yellow text-[#523410]",
] as const;

function hashIndex(value: string) {
  let h = 0;
  for (let i = 0; i < value.length; i++) {
    h = (h * 31 + value.charCodeAt(i)) >>> 0;
  }
  return h % palette.length;
}

export function SkillTag({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-semibold leading-5",
        palette[hashIndex(label)],
        className,
      )}
    >
      {label}
    </span>
  );
}
