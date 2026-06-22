import { useMutation } from "@tanstack/react-query";

import { uploadResume } from "../../../services/upload.service";

export function useResumeUpload() {
  return useMutation({ mutationFn: (file: File) => uploadResume(file) });
}
