import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { api, unwrap, apiMessage } from "@/lib/api";
import { sessionKey } from "@/lib/auth";
import type { FullProfile } from "@/lib/session";
import type {
  ExperienceValues,
  EducationValues,
  UpdateProfileValues,
} from "@/schemas/user";

export function useFullProfile(id?: string) {
  return useQuery({
    queryKey: ["profile", "full", id],
    enabled: !!id,
    queryFn: () => unwrap<FullProfile>(api.get(`/user/profile/${id}`)),
  });
}

function useProfileInvalidation() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["profile"] });
    qc.invalidateQueries({ queryKey: sessionKey });
  };
}

export function useUpdateProfile() {
  const invalidate = useProfileInvalidation();
  return useMutation({
    mutationFn: (values: UpdateProfileValues) =>
      api.patch("/user/update-profile", values),
    onSuccess: () => {
      invalidate();
      toast.success("Profile updated");
    },
    onError: (e) => toast.error(apiMessage(e, "Couldn't update profile")),
  });
}

export function useAddExperience() {
  const invalidate = useProfileInvalidation();
  return useMutation({
    mutationFn: (values: ExperienceValues) =>
      api.post("/user/experience", values),
    onSuccess: () => {
      invalidate();
      toast.success("Experience added");
    },
    onError: (e) => toast.error(apiMessage(e, "Couldn't add experience")),
  });
}

export function useUpdateExperience() {
  const invalidate = useProfileInvalidation();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: ExperienceValues }) =>
      api.patch(`/user/experience/${id}`, values),
    onSuccess: () => {
      invalidate();
      toast.success("Experience updated");
    },
    onError: (e) => toast.error(apiMessage(e, "Couldn't update experience")),
  });
}

export function useDeleteExperience() {
  const invalidate = useProfileInvalidation();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/user/experience/${id}`),
    onSuccess: () => {
      invalidate();
      toast.success("Experience removed");
    },
    onError: (e) => toast.error(apiMessage(e, "Couldn't remove experience")),
  });
}

export function useAddEducation() {
  const invalidate = useProfileInvalidation();
  return useMutation({
    mutationFn: (values: EducationValues) =>
      api.post("/user/education", values),
    onSuccess: () => {
      invalidate();
      toast.success("Education added");
    },
    onError: (e) => toast.error(apiMessage(e, "Couldn't add education")),
  });
}

export function useUpdateEducation() {
  const invalidate = useProfileInvalidation();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: EducationValues }) =>
      api.patch(`/user/education/${id}`, values),
    onSuccess: () => {
      invalidate();
      toast.success("Education updated");
    },
    onError: (e) => toast.error(apiMessage(e, "Couldn't update education")),
  });
}

export function useDeleteEducation() {
  const invalidate = useProfileInvalidation();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/user/education/${id}`),
    onSuccess: () => {
      invalidate();
      toast.success("Education removed");
    },
    onError: (e) => toast.error(apiMessage(e, "Couldn't remove education")),
  });
}

export function useUploadAvatar() {
  const invalidate = useProfileInvalidation();
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append("avatar", file);
      return api.patch("/user/change-avatar", form);
    },
    onSuccess: () => {
      invalidate();
      toast.success("Avatar updated");
    },
    onError: (e) => toast.error(apiMessage(e, "Couldn't upload avatar")),
  });
}

export function useDeleteAvatar() {
  const invalidate = useProfileInvalidation();
  return useMutation({
    mutationFn: () => api.delete("/user/delete-avatar"),
    onSuccess: () => {
      invalidate();
      toast.success("Avatar removed");
    },
    onError: (e) => toast.error(apiMessage(e, "Couldn't remove avatar")),
  });
}

export function useUploadCv() {
  const invalidate = useProfileInvalidation();
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append("cv", file);
      return api.patch("/user/change-cv", form);
    },
    onSuccess: () => {
      invalidate();
      toast.success("CV updated");
    },
    onError: (e) => toast.error(apiMessage(e, "Couldn't upload CV")),
  });
}

export function useDeleteCv() {
  const invalidate = useProfileInvalidation();
  return useMutation({
    mutationFn: () => api.delete("/user/delete-cv"),
    onSuccess: () => {
      invalidate();
      toast.success("CV removed");
    },
    onError: (e) => toast.error(apiMessage(e, "Couldn't remove CV")),
  });
}
