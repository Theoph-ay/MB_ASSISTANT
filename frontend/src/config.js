// Central API configuration
// Uses VITE_API_URL from environment (set in Vercel), falls back to localhost for local dev
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
