import type { VercelRequest, VercelResponse } from '@vercel/node'
import { put, head } from '@vercel/blob'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const ALLOWED_USER_IDS = (process.env.TELEGRAM_ALLOWED_USER_IDS ?? '')
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean)

async function responderTelegram(chatId: number, texto: string) {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: texto, parse_mode: 'Markdown' })
  })
}

async function obtenerJsonBlob(nombreArchivo: string, defaultValue: any) {
  try {
    const fileInfo = await head(nombreArchivo).catch(() => null)
    if (!fileInfo) return defaultValue
    
    // Leemos el blob privado usando el token de autorización
    const res = await fetch(fileInfo.url, {
      headers: {
        authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`
      }
    })
    return await res.json()
  } catch {
    return defaultValue
  }
}

async function guardarJsonBlob(nombreArchivo: string, data: any) {
  await put(nombreArchivo, JSON.stringify(data), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true
  })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST' || !req.body) {
    return res.status(200).json({ ok: true })
  }

  const update = req.body
  const mensaje = update.message
  if (!mensaje?.text) return res.status(200).json({ ok: true })

  const userId = String(mensaje.from?.id ?? '')
  const chatId = mensaje.chat.id

  if (ALLOWED_USER_IDS.length > 0 && !ALLOWED_USER_IDS.includes(userId)) {
    await responderTelegram(chatId, '⛔ No tenés permiso para usar este bot.')
    return res.status(200).json({ ok: true })
  }

  const texto = mensaje.text.trim()
  const textoMin = texto.toLowerCase()

  if (textoMin === 'abrir' || textoMin === '/abrir') {
    await guardarJsonBlob('estado.json', { abierto: true })
    await responderTelegram(chatId, '✅ Local marcado como *ABIERTO*.')
    return res.status(200).json({ ok: true })
  } 
  
  if (textoMin === 'cerrar' || textoMin === '/cerrar') {
    await guardarJsonBlob('estado.json', { abierto: false })
    await responderTelegram(chatId, '🔴 Local marcado como *CERRADO*.')
    return res.status(200).json({ ok: true })
  }

  const spaceIdx = texto.indexOf(" ")
  const command = (spaceIdx !== -1 ? texto.substring(0, spaceIdx) : texto).toLowerCase()
  const argsRaw = spaceIdx !== -1 ? texto.substring(spaceIdx + 1).trim() : ""
  const args = argsRaw ? argsRaw.split("|").map((a) => a.trim()) : []

  let menuData = await obtenerJsonBlob('menu.json', { categorias: [], items: [] })

  try {
    if (command === '/precio') {
      const [targetId, param2, param3] = args
      if (!targetId) {
        await responderTelegram(chatId, "⚠️ Uso:\n`/precio pizza-fugazzeta|9500`")
        return res.status(200).json({ ok: true })
      }

      const index = menuData.items.findIndex((i: any) => i.id === targetId)
      if (index === -1) {
        await responderTelegram(chatId, `❌ No existe el producto con ID \`${targetId}\`.`)
        return res.status(200).json({ ok: true })
      }

      const producto = menuData.items[index]
      if (producto.precios) {
        if (!param2 || !param3) {
          await responderTelegram(chatId, `⚠️ Este producto tiene variantes. Especificá el tamaño.\nEj: \`/precio ${targetId}|500ml|3200\``)
          return res.status(200).json({ ok: true })
        }
        const varIndex = producto.precios.findIndex((p: any) => p.tamano.toLowerCase() === param2.toLowerCase())
        if (varIndex === -1) {
          await responderTelegram(chatId, `❌ Variante \`${param2}\` no encontrada.`)
          return res.status(200).json({ ok: true })
        }
        producto.precios[varIndex].precio = Number(param3)
        await responderTelegram(chatId, `✅ Precio actualizado: *${producto.nombre}* (${param2}) ➔ $${param3}`)
      } else {
        producto.precio = Number(param2)
        await responderTelegram(chatId, `✅ Precio actualizado: *${producto.nombre}* ➔ $${param2}`)
      }

      menuData.items[index] = producto
      await guardarJsonBlob('menu.json', menuData)
    }
  } catch (e) {
    await responderTelegram(chatId, "❌ Error procesando el comando.")
  }

  return res.status(200).json({ ok: true })
}