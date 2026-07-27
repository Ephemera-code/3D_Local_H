import { useGLTF, useTexture } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useEscena } from '@/context/EscenaContext'

const MODEL_URL = '/models/Hambre_3d_WEB_2-v7.glb'

const BAKED_TEXTURES = [
  { meshName: 'mesada_fuera001', texturePath: '/textures/Textura_1_2.webp' },
  { meshName: 'Textura_2', texturePath: '/textures/Textura_2.webp' },
  { meshName: 'Textura_3', texturePath: '/textures/Textura_3.webp' },
  { meshName: 'Textura_4', texturePath: '/textures/Textura_4.webp' },
  { meshName: 'menu1', texturePath: '/textures/Textura_5.webp' },
  { meshName: 'manu2', texturePath: '/textures/Textura_5.webp' },
  { meshName: 'menu3', texturePath: '/textures/Textura_5.webp' },
] as const

function configureTexture(texture: THREE.Texture) {
  texture.flipY = false
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 16
}

function applyBakedTextures(model: THREE.Group, textures: THREE.Texture[]) {
  const textureByName = new Map<string, THREE.Texture>(
    BAKED_TEXTURES.map(({ meshName }, index) => [meshName, textures[index]]),
  )

  model.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return

    const meshName = child.name
    const texture = textureByName.get(meshName)
    if (!texture) return

    const material = new THREE.MeshBasicMaterial({ map: texture })

    if (meshName === 'menu1' || meshName === 'manu2' || meshName === 'menu3') {
      material.color = new THREE.Color(1.8, 1.8, 1.8) 
    }

    child.material = material
  })
}

interface RotatingShapeProps {
  onListo?: () => void
}

export function RotatingShape({ onListo }: RotatingShapeProps) {
  const { modelo3DRef } = useEscena()
  const { scene: modeloScene } = useGLTF(MODEL_URL, true)
  const textures = useTexture(BAKED_TEXTURES.map(({ texturePath }) => texturePath))
  const { gl, scene, camera } = useThree()
  const yaAviso = useRef(false)

  const model = useMemo(() => {
    const clonedScene = modeloScene.clone()

    textures.forEach(configureTexture)
    applyBakedTextures(clonedScene, textures)

    return clonedScene
  }, [modeloScene, textures])

  // 🧹 Asignación segura con función de limpieza para evitar referencias fantasma
  useEffect(() => {
    modelo3DRef.current = model

    return () => {
      modelo3DRef.current = null
    }
  }, [model, modelo3DRef])

  useEffect(() => {
    if (yaAviso.current) return
    yaAviso.current = true

    gl.compile(scene, camera)
    onListo?.()
  }, [gl, scene, camera, onListo])

  return <primitive object={model} position={[0, -1.2, 0]} scale={1.1} />
}

useGLTF.preload(MODEL_URL)
useTexture.preload(BAKED_TEXTURES.map(({ texturePath }) => texturePath))