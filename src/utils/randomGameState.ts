export function randomGame() : number[] {
    const row = Math.floor(Math.random()*5)+2
    const rowConfig = []
    for (let i=0;i<row;i++){
        rowConfig.push(Math.floor(Math.random()*10)+1)
    }
    return rowConfig
}