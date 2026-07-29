import type { VercelRequest, VercelResponse } from '@vercel/node'
import { head, put } from '@vercel/blob'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Manejo de lectura (GET) del estado del local
  if (req.method === 'GET') {
    try {
      // Buscamos un archivo llamado 'estado.json' en el Blob de Vercel
      const details = await head('estado.json').catch(() => null)
      
      if (!details) {
        // Si todavía no se creó, por defecto asumimos que está abierto
        return res.status(200).json({ abierto: true })
      }

      const response = await fetch(details.url)
      const data = await response.json()
      
      return res.status(200).json({ abierto: data.abierto })
    } catch (error) {
      console.error('Error leyendo estado:', error)
      return res.status(200).json({ abierto: true }) // Fallback seguro
    }
  }

  // Manejo de escritura (POST) por si querés cambiarlo
  if (req.method === 'POST') {
    try {
      const { abierto } = req.body
      await put('estado.json', JSON.stringify({ abierto }), {
        access: 'public',
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