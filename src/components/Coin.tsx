'use client'
import { useGLTF } from "@react-three/drei"
import { useMemo, useEffect } from "react"
import * as THREE from "three"
import { Selection, Select, EffectComposer, Outline,Bloom } from "@react-three/postprocessing"
import { Float } from "@react-three/drei"

function CoinModel({ selected }: { selected: boolean }) {
  const { scene } = useGLTF(
    "https://wayizhojrtgepgaihluv.supabase.co/storage/v1/object/public/my-models/Coin.glb"
  )

  // Clone scene để mỗi coin độc lập
  const clonedScene = useMemo(() => scene.clone(), [scene])

  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: selected ? "hotpink" : "orange",
        })
      }
    })
  }, [clonedScene, selected])

  return (
    // Scale nhỏ lại (0.5 thay vì 2)
    <primitive object={clonedScene} scale={0.5} rotation={[Math.PI / 2, 0, 0]} />
  )
}

// Coin wrapper
export default function Coin({
  position,
  selected,
  onClick,
}: {
  position: [number, number, number]
  selected: boolean
  onClick: () => void
}) {
  return (
    <group position={position}>
      {/* Coin 3D model */}
      <CoinModel selected={selected} />

      {/* Invisible hitbox */}
      <mesh onClick={onClick}>
        <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  )
}
