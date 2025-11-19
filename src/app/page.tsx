"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Bot, Play, Settings } from "lucide-react"
import { useNavigate } from "react-router";
import Link from "next/link";
export default function GameMenu() {
  const handlePlayWithHuman = () => {
    console.log("Starting game with human player")
  }

  const handlePlayWithComputer = () => {
    console.log("Starting game with computer")
    // Add navigation logic here
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4 text-balance">Chọn Chế Độ Chơi</h1>
          <p className="text-lg text-muted-foreground text-pretty">Bạn muốn thách đấu với ai hôm nay?</p>
        </div>

        {/* Game Mode Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Play with Human */}
          <Card className="relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer border-2 hover:border-primary/50">
            <div className="p-8 h-80 flex flex-col items-center justify-center text-center">
              <div className="mb-6 relative">
                <div className="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-accent/30 transition-colors">
                  <Users className="w-12 h-12 text-accent" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-accent-foreground" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-card-foreground mb-3">Chơi với Người</h2>
              <p className="text-muted-foreground mb-6 text-pretty">
                Thách đấu trực tiếp với bạn bè hoặc người chơi khác. Trải nghiệm cảm giác hồi hộp trong từng nước đi.
              </p>

              <Link href={"/room"}>
                <Button
                onClick={handlePlayWithHuman}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                size="lg"
              >
                <Play className="w-4 h-4 mr-2" />
                Bắt Đầu Chơi
              </Button>
              </Link>
            </div>
          </Card>

          {/* Play with Computer */}
          <Card className="relative overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer border-2 hover:border-primary/50">
            <div className="p-8 h-80 flex flex-col items-center justify-center text-center">
              <div className="mb-6 relative">
                <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                  <Bot className="w-12 h-12 text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-card-foreground mb-3">Chơi với Máy</h2>
              <p className="text-muted-foreground mb-6 text-pretty">
                Thử thách bản thân với AI thông minh. Nhiều mức độ khó khác nhau để bạn lựa chọn.
              </p>

              <Link href={"/game"}>
                <Button
                onClick={handlePlayWithComputer}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                size="lg"
              >
                <Play className="w-4 h-4 mr-2" />
                Bắt Đầu Chơi
              </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Additional Options */}
        {/* <div className="flex justify-center">
          <Button variant="outline" size="lg" className="border-border hover:bg-secondary/50 bg-transparent">
            <Settings className="w-4 h-4 mr-2" />
            Cài Đặt Game
          </Button>
        </div> */}
      </div>
    </div>
  )
}
