import { createContext, useContext, useRef, useState, useEffect, type ReactNode } from 'react'
import gsap from 'gsap'
import * as THREE from 'three'

export type Seccion = 'home' | 'ventana' | 'viajando'

interface CoordSet {
  posicion: [number, number, number]
  target: [number, number, number]
}

interface ColeccionCoordenadas {
  home: CoordSet
  ventana: CoordSet
  puntoMedio: [number, number, number]
}

const BREAKPOINT_MOBILE = 768

const COORDENADAS_DESKTOP: ColeccionCoordenadas = {
  home: {
    posicion: [8.22, 2.49, 12.48],
    target: [5.21, 0.47, -0.59]
  },
  ventana: {
    posicion: [4.39, 1.45, -4.27],
    target: [2.23, 0.85, -4.45]
  },
  puntoMedio: [6.53, 1.43, -1.46] 
}

const COORDENADAS_MOBILE: ColeccionCoordenadas = {
  home: {
    posicion: [10.67, 2.65, 21.82],
    target: [3.10, 1.57, -0.77]
  },
  ventana: {
    posicion: [5.35, 1.08, -3.94],
    target: [-0.72, 1.71, -5.43]
  },
  puntoMedio: [6.74, 1.29, -1.80] 
}

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
  modelo3DRef: React.MutableRefObject<THREE.Group | null>
  seccion: Seccion
  seccionRef: React.MutableRefObject<Seccion>
  modeloListo: boolean
  setModeloListo: (valor: boolean) => void
  manejarViajeCamara: (haciaDonde: 'home' | 'ventana') => void
  coordenadasRef: React.MutableRefObject<ColeccionCoordenadas>
}

const EscenaContext = createContext<EscenaContextValue | null>(null)

export function EscenaProvider({ children }: { children: ReactNode }) {
  const controlsRef = useRef<any>(null)
  const modelo3DRef = useRef<THREE.Group | null>(null)
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

  // 🔒 Bloquear los controles desde el inicio si existen
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = false
    }
  }, [modeloListo])

  // 📋 EFECTO INICIAL: Apilar los menús
  useEffect(() => {
    if (modeloListo && modelo3DRef.current && seccion === 'home') {
      const menu1 = modelo3DRef.current.getObjectByName('menu1')
      const menu2 = modelo3DRef.current.getObjectByName('manu2')
      const menu3 = modelo3DRef.current.getObjectByName('menu3')

      if (menu1 && menu2 && menu3) {
        menu1.frustumCulled = false
        menu2.frustumCulled = false
        menu3.frustumCulled = false

        if (!menu1.userData.posOriginal) menu1.userData.posOriginal = menu1.position.clone()
        if (!menu2.userData.posOriginal) menu2.userData.posOriginal = menu2.position.clone()
        if (!menu3.userData.posOriginal) menu3.userData.posOriginal = menu3.position.clone()

        menu1.position.copy(menu2.position).add(new THREE.Vector3(0, 0.01, 0.01))
        menu3.position.copy(menu2.position).add(new THREE.Vector3(0, 0.02, 0.02))
      }
    }
  }, [modeloListo])

  const manejarViajeCamara = (haciaDonde: 'home' | 'ventana') => {
    if (!controlsRef.current) return
    if (seccionRef.current === 'viajando') return

    const controls = controlsRef.current
    const camera = controls.object as THREE.PerspectiveCamera

    setSeccion('viajando')
    seccionRef.current = 'viajando'

    tlRef.current?.kill()
    
    // 🔒 Nos aseguramos de que sigan desactivados por las dudas
    controls.enabled = false 

    const coordenadas = coordenadasRef.current
    const destino = coordenadas[haciaDonde]
    const estaEntrando = haciaDonde === 'ventana'

    const posInicial = camera.position.clone()
    const posFinal = new THREE.Vector3(...destino.posicion)
    const posMedio = new THREE.Vector3(...coordenadas.puntoMedio)

    const curvaCamara = new THREE.CatmullRomCurve3(
      [posInicial, posMedio, posFinal],
      false,
      'centripetal',
      0.5
    )

    const targetInicial = controls.target.clone()
    const targetFinal = new THREE.Vector3(...destino.target)
    
    const targetActual = new THREE.Vector3()
    const posicionCamaraActual = new THREE.Vector3() 

    const viaje = { progreso: 0 }

    const tl = gsap.timeline({
      onComplete: () => {
        setSeccion(haciaDonde)
        seccionRef.current = haciaDonde
        controls.target.copy(targetFinal)
        controls.update()
        // ❌ Eliminado: controls.enabled = true (Ya no dejamos que el usuario tome el control)
      }
      // ❌ Eliminado: onInterrupt (Ya no hace falta reactivarlo si se interrumpe)
    })
    tlRef.current = tl

    // 🎥 1. Animación de la cámara fluida
    tl.to(
      viaje,
      {
        progreso: 1,
        duration: 2.7,
        ease: 'power2.inOut',
        onUpdate: () => {
          curvaCamara.getPointAt(viaje.progreso, posicionCamaraActual)
          camera.position.copy(posicionCamaraActual)

          targetActual.lerpVectors(targetInicial, targetFinal, viaje.progreso)
          camera.lookAt(targetActual)
        }
      },
      0
    )

    // 🚪 Animación del portón
    if (modelo3DRef.current) {
      const porton = modelo3DRef.current.getObjectByName('porton')
      const menu1 = modelo3DRef.current.getObjectByName('menu1')
      const menu2 = modelo3DRef.current.getObjectByName('manu2')
      const menu3 = modelo3DRef.current.getObjectByName('menu3')

      if (porton) {
        porton.frustumCulled = false
        const momentoInicioPorton = estaEntrando ? 0.45 : 1

        tl.to(
          porton.position,
          {
            x: estaEntrando ? 9.49472 : 7.09975,
            duration: 1.2,
            ease: 'power2.inOut'
          },
          momentoInicioPorton
        )
      }

      if (menu1 && menu2 && menu3 && menu1.userData.posOriginal) {
        const posApilada1 = menu2.userData.posOriginal.clone().add(new THREE.Vector3(0, 0.01, 0.01))
        const posApilada3 = menu2.userData.posOriginal.clone().add(new THREE.Vector3(0, 0.02, 0.02))

        if (estaEntrando) {
          // 📋 2. Desplegamos los menús
          tl.to(
            menu1.position,
            {
              x: menu1.userData.posOriginal.x,
              y: menu1.userData.posOriginal.y,
              z: menu1.userData.posOriginal.z,
              duration: 1,
              ease: 'back.out(1.2)' 
            },
            2.7
          )

          tl.to(
            menu3.position,
            {
              x: menu3.userData.posOriginal.x,
              y: menu3.userData.posOriginal.y,
              z: menu3.userData.posOriginal.z,
              duration: 1,
              ease: 'back.out(1.2)'
            },
            2.7
          )
        } else {
          // 📋 3. Apilamos los menús
          tl.to(
            menu1.position,
            {
              x: posApilada1.x,
              y: posApilada1.y,
              z: posApilada1.z,
              duration: 0.8,
              ease: 'power2.inOut'
            },
            2.7
          )

          tl.to(
            menu3.position,
            {
              x: posApilada3.x,
              y: posApilada3.y,
              z: posApilada3.z,
              duration: 0.8,
              ease: 'power2.inOut'
            },
            2.7
          )
        }
      }
    }
  }

  return (
    <EscenaContext.Provider
      value={{
        controlsRef,
        modelo3DRef,
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