import { OrbitControls, useProgress } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { Suspense, useRef, useEffect, useState } from 'react'
import { RotatingShape } from './RotatingShape'
import * as THREE from 'three'
import gsap from 'gsap'

// 📐 Tus coordenadas perfectas (pensadas para desktop / aspect ancho)
const COORDENADAS = {
  home: {
    posicion: [8, 2, 8.67] as [number, number, number],
    target: [5.20, 0.01, -1.50] as [number, number, number]
  },
  ventana: {
    posicion: [5.05, 1.39, -3.85] as [number, number, number],
    target: [3.74, 1.17, -4.23] as [number, number, number]
  }
}

// 🖥️ Aspect ratio de referencia para el cual ajustaste las coordenadas de arriba.
// Si las armaste mirando la escena en un monitor 16:9, dejá este valor.
const ASPECT_REFERENCIA = 16 / 9

// 📱 Por debajo de este aspect (pantallas angostas / mobile vertical) empezamos
// a alejar la cámara para que la composición no se corte.
type CoordSet = { posicion: [number, number, number]; target: [number, number, number] }

/**
 * Aleja la cámara del target manteniendo la misma dirección de mirada,
 * en proporción a cuánto más angosto es el aspect actual respecto al de referencia.
 * Esto evita tener que armar sets de coordenadas manuales por breakpoint:
 * la composición "se abre" automáticamente en pantallas verticales.
 */
function getCoordenadasResponsive(base: CoordSet, aspect: number): CoordSet {
  if (aspect >= ASPECT_REFERENCIA) {
    // Pantalla igual o más ancha que la referencia: se usa tal cual
    return base
  }

  // Factor de "alejamiento". El cálculo de factorCrudo (ASPECT_REFERENCIA / aspect)
  // es matemáticamente el correcto para preservar el ancho visible de la escena
  // sin recortarla (a mayor achicamiento del aspect, más lejos va la cámara).
  // El tope solo existe como salvaguarda para aspects absurdamente extremos
  // (ej. un iframe angostísimo) — subilo si en algún dispositivo real seguís
  // viendo recorte. Preferí "se ve más chico / más aire" antes que "se corta".
  const factorCrudo = ASPECT_REFERENCIA / aspect
  const factor = Math.min(factorCrudo, 4.5) // tope de alejamiento, ajustable

  const posicion = new THREE.Vector3(...base.posicion)
  const target = new THREE.Vector3(...base.target)

  const direccion = posicion.clone().sub(target).multiplyScalar(factor)
  const nuevaPosicion = target.clone().add(direccion)

  return {
    posicion: [nuevaPosicion.x, nuevaPosicion.y, nuevaPosicion.z],
    target: [target.x, target.y, target.z]
  }
}

// ⏳ COMPONENTE LOADER PREMIUM (Bloquea la pantalla hasta que Three.js termine el bake)
function Loader() {
  const { progress } = useProgress()
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (progress === 100) {
      const timer = setTimeout(() => setVisible(false), 500)
      return () => clearTimeout(timer)
    }
  }, [progress])

  if (!visible) return null

  return (
    <div
      className={`absolute inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 transition-all duration-700 ease-in-out ${
        progress === 100 ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-zinc-800"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-amber-500 animate-spin"></div>
          <span className="absolute inset-0 flex items-center justify-center text-xl">🍔</span>
        </div>

        <div className="text-center">
          <h3 className="font-black tracking-widest text-white uppercase text-sm">HAMBRE</h3>
          <p className="text-xs font-mono text-zinc-500 mt-1 uppercase tracking-wider">
            Horneando los bakes... {Math.round(progress)}%
          </p>
        </div>

        <div className="h-[2px] w-32 bg-zinc-900 rounded-full overflow-hidden mt-2">
          <div
            className="h-full bg-amber-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// 🎮 Controlador de cámara: setea posición inicial Y reacciona a cambios de tamaño
function ControladorCamara({
  controlsRef,
  seccionRef
}: {
  controlsRef: React.MutableRefObject<any>
  seccionRef: React.MutableRefObject<'home' | 'ventana' | 'viajando'>
}) {
  const { camera, size } = useThree()
  const primerMontaje = useRef(true)

  useEffect(() => {
    // Si estamos en medio de una transición gsap, no pisamos la posición
    if (seccionRef.current === 'viajando') return

    const base = seccionRef.current === 'ventana' ? COORDENADAS.ventana : COORDENADAS.home
    const aspect = size.width / size.height
    const destino = getCoordenadasResponsive(base, aspect)

    camera.position.set(...destino.posicion)
    if (controlsRef.current) {
      controlsRef.current.target.set(...destino.target)
      controlsRef.current.update()
    } else {
      camera.lookAt(...destino.target)
    }
    camera.updateProjectionMatrix()

    primerMontaje.current = false
    // Se re-ejecuta en cada resize (size.width/height cambian) y al montar
  }, [camera, controlsRef, size.width, size.height, seccionRef])

  return null
}

export function Scene() {
  const controlsRef = useRef<any>(null)
  const [seccion, setSeccion] = useState<'home' | 'ventana' | 'viajando'>('home')
  const seccionRef = useRef(seccion)
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  // Mantenemos un ref sincronizado para poder leerlo dentro de ControladorCamara
  // sin tener que meter `seccion` en las dependencias de ese efecto (evitaría loops)
  useEffect(() => {
    seccionRef.current = seccion
  }, [seccion])

  // Cleanup: si el componente se desmonta a mitad de una animación, la matamos
  useEffect(() => {
    return () => {
      tlRef.current?.kill()
    }
  }, [])

  const manejarViajeCamara = (haciaDonde: 'home' | 'ventana') => {
    if (!controlsRef.current) return

    const camera = controlsRef.current.object
    const target = controlsRef.current.target

    // Usamos el tamaño actual del canvas para calcular el destino correcto
    const canvasEl = camera as THREE.PerspectiveCamera
    const aspect = canvasEl.aspect || window.innerWidth / window.innerHeight

    setSeccion('viajando')
    const base = haciaDonde === 'ventana' ? COORDENADAS.ventana : COORDENADAS.home
    const destino = getCoordenadasResponsive(base, aspect)

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
    <div className="relative h-dvh w-full overflow-hidden bg-zinc-950">
      <Loader />

      <div className="absolute top-6 left-6 z-40">
        {seccion === 'home' && (
          <button
            onClick={() => manejarViajeCamara('ventana')}
            className="rounded-xl bg-amber-500 px-6 py-3 font-bold text-zinc-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 active:scale-95"
          >
            Pedir un Combo 🍔
          </button>
        )}

        {seccion === 'ventana' && (
          <button
            onClick={() => manejarViajeCamara('home')}
            className="rounded-xl bg-zinc-800 px-6 py-3 font-bold text-white shadow-lg transition-all hover:bg-zinc-700 active:scale-95"
          >
            ← Volver afuera
          </button>
        )}

        {seccion === 'viajando' && (
          <span className="rounded-xl bg-zinc-900/50 border border-zinc-800 px-6 py-3 font-medium text-zinc-400 text-sm tracking-wider animate-pulse backdrop-blur-sm">
            YENDO AL MOSTRADOR...
          </span>
        )}
      </div>

      <Canvas
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1
        }}
      >
        <color attach="background" args={['#09090b']} />

        <ControladorCamara controlsRef={controlsRef} seccionRef={seccionRef} />

        <Suspense fallback={null}>
          <RotatingShape />
        </Suspense>

        <OrbitControls ref={controlsRef} makeDefault enabled={false} />
      </Canvas>
    </div>
  )
}