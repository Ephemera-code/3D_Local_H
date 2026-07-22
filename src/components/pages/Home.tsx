import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { HomeOverlay } from '../../components/scene/HomeOverlay'
import { useEscena } from '../../context/EscenaContext'

export function Home() {
  const navigate = useNavigate()
  const navegandoRef = useRef(false)
  const { seccion, manejarViajeCamara, modeloListo } = useEscena()

  return (
    // pointer-events-none en el contenedor para que los clicks/drag lleguen
    // al Canvas de Experiencia3D (que está debajo, fixed) salvo en los
    // elementos interactivos puntuales (pointer-events-auto en cada uno).
    <div className="relative h-dvh w-full overflow-hidden pointer-events-none">
      <HomeOverlay visible={seccion === 'home' && modeloListo} />

      {/* Contenedor inferior de acciones: barras full-width apiladas, como
          en el boceto de Figma. "Hacer Pedido" es la acción principal
          (degradado naranja/rojo, protagonista); "Galería" es la secundaria
          (más discreta, outline). */}
      <div className="absolute bottom-0 left-0 right-0 z-40 flex flex-col pointer-events-none">
        {seccion === 'home' && modeloListo && (
          <>
            {/* BOTÓN PRINCIPAL: HACER PEDIDO */}
            <button
              onClick={() => manejarViajeCamara('ventana')}
              className="pointer-events-auto w-full py-5 flex items-center justify-center
                bg-gradient-to-r from-[#ff4500] to-amber-400
                text-sm md:text-base font-black uppercase tracking-[0.2em] text-zinc-950
                shadow-[0_-8px_24px_-8px_rgba(255,69,0,0.4)]
                transition-transform duration-200 active:scale-[0.98]"
            >
              Hacer Pedido
            </button>

            {/* BOTÓN SECUNDARIO: GALERÍA — discreto, debajo del principal */}
            <button
              onClick={() => {
                if (navegandoRef.current) return
                navegandoRef.current = true
                navigate('/galeria')
              }}
              className="pointer-events-auto w-full py-4 flex items-center justify-center
                bg-zinc-900/90 backdrop-blur-md border-t border-zinc-800/80
                text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-zinc-300
                transition-colors duration-200 hover:text-white hover:bg-zinc-800/90 active:scale-[0.98]"
            >
              Galería
            </button>
          </>
        )}

        {/* BOTÓN: VOLVER AFUERA (Visible en sección ventana) — mismo ancho
            completo, para mantener coherencia con el resto de los estados */}
        {seccion === 'ventana' && (
          <button
            onClick={() => manejarViajeCamara('home')}
            className="pointer-events-auto w-full py-5 flex items-center justify-center
              bg-zinc-900/90 backdrop-blur-md border-t border-zinc-800/80
              text-sm font-black uppercase tracking-[0.2em] text-white
              transition-colors duration-200 hover:bg-zinc-800/90 active:scale-[0.98]"
          >
            ← Volver afuera
          </button>
        )}

        {/* ESTADO: VIAJANDO */}
        {seccion === 'viajando' && (
          <span
            className="pointer-events-auto w-full py-5 flex items-center justify-center
              bg-zinc-900/70 backdrop-blur-md border-t border-zinc-800/80
              text-xs font-bold uppercase tracking-[0.25em] text-zinc-400 animate-pulse"
          >
            Yendo al mostrador...
          </span>
        )}
      </div>
    </div>
  )
}