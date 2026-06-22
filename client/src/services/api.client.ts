import axios from "axios";

import { env } from "../config/env.config";
import { ApiError, type ApiResponse } from "../types/api.types";

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: { "Content-Type": "application/json" },
});

// Convert backend/transport errors into a typed ApiError.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error?.response?.data;
    if (data && data.success === false && data.error) {
      return Promise.reject(
        new ApiError(data.error.code, data.error.message, data.error.details ?? undefined),
      );
    }
    return Promise.reject(new ApiError("NETWORK_ERROR", error?.message ?? "Network error"));
  },
);

/** Await a request and unwrap the success envelope, throwing ApiError otherwise. */
export async function unwrap<T>(request: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const response = await request;
  const body = response.data;
  if (body.success) {
    return body.data;
  }
  throw new ApiError(body.error.code, body.error.message, body.error.details ?? undefined);
}
