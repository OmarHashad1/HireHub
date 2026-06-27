import { Suspense } from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/marketing/Navbar";
import { JobsExplorer } from "@/features/jobs/JobsExplorer";

export const metadata: Metadata = {
  title: "Find jobs",
  description: "Browse every published role on HireHub in a fast split-pane search.",
};

export default function JobsPage() {
  return (
    <>
      <Navbar />
      <main>
        <Suspense
          fallback={
            <div className="mx-auto max-w-[1280px] px-4 py-10 text-sm text-ink-subtle sm:px-6">
              Loading jobs…
            </div>
          }
        >
          <JobsExplorer />
        </Suspense>
      </main>
    </>
  );
}
