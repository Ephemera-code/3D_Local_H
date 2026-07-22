import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import logo from '../../../public/logoH.png'
interface ItemGaleria {
  id: string
  imagen: string
  frase: string
  parrafo: string
  nombre: string
}

const FOTOS = Array.from({ length: 9 }, (_, index) => `/fotos/foto_${index + 1}.webp`)

const ITEMS: ItemGaleria[] = [
  {
    id: 'item-1',
    imagen: FOTOS[0],
    frase: 'El clásico que nunca falla',
    parrafo: 'Carne 100% smash, cheddar derretido, pickles y nuestra salsa de la casa. El favorito de siempre.',
    nombre: 'INSTINTO'
  },
  {
    id: 'item-2',
    imagen: FOTOS[1],
    frase: 'Para los que no se guardan nada',
    parrafo: 'Doble carne, doble cheddar, bacon crocante. Una experiencia sin culpa, directo al hueso.',
    nombre: 'VORAZ'
  },
  {
    id: 'item-3',
    imagen: FOTOS[2],
    frase: 'Fuego lento, sabor intenso',
    parrafo: 'BBQ ahumada, cebolla crispy y provolone fundido sobre carne jugosa a la parrilla.',
    nombre: 'SALVAJE'
  },
  {
    id: 'item-4',
    imagen: FOTOS[3],
    frase: 'Simple, honesto, contundente',
    parrafo: 'Papas gruesas, sal gruesa y nuestra salsa secreta. El acompañante perfecto.',
    nombre: 'CRUJIENTE'
  },
  {
    id: 'item-5',
    imagen: FOTOS[4],
    frase: 'Simple, honesto, contundente',
    parrafo: 'Papas gruesas, sal gruesa y nuestra salsa secreta. El acompañante perfecto.',
    nombre: 'BRUTAL'
  },
  {
    id: 'item-6',
    imagen: FOTOS[5],
    frase: 'Ícono en cada mordida',
    parrafo: 'Un formato potente, visual y sabroso, pensado para exhibir lo que más gusta del local.',
    nombre: 'FUEGO'
  },
  {
    id: 'item-7',
    imagen: FOTOS[6],
    frase: 'Textura y color que invitan',
    parrafo: 'La composición se siente tan bien como se ve, con ese estilo que hace crecer la expectativa.',
    nombre: 'MÁXIMO'
  },
  {
    id: 'item-8',
    imagen: FOTOS[7],
    frase: 'Detalles que marcan la diferencia',
    parrafo: 'Sabor, presentación y presencia. Todo en una sola capa visual.',
    nombre: 'PUNTO'
  },
  {
    id: 'item-9',
    imagen: FOTOS[8],
    frase: 'La energía del local en una sola foto',
    parrafo: 'Cada escena está pensada para reforzar la identidad de la marca y hacerla memorable.',
    nombre: 'TENDENCIA'
  }
]

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
        onClick={() => navigate('/')}
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
                    src={logo}
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