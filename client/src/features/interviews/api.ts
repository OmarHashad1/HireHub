import { useQuery } from "@tanstack/react-query";
import { api, unwrap, type Paginated } from "@/lib/api";

export type Interview = {
  _id: string;
  application: string;
  job: string;
  company: string;
  type: "online" | "in_person";
  scheduledAt: string;
  status: "scheduled" | "completed" | "cancelled" | "missed";
  cancellationReason?: string | null;
  createdAt: string;
};

export function useMyInterviews(page = 1) {
  return useQuery({
    queryKey: ["interviews", "me", page],
    queryFn: () =>
      unwrap<Paginated<Interview>>(
        api.get("/interview/me", { params: { page, size: 50 } }),
      ),
  });
}
