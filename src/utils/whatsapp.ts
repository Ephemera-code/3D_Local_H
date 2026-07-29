import type { ItemCarrito } from '@/store/cart'

// 📱 Reemplazá con tu número real, formato internacional sin + ni espacios
// Ejemplo Argentina: 549 + código de área sin 0 + número sin 15
const NUMERO_WHATSAPP = '541134408770'

export interface DatosEntrega {
  tipo: 'retiro' | 'envio'
  nombre?: string
  direccion?: string
}

export function construirMensajePedido(
  items: ItemCarrito[],
  total: number,
  datosEntrega?: DatosEntrega
): string {
  if (items.length === 0) return ''

  const lineas = items.map(
    (item) => `• ${item.cantidad}x ${item.nombre} - $${item.precio * item.cantidad}`
  )

  const partesEntrega: string[] = []
  if (datosEntrega) {
    if (datosEntrega.tipo === 'envio') {
      partesEntrega.push('', '🛵 *Con envío*')
      if (datosEntrega.nombre) partesEntrega.push(`Nombre: ${datosEntrega.nombre}`)
      if (datosEntrega.direccion) partesEntrega.push(`Dirección: ${datosEntrega.direccion}`)
    } else {
      partesEntrega.push('', '🏠 *Retiro en el local*')
    }
  }

  const mensaje = ['🍔 *Nuevo pedido*', '', ...lineas, '', `*Total: $${total}*`, ...partesEntrega].join(
    '\n'
  )

  return mensaje
}

export function enviarPedidoPorWhatsapp(
  items: ItemCarrito[],
  total: number,
  datosEntrega?: DatosEntrega
) {
  const mensaje = construirMensajePedido(items, total, datosEntrega)
  if (!mensaje) return

  const url = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`
  window.open(url, '_blank')
}