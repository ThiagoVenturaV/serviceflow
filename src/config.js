// ============================================================
// ServiceFlow Configuration
// Update these values with your real credentials
// ============================================================

export const CONFIG = {
  // Brand / White-label settings
  brand: {
    name: 'ServiceFlow',
    aiName: 'Sofia',
    logo: null, // URL to brand logo or null for default
    primaryColor: '#8B5CF6',
  },

  // Groq API settings
  groq: {
    apiKey: import.meta.env.VITE_GROQ_API_KEY || 'YOUR_GROQ_API_KEY',
    model: 'llama-3.3-70b-versatile',
  },

  // ServiceNow REST API settings
  serviceNow: {
    instance: import.meta.env.VITE_SERVICENOW_INSTANCE || 'https://SUA_INSTANCIA.service-now.com',
    endpoint: '/api/serviceflow/chamados',
    user: import.meta.env.VITE_SERVICENOW_USER || 'usuario',
    password: import.meta.env.VITE_SERVICENOW_PASSWORD || 'senha',
  },
};
