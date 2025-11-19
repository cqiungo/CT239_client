export interface Room {
    id: string;
    name: string;
    host: string;
    players: string[];
    gameState: number[];
    isFull : boolean;
}