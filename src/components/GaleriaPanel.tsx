import { useEffect, useRef, useState, startTransition } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ITEMS } from '@/data/galeriaItems'

const LOGO_URL = '/logoH.png'
const INTERVALO_LOOP_MS = 4000
const REANUDAR_LOOP_MS = 8000

export function GaleriaPanel() {
  const location = useLocation()
  const navigate = useNavigate()
  const abierta = location.pathname === '/galeria'
  const panelRef = useRef<HTMLDivElement>(null)

  const [indiceSeleccionado, setIndiceSeleccionado] = useState(0)
  const pausadoRef = useRef(false)
  const timeoutReanudarRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const itemGrande = ITEMS[indiceSeleccionado]

  useEffect(() => {
    if (!abierta) return
    const id = setInterval(() => {
      if (pausadoRef.current) return
      setIndiceSeleccionado((prev) => (prev + 1) % ITEMS.length)
    }, INTERVALO_LOOP_MS)
    return () => clearInterval(id)
  }, [abierta])

  useEffect(() => {
    return () => {
      if (timeoutReanudarRef.current) clearTimeout(timeoutReanudarRef.current)
    }
  }, [])

  useEffect(() => {
    const el = panelRef.current
    if (!el) return
    if (abierta) {
      el.removeAttribute('inert')
    } else {
      el.setAttribute('inert', '')
    }
  }, [abierta])

  const seleccionarItem = (indiceReal: number) => {
    setIndiceSeleccionado(indiceReal)
    pausadoRef.current = true
    if (timeoutReanudarRef.current) clearTimeout(timeoutReanudarRef.current)
    timeoutReanudarRef.current = setTimeout(() => {
      pausadoRef.current = false
    }, REANUDAR_LOOP_MS)
  }

  return (
    <motion.div
      ref={panelRef}
      className="fixed inset-0 z-50 bg-zinc-950 overflow-hidden transform-gpu will-change-transform"
      initial={false}
      animate={{ x: abierta ? '0%' : '100%' }}
      transition={{ duration: 0.5, ease: [0.65, 0, 0.35, 1] }}
      style={{ pointerEvents: abierta ? 'auto' : 'none' }}
    >
      {/* 🖼️ Fondo: la foto grande ocupa TODA la pantalla, con crossfade suave
          al cambiar de ítem (seleccionado a mano o por el loop automático).
          Los degradados oscuros arriba/abajo son solo para que el texto que
          va encima siga siendo legible sobre cualquier foto. */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="sync">
          <motion.img
            key={itemGrande.id}
            src={itemGrande.imagen}
            alt={itemGrande.nombre}
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        </AnimatePresence>
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
      </div>

      {/* Volver — arriba a la derecha, para no competir con el header H+nombre */}
      <button
        onClick={() => startTransition(() => navigate('/'))}
        className="absolute top-20 right-4 z-30 rounded-xl bg-zinc-800/80 backdrop-blur-md px-6 py-3 font-bold text-white shadow-lg transition-all hover:bg-zinc-700 active:scale-95"
      >
        ← Volver
      </button>

      {/* Header: H + nombre del plato que se está mostrando ahora mismo */}
      <div className="absolute top-8 left-5 z-30 flex items-center gap-2.5">
        <span className="relative inline-block text-white FontGaleria text-3xl uppercase leading-none">
          <span className="inline-block">H</span>
          <img
            src={LOGO_URL}
            alt="Fuego"
            className="absolute -top-[50%] -right-[60%] w-[0.8em] h-[0.8em] rotate-45 object-contain"
          />
        </span>
        <AnimatePresence mode="wait">
          <motion.span
            key={itemGrande.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 6 }}
            transition={{ duration: 0.25 }}
            className="font-black uppercase text-white text-md tracking-wide"
          >
            {itemGrande.titulo}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Bloque inferior: carrusel de miniaturas + título gigante, ambos
          flotando sobre el degradado oscuro del fondo. */}
      <div className="absolute bottom-0 inset-x-0 z-30 flex flex-col">
        {/* CARRUSEL CONTINUO (Marquesina) */}
        <div className="relative w-full overflow-hidden py-2 flex items-center">
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-zinc-950/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-zinc-950/80 to-transparent z-10 pointer-events-none" />

          <motion.div
            className="flex gap-4 px-4 shrink-0"
            animate={abierta ? { x: ['0%', '-50%'] } : {}}
            transition={{
              repeat: Infinity,
              ease: 'linear',
              duration: 15
            }}
            style={{ width: 'max-content' }}
          >
            {[...ITEMS, ...ITEMS].map((item, index) => {
              const indiceReal = index % ITEMS.length
              const estaActivo = indiceSeleccionado === indiceReal

              return (
                <button
                  key={`${item.id}-${index}`}
                  onClick={() => seleccionarItem(indiceReal)}
                  className={`relative flex-none w-24 md:w-32 aspect-square rounded-2xl overflow-hidden transition-all duration-300 ${
                    estaActivo
                      ? 'ring-2 ring-amber-500 scale-105 shadow-lg shadow-amber-500/30 opacity-100'
                      : 'opacity-40 hover:opacity-80 scale-95'
                  }`}
                >
                  <FotoPlaceholder imagen={item.imagen} itemId={item.id} />
                </button>
              )
            })}
          </motion.div>
        </div>

        {/* TÍTULO GIGANTE */}
        <div className="px-4 pb-6 pt-2 overflow-hidden flex justify-center">
          <AnimatePresence mode="wait">
            <motion.h2
              key={itemGrande.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35 }}
              className="FontGaleria uppercase text-[15vw] md:text-[8vw] tracking-tighter leading-none bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-600 bg-clip-text text-transparent"
            >
              {itemGrande.nombre}
            </motion.h2>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

function FotoPlaceholder({ imagen, itemId }: { imagen: string; itemId: string }) {
  return <img src={imagen} alt={itemId} className="w-full h-full object-cover" loading="eager" />
}