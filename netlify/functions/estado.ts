import type { Handler } from '@netlify/functions'
import { getStore } from '@netlify/blobs'

// 🌐 Endpoint público de solo lectura — tu web lo consulta para saber si el
// local está abierto o cerrado. No necesita autenticación (cualquiera puede
// leer el estado, nadie puede escribirlo desde acá).
export const handler: Handler = async () => {
  const store = getStore('config')

  // Si nunca se seteó nada todavía, arrancamos asumiendo "abierto" por
  // default — ajustá esto si preferís que arranque en "cerrado".
  const abierto = (await store.get('abierto', { type: 'json' })) ?? true

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store' // nunca cachear, siempre el estado real
    },
    body: JSON.stringify({ abierto })
  }
}