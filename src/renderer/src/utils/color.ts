export function randomHexColor(): string {
  const n = Math.floor(Math.random() * 0xffffff) // 0 ~ 16777215
  return `#${n.toString(16).padStart(6, '0')}` // 转成6位十六进制
}

export function randomHslColor(): string {
  const h = Math.floor(Math.random() * 360)
  const s = 70 + Math.random() * 30 // 70–100%
  const l = 40 + Math.random() * 20 // 40–60%
  return `hsl(${h}, ${s}%, ${l}%)`
}
