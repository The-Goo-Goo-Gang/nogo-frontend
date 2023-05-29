export const positionToString = (x: number, y: number) => `${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[x]}${y + 1}`

export const stringToPosition = (pos: string) => {
  const x = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(pos[0])
  const y = parseInt(pos.substring(1)) - 1
  return { x, y }
}
