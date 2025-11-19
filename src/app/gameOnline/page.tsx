"use client"
import { Canvas, useThree } from "@react-three/fiber"
import { OrbitControls, Sky } from "@react-three/drei"
import Table from "@/components/Table"
import FlowerPot from "@/components/Flower"
import Coin from "@/components/Coin"
import { useEffect, useState, useCallback } from "react"
import { socket } from "@/socket"
import { useRoomStore } from "@/store/roomStore"
import { Button } from "@/components/ui/button"
import {useRouter} from "next/navigation"
import Room from "@/components/Room"

interface room{
  gameState: number[]
  host:string
  id:string
  isFull:boolean
  name:string
  players: string[]
  scores: Scores
}
interface Scores {
  [playerName: string]: number;
}
export default function GameLayoutOnline() {
  const [isLoading, setIsLoading] = useState(false)
  const [playerJoined, setPlayerJoined] = useState(false)
  const { roomId, player } = useRoomStore()
  const [initialConfig, setInitialConfig] = useState<number[]>([])
  const [currentPlayer, setCurrentPlayer] = useState<string>(player ?? "")
  const [room, setRoom] = useState<room>()
  const spacing = 1.5 
  function PlayerCamera({ currentPlayer }: { currentPlayer: string }) {
  const { camera } = useThree()
  useEffect(() => {
    if (player === room?.host) {
      camera.position.set(0, 10, 15)   // góc nhìn player 1
      camera.lookAt(0, 10, 0)
    } else {
      camera.position.set(0, 10, -15)  // góc nhìn player 2
      camera.lookAt(0, 10, 0)
    }
  }, [currentPlayer, camera])

  return null
}

  // items là state hiện tại của trò chơi (2D boolean array)
  const [items, setItems] = useState<boolean[][]>(() =>
    initialConfig.map((count) => Array(count).fill(true)),
  )
  const [selected, setSelected] = useState<{ row: number; cols: number[] } | null>(null)
  const [winner, setWinner] = useState<null | "Người chơi 1" | "Người Chơi 2">(null)
  const router = useRouter()
  // Khi initialConfig thay đổi, cập nhật items tương ứng
  useEffect(() => {
    if (initialConfig && initialConfig.length > 0) {
      setItems(initialConfig.map((count) => Array(count).fill(true)))
    } else {
      setItems([])
    }
  }, [initialConfig])

  // Handlers socket: đăng ký 1 lần (mount) và hủy khi unmount
  useEffect(() => {
    const onDisconnect = () => {
      console.log("Disconnected:", socket.id)
    }

    const onGameState = (state: number[] | undefined) => {
      if (Array.isArray(state)) {
        setInitialConfig(state)
      } else {
        setInitialConfig([])
      }
    }

    const onRoomUpdate = (room: any) => {
      console.log("roomUpdate", room)
    }

    const onPlayerJoined = (data: any) => {
      setRoom(data)
      const players = Array.isArray(data?.players) ? data.players : []
      const gs = Array.isArray(data?.gameState) ? data.gameState : []
      if (players.length === 2) {
        setPlayerJoined(true)
        // nếu server gán host field thì dùng host, nếu không thì lấy player đầu
        setCurrentPlayer(data.host ?? players[0])
        setInitialConfig(gs)
      } else {
        setPlayerJoined(false)
      }
    }
    const scoreUpdate = (data:any)=>{
      console.log("Score: ",data);
      setRoom(prev => prev ? { ...prev, scores: data.scores } : prev);
    }
    const onRestartGame = (data: any) => {
      console.log("restartGame:", data);

      if (Array.isArray(data)) {
        // cập nhật lại state trò chơi
        setInitialConfig(data);
        setItems(data.map((count: number) => Array(count).fill(true)));
      }

      setSelected(null);
      setWinner(null);

      // reset lại lượt chơi
      if (data?.currentPlayer) {
        setCurrentPlayer(data.currentPlayer);
      }
    };

    const onMove = (data: any) => {
      console.log("Move", data)
      if (Array.isArray(data?.newItems)) {
        setItems(data.newItems)
      }
      const nextPlayer =
      player !== data.player
        ? player // đến lượt mình
        : room?.players?.find((p: string) => p !== player) ?? ""
      setCurrentPlayer(nextPlayer ?? "")
      console.log("Room in onMove", room)
      if (data?.player && Array.isArray(data?.newItems)) {
        const countCoins = (state: boolean[][]) => state.reduce((sum, row) => sum + row.filter(Boolean).length, 0)
        if (countCoins(data.newItems) === 0) {
          setWinner(data.player)
        }
      }
    }

    const onPlayerLeft = (data: any) => {
      console.log("playerLeft", data)
      setPlayerJoined(false)
    }
    
    socket.on("disconnect", onDisconnect)
    socket.on("gameState", onGameState)
    socket.on("roomUpdate", onRoomUpdate)
    socket.on("playerJoined", onPlayerJoined)
    socket.on("Move", onMove)
    socket.on("playerLeft", onPlayerLeft)
    socket.on("newGame",onRestartGame)
    socket.on('updateScore',scoreUpdate)
    const handleBeforeUnload = () => {
      // gửi object rõ ràng
      socket.emit("leaveRoom", { roomId, player })
    }
    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      socket.off("disconnect", onDisconnect)
      socket.off("gameState", onGameState)
      socket.off("roomUpdate", onRoomUpdate)
      socket.off("playerJoined", onPlayerJoined)
      socket.off("Move", onMove)
      socket.off("playerLeft", onPlayerLeft)
      socket.off("restartGame", onRestartGame);
      socket.off('updateScore',scoreUpdate)
    }
  }, [player, roomId])

  // Emit getRoomById mỗi khi roomId có (handlers đã đăng ký ở effect phía trên)
  useEffect(() => {
    if (!roomId) return
    socket.emit("getRoomById", roomId)
  }, [roomId])

  const countCoins = useCallback((state: boolean[][]) => state.reduce((sum, row) => sum + row.filter(Boolean).length, 0), [])

  const handleSelect = (row: number, col: number) => {
    if (player !== currentPlayer) return
    if (!items[row] || !items[row][col] || winner) return

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
    if (player !== currentPlayer) return
    let newItems = items.map((rowItems, r) =>
      r === selected.row ? rowItems.map((alive, c) => (selected.cols.includes(c) ? false : alive)) : rowItems,
    )

    setIsLoading(true)
    socket.emit("makeMove", { newItems, player, roomId }, () => {
      setIsLoading(false)
    })

    if (countCoins(newItems) === 0) {
      setWinner("Người chơi 1")
      socket.emit("winnerMove",{
            ...room,
            winner: room?.players[0]
          })
      setItems(newItems)
      setSelected(null)
      return  
    }

    setItems(newItems)
    socket.emit("winnerMove",{
            ...room,
            winner: room?.players[1]
          })
    setSelected(null)
  }
  const handleLeaveroom = ()=>{
    router.push('/room')
    socket.emit("leaveRoom",{roomId,player})
  }
  const handleRestart = () => {
    socket.emit('restart',{roomId})
    setSelected(null)
    setWinner(null)
  }

  return (
    <>
      {winner && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded shadow-lg text-lg font-bold z-10">
          🎉 {winner} thắng cuộc!
          <button onClick={handleRestart} className="ml-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
            Chơi lại
          </button>
        </div>
      )}

      {!playerJoined && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="bg-white px-8 py-6 rounded-lg shadow-2xl text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Đang chờ người chơi...</h2>
            <p className="text-gray-600 text-sm">Vui lòng đợi người chơi khác tham gia</p>
          </div>
        </div>
      )}

      {player === currentPlayer ? (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded shadow-lg text-lg font-bold z-10">
          🎉 Đến lượt bạn!
        </div>
      ) : (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded shadow-lg text-lg font-bold z-10">
          🎉 Đến lượt đối phương
        </div>
      )}
      <Button onClick={handleLeaveroom} className="absolute cursor-pointer top-5 left-1/15 px-4 py-2 rounded shadow-lg text-lg font-bold z-10">
        Rời phòng
      </Button>
      <Canvas
        onContextMenu={handleConfirm}
        style={{
          background: "lightblue",
          width: "100vw",
          height: "100vh",
        }}
        camera={{ position: [0, 0, 15], fov: 60 }}
      > 
        <PlayerCamera currentPlayer={currentPlayer} />
        <axesHelper args={[5]} />
        <ambientLight intensity={Math.PI / 2} />
        <gridHelper args={[40, 40]} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />

        <Table position={[1.2, 4.5, 0]} />
        <Room scale={8} position={[16, 0, 5]} rotation={[0, 0, 0]} />

        {items.map((rowItems, row) => {
          const rowLength = rowItems.length
          return rowItems.map((alive, col) => {
            if (!alive) return null
            const x = col - rowLength / 2 + 2
            const z = (row - (initialConfig.length / 2) + 0.5) * spacing
            const isSelected = selected?.row === row && selected.cols.includes(col)

            return (
              <Coin key={`${row}-${col}`} position={[x, 5.5, z]} selected={isSelected} onClick={() => handleSelect(row, col)} />
            )
          })
        })}

        <Sky sunPosition={[100, 20, 100]} />
        <OrbitControls enableZoom enablePan enableRotate 
        minAzimuthAngle={-Math.PI / 4}
        maxAzimuthAngle={Math.PI / 4}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI - Math.PI / 6}
        />
      </Canvas>
    </>
  )
}
