import { OrbitControls, useProgress } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { Suspense, useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { RotatingShape } from './RotatingShape'
import { useEscena, type Seccion } from '@/context/EscenaContext'
import * as THREE from 'three'

const FOV_BASE = 75
const ASPECT_REFERENCIA = 16 / 9
const FOV_MAXIMO = 80

function calcularFovVertical(aspect: number): number {
  if (aspect >= ASPECT_REFERENCIA) return FOV_BASE

  const fovBaseRad = THREE.MathUtils.degToRad(FOV_BASE)
  const hFovDeseado = 2 * Math.atan(Math.tan(fovBaseRad / 2) * ASPECT_REFERENCIA)
  const vFovNuevo = 2 * Math.atan(Math.tan(hFovDeseado / 2) / aspect)

  return Math.min(THREE.MathUtils.radToDeg(vFovNuevo), FOV_MAXIMO)
}

function Loader({ listo }: { listo: boolean }) {
  const { progress } = useProgress()
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (listo) {
      const timer = setTimeout(() => setVisible(false), 400)
      return () => clearTimeout(timer)
    }
  }, [listo])

  if (!visible) return null

  return (
    <div
      className={`absolute inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 transition-all duration-700 ease-in-out ${
        listo ? 'opacity-0 pointer-events-none' : 'opacity-100'
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

function ControladorCamara({
  controlsRef,
  seccionRef,
  coordenadasRef
}: {
  controlsRef: React.MutableRefObject<any>
  seccionRef: React.MutableRefObject<Seccion>
  coordenadasRef: React.MutableRefObject<{
    home: { posicion: [number, number, number]; target: [number, number, number] }
    ventana: { posicion: [number, number, number]; target: [number, number, number] }
  }>
}) {
  const { camera, size } = useThree()

  useEffect(() => {
    const aspect = size.width / size.height
    const camaraPerspectiva = camera as THREE.PerspectiveCamera

    camaraPerspectiva.fov = calcularFovVertical(aspect)
    camera.updateProjectionMatrix()

    if (seccionRef.current === 'viajando') return

    const destino =
      seccionRef.current === 'ventana' ? coordenadasRef.current.ventana : coordenadasRef.current.home

    camera.position.set(...destino.posicion)
    if (controlsRef.current) {
      controlsRef.current.target.set(...destino.target)
      controlsRef.current.update()
    } else {
      camera.lookAt(...destino.target)
    }
  }, [camera, controlsRef, size.width, size.height, seccionRef, coordenadasRef])

  return null
}

export function Experiencia3D() {
  const location = useLocation()
  const { controlsRef, seccionRef, modeloListo, setModeloListo, coordenadasRef } = useEscena()
  
  const galeriaAbierta = location.pathname === '/galeria'
  const manejarModeloListo = useCallback(() => setModeloListo(true), [setModeloListo])

  return (
    <div className="fixed inset-0" aria-hidden={galeriaAbierta}>
      <Loader listo={modeloListo} />

      <Canvas
        dpr={[1, 2]}
        frameloop={galeriaAbierta ? 'never' : 'always'}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.5
        }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault()
            console.warn('Contexto WebGL perdido.')
          })
        }}
      >
        <color attach="background" args={['#000000']} />
        <ControladorCamara controlsRef={controlsRef} seccionRef={seccionRef} coordenadasRef={coordenadasRef} />
        
        <Suspense fallback={null}>
          <RotatingShape onListo={manejarModeloListo} />
        </Suspense>

        <OrbitControls ref={controlsRef} makeDefault enabled={false} />
      </Canvas>
    </div>
  )
}