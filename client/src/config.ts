// API Configuration
export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string) || "http://localhost:5001";

// Environment check
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;
