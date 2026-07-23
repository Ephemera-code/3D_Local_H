import { useEffect, useRef, useState } from 'react'
import { useEscena } from '@/context/EscenaContext'
import { useCartStore } from '@/store/cart'
import { CATEGORIAS, MENU_ITEMS } from '@/data/menuItems'
import { enviarPedidoPorWhatsapp } from '@/utils/whatsapp'

// 🍔 Panel del menú — se abre automáticamente cuando la cámara TERMINA de
// viajar al mostrador (seccion pasa de 'viajando' a 'ventana', que es
// exactamente cuando el timeline de gsap dispara su onComplete). Nunca se
// desmonta: igual que GaleriaPanel, siempre vive montado y solo se desliza
// dentro/fuera de pantalla, evitando cualquier costo de remount.
export function MenuPanel() {
  const { seccion, manejarViajeCamara } = useEscena()
  const abierta = seccion === 'ventana'
  const panelRef = useRef<HTMLDivElement>(null)

  const [categoriaActiva, setCategoriaActiva] = useState(CATEGORIAS[0].id)

  const { items, agregarItem, cambiarCantidad, quitarItem, total, cantidadTotal } = useCartStore()

  const itemsFiltrados = MENU_ITEMS.filter((item) => item.categoria === categoriaActiva)

  // Mismo patrón de accesibilidad que GaleriaPanel: 'inert' saca foco e
  // interacción de todo el subárbol cuando el panel no está visible, evitando
  // el warning de aria-hidden con foco atrapado.
  useEffect(() => {
    const el = panelRef.current
    if (!el) return
    if (abierta) {
      el.removeAttribute('inert')
    } else {
      el.setAttribute('inert', '')
    }
  }, [abierta])

  const handleEnviarPedido = () => {
    if (items.length === 0) return
    enviarPedidoPorWhatsapp(items, total())
  }

  return (
    <div
      ref={panelRef}
      className="fixed inset-0 z-40 bg-zinc-950 flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)]"
      style={{
        transform: abierta ? 'translateY(0%)' : 'translateY(100%)',
        pointerEvents: abierta ? 'auto' : 'none'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-zinc-800/80">
        <h1 className="font-especial text-2xl uppercase text-white flex items-center gap-2">
          🔥 <span>Menú</span>
        </h1>
        <button
          onClick={() => manejarViajeCamara('home')}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
        >
          ← Volver afuera
        </button>
      </div>

      {/* Tabs de categoría */}
      <div className="flex items-center gap-2 px-5 py-3 overflow-x-auto shrink-0">
        {CATEGORIAS.map((cat) => {
          const activa = cat.id === categoriaActiva
          return (
            <button
              key={cat.id}
              onClick={() => setCategoriaActiva(cat.id)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                activa
                  ? 'bg-gradient-to-r from-[#ff4500] to-amber-400 text-zinc-950'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              {cat.nombre}
            </button>
          )
        })}
      </div>

      {/* Contenido: lista de productos + resumen del pedido */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        {/* Lista de productos de la categoría activa */}
        <div className="flex-1 overflow-y-auto px-5 pb-4 flex flex-col gap-3">
          {itemsFiltrados.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60 p-3"
            >
              <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-red-900/60 to-red-950/60 flex items-center justify-center">
                {item.imagen ? (
                  <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl">🍔</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-black uppercase text-sm text-white truncate">{item.nombre}</h3>
                {item.descripcion && (
                  <p className="text-xs text-zinc-400 leading-snug line-clamp-2">{item.descripcion}</p>
                )}
                <p className="text-sm font-bold text-amber-500 mt-1">${item.precio.toLocaleString('es-AR')}</p>
              </div>

              <button
                onClick={() => agregarItem(item)}
                className="shrink-0 rounded-lg bg-zinc-800 border border-amber-500/30 text-amber-500 px-3 py-2 text-xs font-bold uppercase tracking-wider hover:bg-amber-500 hover:text-zinc-950 transition-colors"
              >
                + Agregar
              </button>
            </div>
          ))}

          {itemsFiltrados.length === 0 && (
            <p className="text-center text-zinc-500 text-sm mt-8">No hay productos en esta categoría.</p>
          )}
        </div>

        {/* Resumen del pedido */}
        <div className="w-full md:w-80 shrink-0 border-t md:border-t-0 md:border-l border-zinc-800/80 flex flex-col min-h-0">
          <div className="px-5 py-4 border-b border-zinc-800/80">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
              Tu pedido {cantidadTotal() > 0 && `(${cantidadTotal()})`}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-3 flex flex-col gap-2">
            {items.length === 0 && (
              <p className="text-center text-zinc-500 text-sm mt-8">
                Tu carrito está vacío.
                <br />
                Elegí algo del menú para empezar.
              </p>
            )}

            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-2 py-2 border-b border-zinc-900">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{item.nombre}</p>
                  <p className="text-[11px] text-zinc-500">${(item.precio * item.cantidad).toLocaleString('es-AR')}</p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => cambiarCantidad(item.id, item.cantidad - 1)}
                    className="w-6 h-6 rounded bg-zinc-800 text-white text-xs hover:bg-zinc-700"
                    aria-label="Quitar uno"
                  >
                    −
                  </button>
                  <span className="text-xs text-white w-4 text-center">{item.cantidad}</span>
                  <button
                    onClick={() => cambiarCantidad(item.id, item.cantidad + 1)}
                    className="w-6 h-6 rounded bg-zinc-800 text-white text-xs hover:bg-zinc-700"
                    aria-label="Agregar uno"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => quitarItem(item.id)}
                  className="shrink-0 text-zinc-600 hover:text-red-400 text-xs px-1"
                  aria-label="Eliminar producto"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="px-5 py-4 border-t border-zinc-800/80 flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400 uppercase text-xs font-mono tracking-wider">Total</span>
              <span className="text-white font-black text-lg">${total().toLocaleString('es-AR')}</span>
            </div>

            <button
              onClick={handleEnviarPedido}
              disabled={items.length === 0}
              className="w-full py-3.5 rounded-xl flex items-center justify-center
                bg-gradient-to-r from-[#ff4500] to-amber-400
                text-sm font-black uppercase tracking-[0.15em] text-zinc-950
                disabled:opacity-30 disabled:cursor-not-allowed
                transition-transform active:scale-[0.98]"
            >
              Enviar pedido
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}