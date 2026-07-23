import { createContext, useContext, useRef, useState, useEffect, type ReactNode } from 'react'
import gsap from 'gsap'

export type Seccion = 'home' | 'ventana' | 'viajando'

interface CoordSet {
  posicion: [number, number, number]
  target: [number, number, number]
}

interface ColeccionCoordenadas {
  home: CoordSet
  ventana: CoordSet
}

// 📱🖥️ Dos sets de coordenadas explícitos — uno por tipo de dispositivo. Se
// elige automáticamente según el ancho de pantalla (ver useEsMobile más
// abajo). Usá CameraDebugger.tsx en tu celu real para encontrar los valores
// ideales de COORDENADAS_MOBILE.
const BREAKPOINT_MOBILE = 768 // px — mismo criterio que el breakpoint 'md' de Tailwind

// 📐 Tus coordenadas perfectas (pensadas para desktop / aspect ancho)
const COORDENADAS_DESKTOP: ColeccionCoordenadas = {
  home: {
    posicion: [8.62, 2.90, 12.8],
    target: [5.97, 0.80, -0.33]
  },
  ventana: {
    posicion: [4.44, 1.22, -4.01],
    target: [-5.27, -0.60, -5.42]
  }
}

// 🚧 TODO: reemplazar por los valores que encuentres con CameraDebugger.tsx
// probando en un celular real — por ahora son un placeholder igual a desktop.
const COORDENADAS_MOBILE: ColeccionCoordenadas = {
  home: {
    posicion: [12.68, 2.04, 24.23],
    target: [4.35, -0.98, -0.65]
  },
  ventana: {
    posicion: [7.45, 1.80, -3.56],
    target: [-1.28, 1.33, -5.70]
  }
}

// Detecta mobile/desktop por ancho de pantalla y reacciona a resize (por
// ejemplo, si el usuario rota el celular o redimensiona la ventana).
function useEsMobile(breakpoint = BREAKPOINT_MOBILE) {
  const [esMobile, setEsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  )

  useEffect(() => {
    const alRedimensionar = () => setEsMobile(window.innerWidth < breakpoint)
    window.addEventListener('resize', alRedimensionar)
    return () => window.removeEventListener('resize', alRedimensionar)
  }, [breakpoint])

  return esMobile
}

interface EscenaContextValue {
  controlsRef: React.MutableRefObject<any>
  seccion: Seccion
  seccionRef: React.MutableRefObject<Seccion>
  modeloListo: boolean
  setModeloListo: (valor: boolean) => void
  manejarViajeCamara: (haciaDonde: 'home' | 'ventana') => void
  // Ref (no state) para que Experiencia3D pueda leer el set de coordenadas
  // vigente sin causar un re-render extra cada vez que cambia.
  coordenadasRef: React.MutableRefObject<ColeccionCoordenadas>
}

const EscenaContext = createContext<EscenaContextValue | null>(null)

export function EscenaProvider({ children }: { children: ReactNode }) {
  const controlsRef = useRef<any>(null)
  const [seccion, setSeccion] = useState<Seccion>('home')
  const seccionRef = useRef<Seccion>(seccion)
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const [modeloListo, setModeloListo] = useState(false)

  const esMobile = useEsMobile()
  const coordenadasRef = useRef<ColeccionCoordenadas>(
    esMobile ? COORDENADAS_MOBILE : COORDENADAS_DESKTOP
  )

  useEffect(() => {
    coordenadasRef.current = esMobile ? COORDENADAS_MOBILE : COORDENADAS_DESKTOP
  }, [esMobile])

  useEffect(() => {
    seccionRef.current = seccion
  }, [seccion])

  useEffect(() => {
    return () => {
      tlRef.current?.kill()
    }
  }, [])

  const manejarViajeCamara = (haciaDonde: 'home' | 'ventana') => {
    if (!controlsRef.current) return

    const camera = controlsRef.current.object
    const target = controlsRef.current.target

    setSeccion('viajando')
    const destino = coordenadasRef.current[haciaDonde]

    tlRef.current?.kill()
    const tl = gsap.timeline({
      onStart: () => {
        controlsRef.current.update()
      },
      onComplete: () => setSeccion(haciaDonde)
    })
    tlRef.current = tl

    tl.to(
      camera.position,
      {
        x: destino.posicion[0],
        y: destino.posicion[1],
        z: destino.posicion[2],
        duration: 2.2,
        ease: 'power2.inOut'
      },
      0
    )

    tl.to(
      target,
      {
        x: destino.target[0],
        y: destino.target[1],
        z: destino.target[2],
        duration: 2.2,
        ease: 'power2.inOut',
        onUpdate: () => controlsRef.current.update()
      },
      0
    )
  }

  return (
    <EscenaContext.Provider
      value={{
        controlsRef,
        seccion,
        seccionRef,
        modeloListo,
        setModeloListo,
        manejarViajeCamara,
        coordenadasRef
      }}
    >
      {children}
    </EscenaContext.Provider>
  )
}

export function useEscena() {
  const ctx = useContext(EscenaContext)
  if (!ctx) {
    throw new Error('useEscena debe usarse dentro de <EscenaProvider>')
  }
  return ctx
}