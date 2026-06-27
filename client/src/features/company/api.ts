import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, unwrap, apiMessage, type Paginated } from "@/lib/api";
import type { Job } from "@/lib/types";
import type { CompanyApplicationValues } from "@/schemas/company";

export type PublicCompany = {
  _id: string;
  name: string;
  logo?: string | null;
  coverImage?: string | null;
  industry: string;
  size: string;
  location: { city?: string; country?: string };
  description: string;
  website?: string | null;
  benefits?: string[];
  socialMedia?: {
    twitter?: string | null;
    facebook?: string | null;
    instagram?: string | null;
    linkedin?: string | null;
  };
  foundedAt?: string | null;
  email?: string;
  createdAt: string;
};

export function usePublicCompany(id: string) {
  return useQuery({
    queryKey: ["company", id],
    enabled: !!id,
    queryFn: () => unwrap<PublicCompany>(api.get(`/company/${id}`)),
  });
}

export function useCompanyJobs(id: string) {
  return useQuery({
    queryKey: ["company", id, "jobs"],
    enabled: !!id,
    queryFn: () =>
      unwrap<Paginated<Job>>(
        api.get(`/job/company/${id}/jobs`, { params: { page: 1, size: 50 } }),
      ),
  });
}

type CompanyDocs = {
  commercialRegistration: File;
  taxCard: File;
};

export function useApplyAsCompany() {
  return useMutation({
    mutationFn: ({
      values,
      files,
    }: {
      values: CompanyApplicationValues;
      files: CompanyDocs;
    }) => {
      const form = new FormData();
      form.append("companyName", values.companyName);
      form.append("companyEmail", values.companyEmail);
      form.append("contactPhone", values.contactPhone);
      form.append("industry", values.industry);
      form.append("size", values.size);
      form.append("description", values.description);
      form.append("location", JSON.stringify(values.location));
      if (values.website) form.append("website", values.website);
      if (values.linkedin) form.append("linkedin", values.linkedin);
      if (values.foundedAt) {
        form.append("foundedAt", new Date(values.foundedAt).toISOString());
      }
      form.append("commercialRegistration", files.commercialRegistration);
      form.append("taxCard", files.taxCard);
      return api.post("/company/application", form);
    },
    onError: (e) =>
      toast.error(apiMessage(e, "Couldn't submit your application")),
  });
}
