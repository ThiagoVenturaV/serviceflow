import { getServiceNowConfig, logUpstreamFailure } from './_security.js'

// GET /api/branding
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const serviceNow = getServiceNowConfig();

  // Fallbacks padrão
  const defaultBranding = {
    logoUrl: '',
    aiName: 'Sofia',
    primaryColor: '#8B5CF6'
  };

  if (serviceNow) {
    try {
      const propNames = [
        'x_2014456_servicef.sf.client.logo_url',
        'x_2014456_servicef.sf.client.ai_name',
        'x_2014456_servicef.sf.client.primary_color'
      ];
      
      const endpoint = `${serviceNow.instance}/api/now/table/sys_properties?sysparm_query=nameIN${propNames.join(',')}`;
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': serviceNow.authorization,
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
      logUpstreamFailure('branding', error);
    }
  }

  // Se falhar ou estiver offline, devolve o padrão
  return res.status(200).json(defaultBranding);
}
