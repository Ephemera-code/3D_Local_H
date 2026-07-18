import { useGLTF, useTexture } from '@react-three/drei'
import { useMemo } from 'react'
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

export function RotatingShape() {
  const { scene } = useGLTF(MODEL_URL, true)
  const textures = useTexture(BAKED_TEXTURES.map(({ texturePath }) => texturePath))

  const model = useMemo(() => {
    const clonedScene = scene.clone()

    textures.forEach(configureTexture)
    applyBakedTextures(clonedScene, textures)

    return clonedScene
  }, [scene, textures])

  return <primitive object={model} position={[0, -1.2, 0]} scale={1.1} />
}


useGLTF.preload(MODEL_URL)
useTexture.preload(BAKED_TEXTURES.map(({ texturePath }) => texturePath))