// Typed access to Vite environment variables.

interface EnvConfig {
  apiBaseUrl: string;
}

export const env: EnvConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1",
};
