'use client'
import { Canvas } from "@react-three/fiber";
import { Billboard, OrbitControls, Sky, Center, Text3D } from "@react-three/drei"
import Table from "@/components/Table";
import FlowerPot from "@/components/Flower";
import Coin from "@/components/Coin";
import { useState } from "react";
import { bestMove } from "@/utils/Bot";
import { randomGame } from "@/utils/randomGameState";
import ifont from '@/font/Inter_Italic.json'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Room from "@/components/Room";
import { Bloom, EffectComposer, Outline } from "@react-three/postprocessing";

export default function GameLayout() {
  
  const spacing = 1.5
  const [initialConfig, setInitialConfig] = useState(randomGame())
  const [items, setItems] = useState(
    initialConfig.map((count) => Array(count).fill(true))
  )
  const [selected, setSelected] = useState<{ row: number; cols: number[] } | null>(null)
  const [winner, setWinner] = useState<null | "Người chơi" | "Máy">(null)
  const [score, setScore] = useState({ player: 0, ai: 0 })

  const countCoins = (state: boolean[][]) =>
    state.reduce((sum, row) => sum + row.filter(Boolean).length, 0)

  const handleSelect = (row: number, col: number) => {
    if (!items[row][col] || winner) return

    setSelected((prev) => {
      if (!prev || prev.row !== row) {
        return { row, cols: [col] }
      }
      const exists = prev.cols.includes(col)
      return {
        row,
        cols: exists ? prev.cols.filter((c) => c !== col) : [...prev.cols, col],
      }
    })
  }

  const handleConfirm = () => {
    if (!selected || winner) return

    // Player move
    let newItems = items.map((rowItems, r) =>
      r === selected.row
        ? rowItems.map((alive, c) =>
            selected.cols.includes(c) ? false : alive
          )
        : rowItems
    )

    if (countCoins(newItems) === 0) {
      setWinner("Người chơi")
      setScore((prev) => ({ ...prev, player: prev.player + 1 }))
      setItems(newItems)
      setSelected(null)
      return
    }

    // BOT move
    const piles = newItems.map((row) => row.filter(Boolean).length)
    const move = bestMove(piles)
    if (move) {
      let removed = 0
      newItems = newItems.map((rowItems, r) =>
        r === move.pileIndex
          ? rowItems.map((alive) => {
              if (alive && removed < move.take) {
                removed++
                return false
              }
              return alive
            })
          : rowItems
      )
    }

    if (countCoins(newItems) === 0) {
      setWinner("Máy")
      setScore((prev) => ({ ...prev, ai: prev.ai + 1 }))
    }

    setItems(newItems)
    setSelected(null)
  }

  const handleRestart = () => {
  const newConfig = randomGame()
  setInitialConfig(newConfig)
  setItems(newConfig.map((count) => Array(count).fill(true)))
  setSelected(null)
  setWinner(null)
}

  return (
    <>
      {winner && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded shadow-lg text-lg font-bold z-10">
          🎉 {winner} thắng cuộc!
          <button
            onClick={handleRestart}
            className="ml-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Chơi lại
          </button>
        </div>
      )}

      <Canvas 
        onContextMenu={(e) => {
          e.preventDefault()
          handleConfirm()
        }}
        style={{
          background: "lightblue",
          width: "100vw",
          height: "100vh",
        }}
        camera={{ position: [0, 15, 15], fov: 60 }}
      >
        <Center position={[0, 10, 0]}>
          <Text3D
          font={ifont}
          height={0.5} 
          bevelEnabled 
          curveSegments={32}
          bevelSize={0.04}
          bevelThickness={0.1}
          lineHeight={0.5}
          letterSpacing={-0.06}
          size={1.5}>
          {`${score.player} : ${score.ai}`}
          <meshNormalMaterial />
          </Text3D>
      </Center>

        <axesHelper args={[5]} />
        <ambientLight intensity={Math.PI / 2} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          decay={0}
          intensity={Math.PI}
        />
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
        {/* <Center top left>
          <Text3D>NIM GAME</Text3D>
        </Center> */}

        <Table position={[1.2,4.5,0]} />
        <Room scale={8} position={[16, 0, 5]} rotation={[0, 0, 0]} />

        {items.map((rowItems, row) => {
          const rowLength = rowItems.length
          return rowItems.map((alive, col) => {
            if (!alive) return null
            const x = col - rowLength / 2 + 2
            const z = (row - initialConfig.length / 2 + 0.5) * spacing
            const isSelected =
              selected?.row === row && selected.cols.includes(col)

            return (
              <Coin
                key={`${row}-${col}`}
                position={[x, 5.5, z]}
                selected={isSelected}
                onClick={() => handleSelect(row, col)}
              />
            )
          })
        })}
        <group>
          
        </group>

        <Sky sunPosition={[100, 20, 100]} />
        <fog attach="fog" args={["#a0d6b4", 15, 60]} />
        <OrbitControls enableZoom enablePan enableRotate 
        minAzimuthAngle={-Math.PI / 4}
        maxAzimuthAngle={Math.PI / 4}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI/3}
        />
      </Canvas>
    </>
  )
}
