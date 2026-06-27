import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, apiMessage } from "@/lib/api";
import type { CompanyReportValues } from "@/schemas/report";

export function useReportCompany(companyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: CompanyReportValues) =>
      api.post(`/report/company/${companyId}`, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reports", "user"] });
      toast.success("Report submitted — our team will review it");
    },
    onError: (e) => toast.error(apiMessage(e, "Couldn't submit the report")),
  });
}
