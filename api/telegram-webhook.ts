import type { VercelRequest, VercelResponse } from '@vercel/node'
import { put, list } from '@vercel/blob'

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
    const fileInfo = await head(nombreArchivo)
    const res = await fetch(fileInfo.url)
    if (!res.ok) return defaultValue
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

  return res.status(200).json({ ok: true })
}