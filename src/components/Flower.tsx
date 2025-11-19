'use client'
import { Canvas, ThreeElements } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import React, { useEffect } from 'react'
import * as THREE from 'three'
function FlowerPotModel() {
  const { scene } = useGLTF("https://wayizhojrtgepgaihluv.supabase.co/storage/v1/object/public/my-models/Flower%20Pot.glb")
  return <primitive object={scene} scale={2} />
}

export default function FlowerPot(props: ThreeElements['mesh']) {
  return (
    <mesh
    position={[10,6,4]} 
      scale={3.5}>
        <FlowerPotModel  />
    </mesh>
  )
}
