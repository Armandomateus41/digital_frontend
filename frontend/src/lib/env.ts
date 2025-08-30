export const env = {
  // In prod, set VITE_BFF_BASE to absolute API URL (e.g., https://...)
  // In dev, we default to /api so Vite proxy handles local routing
  bffBase:
    (import.meta.env.VITE_BFF_BASE as string | undefined) ||
    (import.meta.env.PROD ? 'https://digital-backend-6vr0.onrender.com' : '/api'),
}


