// ============================================================
// ServiceFlow Configuration
// The credentials are now handled securely by Vercel Functions (/api)
// ============================================================

export const CONFIG = {
  // Brand / White-label settings
  brand: {
    name: 'ServiceFlow',
    aiName: 'Sofia',
    logo: null, // URL to brand logo or null for default
    primaryColor: '#8B5CF6',
  },

  // API Endpoints (Local proxy for Vercel Serverless Functions)
  api: {
    chat: '/api/chat',
    chamados: '/api/chamados',
  },
};
