// Typed access to Vite environment variables.

interface EnvConfig {
  apiBaseUrl: string;
}

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

console.log("VITE_API_BASE_URL =", import.meta.env.VITE_API_BASE_URL);
console.log("Resolved apiBaseUrl =", apiBaseUrl);

export const env: EnvConfig = {
  apiBaseUrl,
};