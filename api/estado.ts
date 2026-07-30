import type { VercelRequest, VercelResponse } from '@vercel/node'
import { head, put } from '@vercel/blob'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const details = await head('estado.json').catch(() => null)
      
      if (!details) {
        return res.status(200).json({ abierto: true })
      }

      // Al ser privado, pasamos el token en los headers de fetch
      const response = await fetch(details.url, {
        headers: {
          authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`
        }
      })
      const data = await response.json()
      
      return res.status(200).json({ abierto: data.abierto })
    } catch (error) {
      console.error('Error leyendo estado:', error)
      return res.status(200).json({ abierto: true })
    }
  }

  if (req.method === 'POST') {
    try {
      const { abierto } = req.body
      await put('estado.json', JSON.stringify({ abierto }), {
        access: 'private',
        addRandomSuffix: false,
        allowOverwrite: true
      })
      return res.status(200).json({ success: true, abierto })
    } catch (error) {
      return res.status(500).json({ error: 'No se pudo actualizar el estado' })
    }
  }

  return res.status(405).json({ error: 'Método no permitido' })
}