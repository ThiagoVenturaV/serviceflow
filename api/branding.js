// GET /api/branding
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const instance = process.env.SERVICENOW_INSTANCE || process.env.VITE_SERVICENOW_INSTANCE;
  const user     = process.env.SERVICENOW_USER     || process.env.VITE_SERVICENOW_USER;
  const password = process.env.SERVICENOW_PASSWORD || process.env.VITE_SERVICENOW_PASSWORD;

  // Fallbacks padrão
  const defaultBranding = {
    logoUrl: '',
    aiName: 'Sofia',
    primaryColor: '#8B5CF6'
  };

  if (instance && user && password) {
    try {
      const propNames = [
        'x_2014456_servicef.sf.client.logo_url',
        'x_2014456_servicef.sf.client.ai_name',
        'x_2014456_servicef.sf.client.primary_color'
      ];
      
      const endpoint = `${instance}/api/now/table/sys_properties?sysparm_query=nameIN${propNames.join(',')}`;
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + Buffer.from(`${user}:${password}`).toString('base64'),
        },
      });

      if (response.ok) {
        const body = await response.json();
        const results = body.result || [];
        
        const branding = { ...defaultBranding };
        
        results.forEach(prop => {
          if (prop.name === 'x_2014456_servicef.sf.client.logo_url') {
            branding.logoUrl = prop.value || '';
          } else if (prop.name === 'x_2014456_servicef.sf.client.ai_name') {
            branding.aiName = prop.value || 'Sofia';
          } else if (prop.name === 'x_2014456_servicef.sf.client.primary_color') {
            branding.primaryColor = prop.value || '#8B5CF6';
          }
        });
        
        return res.status(200).json(branding);
      } else {
        console.warn(`Falha ao ler sys_properties: ${response.status} - usando fallback.`);
      }
    } catch (error) {
      console.warn('Erro ao conectar com o ServiceNow para ler branding:', error.message);
    }
  }

  // Se falhar ou estiver offline, devolve o padrão
  return res.status(200).json(defaultBranding);
}
