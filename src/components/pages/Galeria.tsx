import { useEffect, useRef, useState, startTransition } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ITEMS } from '@/data/galeriaItems'

// 🖼️ Los assets dentro de /public NO se importan como módulo de JS — Vite los
// sirve directo desde la raíz del sitio. Por eso es un string, no un import.
const LOGO_URL = '/logoH.png'

const INTERVALO_LOOP_MS = 4000
const REANUDAR_LOOP_MS = 8000

export function Galeria() {
  const navigate = useNavigate()
  const [indiceSeleccionado, setIndiceSeleccionado] = useState(0)

  const pausadoRef = useRef(false)
  const timeoutReanudarRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const itemGrande = ITEMS[indiceSeleccionado]

  // Loop automático de la foto principal
  useEffect(() => {
    const id = setInterval(() => {
      if (pausadoRef.current) return
      setIndiceSeleccionado((prev) => (prev + 1) % ITEMS.length)
    }, INTERVALO_LOOP_MS)
    
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    return () => {
      if (timeoutReanudarRef.current) clearTimeout(timeoutReanudarRef.current)
    }
  }, [])

  const seleccionarItem = (indiceReal: number) => {
    setIndiceSeleccionado(indiceReal)
    pausadoRef.current = true
    if (timeoutReanudarRef.current) clearTimeout(timeoutReanudarRef.current)
    timeoutReanudarRef.current = setTimeout(() => {
      pausadoRef.current = false
    }, REANUDAR_LOOP_MS)
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-zinc-950 flex flex-col">
      <button
        onClick={() => startTransition(() => navigate('/'))}
        className="absolute top-6 left-6 z-40 rounded-xl bg-zinc-800 px-6 py-3 font-bold text-white shadow-lg transition-all hover:bg-zinc-700 active:scale-95"
      >
        ← Volver
      </button>

      {/* Fila superior */}
      <div className="flex-1 grid grid-cols-[1.7fr_1fr] gap-3 p-4 pt-24 min-h-0">
        <div className="rounded-2xl overflow-hidden shadow-2xl">
          <FotoPlaceholder imagen={itemGrande.imagen} itemId={itemGrande.id} />
        </div>

        <div className="flex flex-col gap-3 min-h-0">
          
            <h1 className="text-[clamp(5.50rem,3vw,3rem)] FontGaleria uppercase flex items-center justify-center mb-4 tracking-widest text-white m-0 leading-none">
          
          
                {/* Contenedor relativo SOLO para la H y el ícono */}
                <span className="relative inline-block">
                    <span className="inline-block">H</span>
                    {/* El ícono */}
                    <img
                    src={LOGO_URL}
                    alt="Fuego"
                    // Usamos w-[0.8em] para que escale junto con el font-size.
                    // -top y -right en porcentajes para que la posición también sea fluida.
                    className="absolute -top-[50%] -right-[60%] w-[0.8em] h-[0.8em] rotate-45 object-contain"
                    />
                </span>
            </h1>
          <AnimatePresence mode="wait">
            <motion.div
              key={itemGrande.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <p className="font-black uppercase text-center tracking-wide text-white text-[15px] leading-snug mb-2">
                {itemGrande.frase}
              </p>
              <p className="font-mono text-center text-[14px] text-zinc-400 leading-relaxed">
                {itemGrande.parrafo}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* CARRUSEL INFERIOR CON ANIMACIÓN CONTINUA (Marquesina) */}
      <div className="relative w-full overflow-hidden py-2 flex items-center">
        {/* Degradados laterales para que se desvanezca suavemente en los bordes */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-zinc-950 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-zinc-950 to-transparent z-10 pointer-events-none" />

        <motion.div
          className="flex gap-4 px-4 shrink-0"
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            repeat: Infinity,
            ease: 'linear',
            duration: 15, // Velocidad del movimiento (bajalo si querés que vaya más rápido)
          }}
          // Opcional: si querés que se detenga cuando le pasás el mouse por encima
          style={{ width: 'max-content' }}
        >
          {/* Duplicamos el array ITEMS para crear el efecto de loop infinito perfecto */}
          {[...ITEMS, ...ITEMS].map((item, index) => {
            const indiceReal = index % ITEMS.length
            const estaActivo = indiceSeleccionado === indiceReal

            return (
              <button
                key={`${item.id}-${index}`}
                onClick={() => seleccionarItem(indiceReal)}
                className={`relative flex-none w-32 md:w-40 aspect-square rounded-2xl overflow-hidden transition-all duration-300 ${
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

      {/* TÍTULO GIGANTE ABAJO */}
      <div className="px-4 py-6 overflow-hidden flex justify-center">
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
  )
}

function FotoPlaceholder({
  imagen,
  itemId
}: {
  imagen: string
  itemId: string
}) {
  return <img src={imagen} alt={itemId} className="w-full h-full object-cover" />
}