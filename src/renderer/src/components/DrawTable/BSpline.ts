// B 样条插值的计算函数
export function calculateBSpline(points, degree = 3, numPoints = 100) {
  const n = points.length
  const knots = generateNonRepeatingKnots(n, degree)
  console.log(knots)

  const curve: { x: number; y: number }[] = []

  // 计算 B 样条曲线
  for (let t = 0; t <= 1; t += 1 / numPoints) {
    const x = getBSplineValue(
      t,
      points.map((p) => p.x),
      knots,
      degree
    )
    const y = getBSplineValue(
      t,
      points.map((p) => p.y),
      knots,
      degree
    )
    curve.push({ x, y })
  }

  return curve
}

// 生成节点
function generateKnots(n, degree) {
  const knots: number[] = []
  for (let i = 0; i <= n + degree; i++) {
    knots.push(i / (n + degree))
  }
  return knots
}
// 生成非重复的开放节点向量
function generateNonRepeatingKnots(n, degree) {
  const knots: number[] = []

  // 前 degree 个节点为 0
  for (let i = 0; i < degree; i++) {
    knots.push(0)
  }

  // 中间的节点在 (0, 1) 之间均匀分布
  for (let i = degree; i < n; i++) {
    knots.push((i - degree) / (n - degree)) // 保证中间节点均匀分布，不重复
  }

  // 后 degree 个节点为 1
  for (let i = 0; i < degree; i++) {
    knots.push(1)
  }

  return knots
}

// 生成开放节点（避免首尾相连）
function generateOpenKnots(n, degree) {
  const knots: number[] = []

  // 创建一个开放 B 样条的节点
  for (let i = 0; i <= n + degree; i++) {
    // 避免将首尾点连接，生成开放的节点序列
    if (i < degree) {
      knots.push(0) // 前面节点全为 0
    } else if (i >= n) {
      knots.push(1) // 后面节点全为 1
    } else {
      knots.push((i - degree) / (n - degree + 1)) // 中间节点是均匀分布的
    }
  }

  return knots
}
// 计算 B 样条基函数值
function getBSplineValue(t, controlPoints, knots, degree) {
  const n = controlPoints.length
  let value = 0
  for (let i = 0; i < n; i++) {
    value += controlPoints[i] * basisFunction(t, i, degree, knots)
  }
  return value
}

// 计算 B 样条基函数
function basisFunction(t, i, degree, knots) {
  if (degree === 0) {
    return t >= knots[i] && t < knots[i + 1] ? 1 : 0
  } else {
    const denom1 = knots[i + degree] - knots[i]
    const denom2 = knots[i + degree + 1] - knots[i + 1]
    const part1 = denom1 ? (t - knots[i]) / denom1 : 0
    const part2 = denom2 ? (knots[i + degree + 1] - t) / denom2 : 0
    return (
      part1 * basisFunction(t, i, degree - 1, knots) +
      part2 * basisFunction(t, i + 1, degree - 1, knots)
    )
  }
}
