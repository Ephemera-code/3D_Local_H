import { createContext, useContext, useRef, useState, useEffect, type ReactNode } from 'react'
import gsap from 'gsap'

export type Seccion = 'home' | 'ventana' | 'viajando'

// 📐 Tus coordenadas perfectas (pensadas para desktop / aspect ancho)
export const COORDENADAS = {
  home: {
    posicion: [9.2, 2, 9] as [number, number, number],
    target: [5.2, 0.01, -1.5] as [number, number, number]
  },
  ventana: {
    posicion: [5, 1.25, -3.2] as [number, number, number],
    target: [3.74, 1.17, -4.23] as [number, number, number]
  }
}

interface EscenaContextValue {
  controlsRef: React.MutableRefObject<any>
  seccion: Seccion
  seccionRef: React.MutableRefObject<Seccion>
  modeloListo: boolean
  setModeloListo: (valor: boolean) => void
  manejarViajeCamara: (haciaDonde: 'home' | 'ventana') => void
}

const EscenaContext = createContext<EscenaContextValue | null>(null)

export function EscenaProvider({ children }: { children: ReactNode }) {
  const controlsRef = useRef<any>(null)
  const [seccion, setSeccion] = useState<Seccion>('home')
  const seccionRef = useRef<Seccion>(seccion)
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const [modeloListo, setModeloListo] = useState(false)

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
    const destino = haciaDonde === 'ventana' ? COORDENADAS.ventana : COORDENADAS.home

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
      value={{ controlsRef, seccion, seccionRef, modeloListo, setModeloListo, manejarViajeCamara }}
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