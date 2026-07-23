import type { ItemCarrito } from '@/store/cart'

// 📱 Reemplazá con tu número real, formato internacional sin + ni espacios
// Ejemplo Argentina: 549 + código de área sin 0 + número sin 15
const NUMERO_WHATSAPP = '5491100000000'

export function construirMensajePedido(items: ItemCarrito[], total: number): string {
  if (items.length === 0) return ''

  const lineas = items.map(
    (item) => `• ${item.cantidad}x ${item.nombre} - $${item.precio * item.cantidad}`
  )

  const mensaje = ['🍔 *Nuevo pedido*', '', ...lineas, '', `*Total: $${total}*`].join('\n')

  return mensaje
}

export function enviarPedidoPorWhatsapp(items: ItemCarrito[], total: number) {
  const mensaje = construirMensajePedido(items, total)
  if (!mensaje) return

  const url = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`
  window.open(url, '_blank')
}