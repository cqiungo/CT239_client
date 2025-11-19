'use client'
import { Canvas, ThreeElements, useFrame } from "@react-three/fiber"
import React, { useRef, useState } from "react"
export default function Item({
  position,
  selected,
  onClick,
}: {
  position: [number, number, number]
  selected: boolean
  onClick: () => void
}) {
  return (
    <mesh position={position} onClick={onClick}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={selected ? 'hotpink' : 'orange'} />
    </mesh>
  )
}
