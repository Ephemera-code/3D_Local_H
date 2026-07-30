import type { VercelRequest, VercelResponse } from '@vercel/node'
import { head, put } from '@vercel/blob'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      // Usamos head directamente buscando 'estado.json'
      const details = await head('estado.json')
      
      // Descargamos el contenido usando la url firmada que provee head()
      const response = await fetch(details.url)
      if (!response.ok) {
        return res.status(200).json({ abierto: true })
      }

      const data = await response.json()
      return res.status(200).json({ abierto: data.abierto })
    } catch (error) {
      // Si el archivo no existe todavía, devolvemos true por defecto
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