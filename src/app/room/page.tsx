"use client"

import type React from "react"
import {useRouter} from 'next/navigation';
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gamepad2, Users, Zap, ArrowRight, Clock, Play } from "lucide-react"
import { socket } from "@/socket";
import { Room } from "@/types/Room"
import { generateRoomCode } from "@/utils/genCode"
import { data } from "react-router"
import { useRoomStore } from "@/store/roomStore"
import { randomGame } from "@/utils/randomGameState";
const existingRooms : Room[] = [
]

export default function JoinRoom() {
  const {setRoomInfo} = useRoomStore();
  const [roomCode, setRoomCode] = useState("")
  const [playerName, setPlayerName] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [room, setRoom] = useState<null | Room>(null)
  const [view, setView] = useState<"manual" | "browse">("browse")
  const [roomList, setRoomList] = useState<Room[]>([]);
  const router = useRouter();
  useEffect(() => {
    socket.on("roomList", (rooms: Room[]) => {
      console.log("Received roomList:", rooms);
      setRoomList(rooms);
    });
    socket.emit("getRooms");
    socket.on('roomList',(data)=>{
    setRoom(data);
  })

    return () => {
      socket.off("roomList");
    };
  },[]);
  socket.on('roomFull',()=>{
    alert("Room is full");
  })
  
  const createRoom = () =>{
    console.log("Creating room",room);
    setRoomInfo(room?.id as string, room?.host as string)
    if (room) {
      room.gameState = [];
    }
    if(room!.id){
      console.log(room)
      socket.emit('createRoom',room)
      router.push('/gameOnline')
    }
  }
  const handleJoinRoom = async (selectedRoomId?: string) => {
    const finalRoomCode = selectedRoomId || roomCode
    console.log("Joining room",finalRoomCode);
    console.log("Player name:",playerName);
    if (!finalRoomCode.trim() || !playerName.trim()) return
    const JOIN_PLAYER ={roomId:finalRoomCode, playerName:playerName}
    setRoomInfo(finalRoomCode,playerName)
    socket.emit('joinRoom',JOIN_PLAYER);

    setTimeout(() => {
      console.log("[v0] Joining room:", finalRoomCode, "as player:", playerName)
    }, 2000)
    router.push('/gameOnline')
  }

  const handleQuickJoin = (roomId: string) => {
    handleJoinRoom(roomId)
  }
  socket.on('roomCreate',(data)=>{
    socket.on('roomList',(data)=>{

    setRoom(data);
    console.log("Room list:",data);
  })
  })


  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <Gamepad2 className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-balance">Join Game Room</h1>
          <p className="text-muted-foreground text-pretty">Enter your room code and player name to join the action</p>
        </div>
        
        <div className="flex gap-2 p-1 bg-muted/50 rounded-lg">
          <Button
            variant={view === "browse" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("browse")}
            className="flex-1"
          >
            Browse Rooms
          </Button>
          
          <Button
            variant={view === "manual" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("manual")}
            className="flex-1"
            disabled={view === "manual"}
          >
            Enter Code
          </Button>
        </div>

        {/* Player Name Input - Always visible */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <label htmlFor="playerName" className="text-sm font-medium">
                Player Name
              </label>
              <Input
                id="playerName"
                type="text"
                placeholder="Your display name"
                value={room?.host ?? ""}
                onChange={(e) => {
                  setRoom({...room, host: e.target.value} as Room)
                  setPlayerName(e.target.value)
                }}
                maxLength={20}
                className="bg-input/50"
                required
              />
              <label htmlFor="roomName" className="text-sm font-medium">
                Room Name (for creating new room)
              </label>
              <Input
                id="roomName"
                type="text"
                placeholder="Room Name"
                value={room?.name ?? ""}
                onChange={(e) => {
                  setRoom({...room, name: e.target.value} as Room)
                  setRoomCode(e.target.value)
                }}
                maxLength={20}
                className="bg-input/50"
              />
            </div>
          </CardContent>
        </Card>

        {view === "browse" ? (
          // Existing Rooms List
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">Available Rooms</CardTitle>
              <CardDescription>Click to join any available room</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {roomList && roomList.map((room) => (
                  <div
                    key={room.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card/30 hover:bg-card/50 transition-colors"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{room.name}</h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Host: {room.host}</span>
                        <span>Code: {room.id}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        size="sm"
                        onClick={() => handleQuickJoin(room.id)}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {isConnecting ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                        ) : (
                          "Join"
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          // Manual Room Code Entry
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <Users className="h-3 w-3" />
                  Multiplayer
                </Badge>
              </div>
              <div>
                <CardTitle className="text-xl">Room Details</CardTitle>
                <CardDescription>Connect with friends and start playing instantly</CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleJoinRoom();
              }} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="roomCode" className="text-sm font-medium">
                    Room Code
                  </label>
                  <Input
                    id="roomCode"
                    type="text"
                    placeholder="Enter 6-digit room code"
                    value={room?.id ?? ""}
                    onChange={(e) => setRoom({...room, id:e.target.value.toUpperCase()} as Room)}
                    maxLength={6}
                    className="text-center text-lg font-mono tracking-widest bg-input/50"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-base"
                  disabled={isConnecting || !roomCode.trim() || !playerName.trim()}
                >
                  {isConnecting ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                      Connecting...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Join Room
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="space-y-3">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Don't see what you're looking for?</p>
          </div>
          <Button
            variant="outline"
            className="w-full border-border/50 hover:bg-accent/50 bg-transparent"
            onClick={() => {
                // Generate random room code
                const randomCode = generateRoomCode();
                const newRoom: Room = {
                  ...room,
                  id: randomCode,
                  host: room?.host || "Unknown",
                  name: room?.name || "Unnamed Room",
                  players: [room?.host || ""],   // ✅ khởi tạo mảng luôn
                  isFull: false,
                  gameState: [],
                };
                newRoom.isFull = false;
                console.log("newRoom",newRoom);
                setRoom(newRoom);
                createRoom();
              }}          
          >
            Create New Room
          </Button>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Server Online
        </div>
      </div>
    </div>
  )
}
