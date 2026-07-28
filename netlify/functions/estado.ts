import type { Handler } from '@netlify/functions'
import { getStore } from '@netlify/blobs'

// 🔧 En algunos contextos, Netlify Functions no inyecta automáticamente las
// credenciales de Blobs — hay que pasarlas explícitamente con siteID y
// token (un Personal Access Token creado en User settings → Applications).
function obtenerStoreConfig() {
  return getStore({
    name: 'config',
    siteID: process.env.NETLIFY_SITE_ID!,
    token: process.env.NETLIFY_BLOBS_TOKEN!
  })
}

export const handler: Handler = async () => {
  const store = obtenerStoreConfig()

  const abierto = (await store.get('abierto', { type: 'json' })) ?? true

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    },
    body: JSON.stringify({ abierto })
  }
}