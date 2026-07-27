import { useEffect, useRef, useState } from 'react'
import { useEscena } from '@/context/EscenaContext'
import { useCartStore } from '@/store/cart'
import { CATEGORIAS, MENU_ITEMS } from '@/data/menuItems'
import { enviarPedidoPorWhatsapp } from '@/utils/whatsapp'

export function MenuPanel() {
  const { seccion, manejarViajeCamara } = useEscena()
  const abierta = seccion === 'ventana'
  const panelRef = useRef<HTMLDivElement>(null)

  const [vista, setVista] = useState<'menu' | 'carrito'>('menu')
  const [categoriaActiva, setCategoriaActiva] = useState(CATEGORIAS[0].id)

  const { items, agregarItem, cambiarCantidad, quitarItem, total, cantidadTotal } = useCartStore()

  const itemsFiltrados = MENU_ITEMS.filter((item) => item.categoria === categoriaActiva)

  useEffect(() => {
    const el = panelRef.current
    if (!el) return
    if (abierta) {
      el.removeAttribute('inert')
    } else {
      el.setAttribute('inert', '')
      setTimeout(() => setVista('menu'), 500) 
    }
  }, [abierta])

  const handleEnviarPedido = () => {
    if (items.length === 0) return
    enviarPedidoPorWhatsapp(items, total())
  }

  return (
    <div
      ref={panelRef}
      className="fixed inset-0 z-40 bg-zinc-950 flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] transform-gpu will-change-transform"
      style={{
        transform: abierta ? 'translateY(0%)' : 'translateY(100%)',
        pointerEvents: abierta ? 'auto' : 'none'
      }}
    >
      {/* Header General */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-zinc-800/80">
        <h1 className="font-especial text-2xl uppercase text-white flex items-center gap-2">
          🔥 <span>Hambre</span>
        </h1>
        <button
          onClick={() => manejarViajeCamara('home')}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
        >
          ← Volver afuera
        </button>
      </div>

      {/* Pestañas Principales: Menú / Pedido */}
      <div className="px-5 py-3 border-b border-zinc-800/80">
        <div className="flex rounded-xl bg-zinc-900/60 p-1">
          <button
            onClick={() => setVista('menu')}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${
              vista === 'menu'
                ? 'bg-gradient-to-r from-[#ff4500] to-amber-400 text-zinc-950'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Ver Menú
          </button>
          <button
            onClick={() => setVista('carrito')}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 ${
              vista === 'carrito'
                ? 'bg-gradient-to-r from-[#ff4500] to-amber-400 text-zinc-950'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Mi Pedido 
            {cantidadTotal() > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${vista === 'carrito' ? 'bg-zinc-950 text-amber-500' : 'bg-amber-500 text-zinc-950'}`}>
                {cantidadTotal()}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Contenedor dinámico según la vista activa */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        
        {vista === 'menu' ? (
          <>
            {/* Tabs de categoría horizontales */}
            <div className="flex items-center gap-2 px-5 py-3 overflow-x-auto shrink-0 border-b border-zinc-800/80">
              {CATEGORIAS.map((cat) => {
                const activa = cat.id === categoriaActiva
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategoriaActiva(cat.id)}
                    className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                      activa
                        ? 'bg-zinc-800 text-white'
                        : 'bg-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {cat.nombre}
                  </button>
                )
              })}
            </div>

            {/* Lista de productos sin imágenes (Estilo carta) */}
            <div className="flex-1 overflow-y-auto px-5 pb-6 flex flex-col">
              {itemsFiltrados.map((item) => (
                <div
                  key={item.id}
                  className="py-5 border-b border-zinc-800/50 flex flex-col gap-1"
                >
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-black uppercase text-sm text-amber-500 tracking-wide">
                      {item.nombre}
                    </h3>
                    <p className="font-bold text-sm text-white shrink-0">
                      ${item.precio.toLocaleString('es-AR')}
                    </p>
                  </div>
                  
                  {item.descripcion && (
                    <p className="text-sm text-zinc-400 leading-snug">
                      ( {item.descripcion} )
                    </p>
                  )}

                  <div className="mt-3 flex">
                    <button
                      onClick={() => agregarItem(item)}
                      className="rounded-lg bg-zinc-900 border border-amber-500/30 text-amber-500 px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-amber-500 hover:text-zinc-950 transition-colors"
                    >
                      + Agregar
                    </button>
                  </div>
                </div>
              ))}

              {itemsFiltrados.length === 0 && (
                <p className="text-center text-zinc-500 text-sm mt-8">No hay productos en esta categoría.</p>
              )}
            </div>
          </>
        ) : (
          /* Vista Carrito / Resumen del pedido (Full width) */
          <div className="flex-1 flex flex-col min-h-0 bg-zinc-950">
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
              {items.length === 0 && (
                <div className="flex flex-col items-center justify-center flex-1 opacity-50">
                  <span className="text-4xl mb-4">🛒</span>
                  <p className="text-center text-zinc-400 text-sm">
                    Tu carrito está vacío.<br/>Agregá productos desde el menú.
                  </p>
                  <button 
                    onClick={() => setVista('menu')}
                    className="mt-6 text-amber-500 text-xs uppercase tracking-widest font-bold underline"
                  >
                    Ir al menú
                  </button>
                </div>
              )}

              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-3 border-b border-zinc-900">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white uppercase tracking-wide truncate">{item.nombre}</p>
                    <p className="text-xs text-amber-500 mt-1">${(item.precio * item.cantidad).toLocaleString('es-AR')}</p>
                  </div>

                  <div className="flex items-center gap-2 bg-zinc-900 rounded-lg p-1 shrink-0">
                    <button
                      onClick={() => cambiarCantidad(item.id, item.cantidad - 1)}
                      className="w-8 h-8 rounded-md bg-zinc-800 text-white text-sm hover:bg-zinc-700 flex items-center justify-center"
                    >
                      −
                    </button>
                    <span className="text-sm font-bold text-white w-6 text-center">{item.cantidad}</span>
                    <button
                      onClick={() => cambiarCantidad(item.id, item.cantidad + 1)}
                      className="w-8 h-8 rounded-md bg-zinc-800 text-white text-sm hover:bg-zinc-700 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => quitarItem(item.id)}
                    className="shrink-0 w-8 h-8 flex items-center justify-center text-zinc-600 hover:text-red-400 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Total y Botón Pagar (Fijo abajo) */}
            <div className="px-5 py-6 bg-zinc-900/40 border-t border-zinc-800/80">
              <div className="flex items-center justify-between mb-4">
                <span className="text-zinc-400 uppercase text-xs font-mono tracking-wider">Total</span>
                <span className="text-white font-black text-2xl">${total().toLocaleString('es-AR')}</span>
              </div>

              <button
                onClick={handleEnviarPedido}
                disabled={items.length === 0}
                className="w-full py-4 rounded-xl flex items-center justify-center
                  bg-gradient-to-r from-[#ff4500] to-amber-400
                  text-sm font-black uppercase tracking-[0.15em] text-zinc-950
                  disabled:opacity-30 disabled:cursor-not-allowed
                  transition-transform active:scale-[0.98]"
              >
                Enviar pedido
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}