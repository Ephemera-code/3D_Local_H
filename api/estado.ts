import type { VercelRequest, VercelResponse } from '@vercel/node'
import { put, list } from '@vercel/blob'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Manejo de lectura (GET) del estado del local
  if (req.method === 'GET') {
    try {
      // Listamos los archivos para encontrar el de estado
      const { blobs } = await list({ prefix: 'estado.json' })
      
      if (!blobs || blobs.length === 0) {
        return res.status(200).json({ abierto: true })
      }

      // Descargamos el contenido usando la URL con el token integrado que provee Vercel Blob
      const response = await fetch(blobs[0].url)
      
      if (!response.ok) {
        return res.status(200).json({ abierto: true })
      }

      const data = await response.json()
      return res.status(200).json({ abierto: data.abierto })
    } catch (error) {
      console.error('Error leyendo estado:', error)
      return res.status(200).json({ abierto: true })
    }
  }

  // Manejo de escritura (POST)
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
      console.error('Error guardando estado:', error)
      return res.status(500).json({ error: 'No se pudo actualizar el estado' })
    }
  }

  return res.status(405).json({ error: 'Método no permitido' })
}