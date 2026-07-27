import type { Handler } from '@netlify/functions'
import { getStore } from '@netlify/blobs'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!

// 👥 Lista de IDs de Telegram permitidos, separados por coma. Pensado desde
// el día uno como LISTA (no un solo ID), para que sumar a otra persona más
// adelante sea solo agregar su ID acá, sin tocar nada más de la lógica.
const ALLOWED_USER_IDS = (process.env.TELEGRAM_ALLOWED_USER_IDS ?? '')
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean)

async function responderTelegram(chatId: number, texto: string) {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: texto })
  })
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST' || !event.body) {
    return { statusCode: 200, body: 'ok' }
  }

  const update = JSON.parse(event.body)
  const mensaje = update.message

  if (!mensaje?.text) {
    return { statusCode: 200, body: 'ok' }
  }

  const userId = String(mensaje.from?.id ?? '')
  const chatId = mensaje.chat.id

  // 🔒 Solo los IDs en la lista permitida pueden dar comandos. Cualquier
  // otra persona que le escriba al bot recibe un mensaje de rechazo, y no
  // se cambia nada.
  if (!ALLOWED_USER_IDS.includes(userId)) {
    await responderTelegram(chatId, 'No tenés permiso para usar este bot.')
    return { statusCode: 200, body: 'ok' }
  }

  const texto = mensaje.text.trim().toLowerCase()
  const store = getStore('config')

  if (texto === 'abrir' || texto === '/abrir') {
    await store.setJSON('abierto', true)
    await responderTelegram(chatId, '✅ Local marcado como ABIERTO.')
  } else if (texto === 'cerrar' || texto === '/cerrar') {
    await store.setJSON('abierto', false)
    await responderTelegram(chatId, '🔴 Local marcado como CERRADO.')
  } else {
    await responderTelegram(chatId, 'Comandos disponibles: "abrir" / "cerrar"')
  }

  return { statusCode: 200, body: 'ok' }
}