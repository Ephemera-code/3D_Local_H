import { useGLTF, useTexture } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

const MODEL_URL = '/models/Hambre_3d_WEB-v1.glb'

const BAKED_TEXTURES = [
  { meshName: 'mesada_fuera001', texturePath: '/textures/Textura_1_2.webp' },
  { meshName: 'Textura_2', texturePath: '/textures/Textura_2.webp' },
  { meshName: 'Textura_3', texturePath: '/textures/Textura_3.webp' },
  { meshName: 'Textura_4', texturePath: '/textures/Textura_4.webp' },
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
    if (!(child instanceof THREE.Mesh)) {
      return
    }

    const meshName = child.name
    const texture = textureByName.get(meshName)
    if (!texture) {
      return
    }

    child.material = new THREE.MeshBasicMaterial({ map: texture })
  })
}

interface RotatingShapeProps {
  // Se llama recién cuando el modelo YA está adjunto a la escena real y la
  // GPU terminó de compilar sus shaders/texturas — momento seguro para
  // esconder el Loader sin que quede el hueco de antes.
  onListo?: () => void
}

export function RotatingShape({ onListo }: RotatingShapeProps) {
  // Ojo: renombramos el 'scene' del GLTF a 'modeloScene' para no pisar el
  // 'scene' de useThree(), que es la escena raíz de Three.js que necesitamos
  // para gl.compile().
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

  useEffect(() => {
    if (yaAviso.current) return
    yaAviso.current = true

    // En este punto el <primitive> de abajo YA fue adjuntado al scene graph
    // real (R3F lo hace durante el commit, antes de que corran los efectos),
    // así que gl.compile ve los materiales/texturas reales y los compila —
    // sin esta garantía de orden, se compilaba "en vacío" y no servía de nada.
    gl.compile(scene, camera)
    onListo?.()
  }, [gl, scene, camera, onListo])

  return <primitive object={model} position={[0, -1.2, 0]} scale={1.1} />
}


useGLTF.preload(MODEL_URL)
useTexture.preload(BAKED_TEXTURES.map(({ texturePath }) => texturePath))