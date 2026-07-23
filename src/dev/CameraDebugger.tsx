import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { RotatingShape } from '../components/scene/RotatingShape'

// 📸 Herramienta de calibración de cámara — montala temporalmente (ver
// instrucciones al final del archivo) cuando necesites encontrar nuevas
// coordenadas para COORDENADAS.home / COORDENADAS.ventana en EscenaContext.
//
// Controles: click+arrastrar = orbitar · click derecho+arrastrar = pan ·
// scroll = zoom. Cuando encuentres el encuadre que te gusta, tocá el botón:
// loguea la posición de cámara + el target en la consola, YA formateados en
// la sintaxis que usa COORDENADAS, y los copia al portapapeles.
export function CameraDebugger() {
  const controlsRef = useRef<any>(null)
  const [copiado, setCopiado] = useState(false)

  // 🖱️➡️⌨️ Alternativa robusta al pan con click derecho: mantené Shift y
  // arrastrá con el click IZQUIERDO. Esto evita depender del botón derecho
  // del mouse, que a veces es interceptado antes de llegar al navegador por
  // drivers de mouse (gamer, utilidades de Windows) o extensiones — en esos
  // casos ni siquiera se ve el menú contextual, porque el evento nunca llega.
  useEffect(() => {
    const alPresionar = (e: KeyboardEvent) => {
      if (e.key !== 'Shift' || !controlsRef.current) return
      controlsRef.current.mouseButtons.LEFT = THREE.MOUSE.PAN
    }
    const alSoltar = (e: KeyboardEvent) => {
      if (e.key !== 'Shift' || !controlsRef.current) return
      controlsRef.current.mouseButtons.LEFT = THREE.MOUSE.ROTATE
    }

    window.addEventListener('keydown', alPresionar)
    window.addEventListener('keyup', alSoltar)
    return () => {
      window.removeEventListener('keydown', alPresionar)
      window.removeEventListener('keyup', alSoltar)
    }
  }, [])

  const loguearCoordenadas = () => {
    if (!controlsRef.current) return

    const camera = controlsRef.current.object as THREE.PerspectiveCamera
    const target = controlsRef.current.target as THREE.Vector3

    const bloque =
      `posicion: [${camera.position.x.toFixed(2)}, ${camera.position.y.toFixed(2)}, ${camera.position.z.toFixed(2)}] as [number, number, number],\n` +
      `target: [${target.x.toFixed(2)}, ${target.y.toFixed(2)}, ${target.z.toFixed(2)}] as [number, number, number]`

    console.log('%c📸 Coordenadas actuales de cámara', 'color:#f59e0b;font-weight:bold;font-size:12px')
    console.log(bloque)
    console.log('%cFOV actual:', 'color:#f59e0b', camera.fov.toFixed(1))

    navigator.clipboard?.writeText(bloque).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 1500)
    })
  }

  return (
    <div className="relative h-dvh w-full bg-zinc-950 overflow-hidden">
      <button
        onClick={loguearCoordenadas}
        className="absolute top-4 left-4 z-50 rounded-lg bg-amber-500 px-4 py-2 font-bold text-zinc-950 shadow-lg transition-all hover:bg-amber-400 active:scale-95"
      >
        {copiado ? '✅ Copiado al portapapeles' : '📋 Loguear coordenadas'}
      </button>

      <div className="absolute top-4 right-4 z-50 rounded-lg bg-zinc-900/80 px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-zinc-400 text-right leading-relaxed">
        Arrastrar: orbitar
        <br />
        Click derecho: pan
        <br />
        Shift + arrastrar: pan (alternativa)
        <br />
        Scroll: zoom
      </div>

      <Canvas
        camera={{ position: [9, 2, 9], fov: 80 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.5
        }}
      >
        <color attach="background" args={['#000000']} />

        {/* Ayudas visuales de referencia — el origen y una grilla en el suelo
            son muy útiles para ubicarte mientras orbitás */}
        <axesHelper args={[5]} />
        <gridHelper args={[30, 30, '#333333', '#1a1a1a']} />

        <Suspense fallback={null}>
          <RotatingShape />
        </Suspense>

        {/* enabled (sin la prop en false) = control TOTAL, a diferencia del
            uso en producción donde va enabled={false}. mouseButtons explícito
            para que el remapeo dinámico de Shift (más arriba) tenga un
            estado base claro sobre el cual alternar. */}
        <OrbitControls
          ref={controlsRef}
          makeDefault
          mouseButtons={{
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN
          }}
        />
      </Canvas>
    </div>
  )
}