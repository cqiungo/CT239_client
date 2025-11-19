'use client'
import { Canvas, ThreeElements } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import React, { useEffect } from 'react'
import * as THREE from 'three'
function TableModel() {
  const { scene } = useGLTF("https://wayizhojrtgepgaihluv.supabase.co/storage/v1/object/public/my-models/Table.glb")
  return <primitive object={scene} scale={2} />
}

export default function Table({ position }: { position: [number, number, number] }) {
  return (
    <mesh
      position={position}
      rotation={[0, Math.PI / 2, 0]}
      scale={[5, 3.5, 5]} // dài hơn + rộng hơn
    >
      <TableModel />
    </mesh>
  )
}
