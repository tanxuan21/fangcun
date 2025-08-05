interface point {
  x: number
  y: number
}
const sort_point = (from_pos: point, to_pos: point) => {
  const nw = {
    x: from_pos.x < to_pos.x ? from_pos.x : to_pos.x,
    y: from_pos.y < to_pos.y ? from_pos.y : to_pos.y
  }
  const se = {
    x: from_pos.x > to_pos.x ? from_pos.x : to_pos.x,
    y: from_pos.y > to_pos.y ? from_pos.y : to_pos.y
  }
  return {
    nw,
    se
  }
}

// 矩形包含，r1 包含 r2
const rectangle_contain = (_r1: rect, _r2: rect) => {
  const r1 = sort_point(_r1.nw, _r1.se)
  const r2 = sort_point(_r2.nw, _r2.se)

  return r1.nw.x < r2.nw.x && r1.nw.y < r2.nw.y && r1.se.x > r2.se.x && r1.se.y > r2.se.y
}

export interface rect {
  nw: point
  se: point
}
// 矩形相交
const rectangle_intersection = (_r1: rect, _r2: rect) => {
  const r1 = sort_point(_r1.nw, _r1.se)
  const r2 = sort_point(_r2.nw, _r2.se)
  if (r1.nw.y > r2.se.y) return false // north
  if (r1.se.y < r2.nw.y) return false // south
  if (r1.nw.x > r2.se.x) return false
  if (r1.se.x < r2.nw.x) return false
  return true
}
export { sort_point, rectangle_contain, rectangle_intersection }
