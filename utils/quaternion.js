import {
  dot,
  cross,
  normalize
} from './vector'

export const NULL_QUAT = [0, 0, 0, 1]

export function rotation(a, b) {
  if (!a) {
    a = NULL_QUAT
  }

  if (!b) {
    b = NULL_QUAT
  }

  return normalize([...cross(a, b), 1 + dot(a, b)])
}

export function invert(q) {
  if(!q) {
    q = NULL_QUAT
  }

  return [q[0], q[1], q[2], -q[3]]
}

export function slerp(...quaternions) {
  const t = 1 / quaternions.length

  quaternions = quaternions.map(normalize)

  let omega, cos, scale

  cos = quaternions.reduce((a, b) => {
    if (!a) {
      return b
    }

    return [
			a[0] * b[0],
			a[1] * b[1],
			a[2] * b[2],
			a[3] * b[3]
		]
  }).reduce((sum, value) => sum += value, 0)

  omega = Math.acos(cos)
  scale = Math.sin(t * omega)

  const slerp = quaternions.reduce((a, b) => {
    return [
			a[0] + b[0] * scale,
			a[1] + b[1] * scale,
			a[2] + b[2] * scale,
			a[3] + b[3] * scale
		]
  }, NULL_QUAT)

  return normalize(slerp)
}

export function product(a, ...qs) {
  if(!a) {
    a = NULL_QUAT
  }

  const product = qs.reduce((a, b) => {
    if(!b) {
      b = NULL_QUAT
    }

    return [
			a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
			a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
			a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
			a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]
		]
  }, a)

  return product
}

export function compute2(v, sin, cos) {
  const sin2 = Math.sqrt(.5 - cos / 2)
  const cos2 = Math.sqrt(.5 + cos / 2)

  return [sin2 * v[0], sin2 * v[1], sin2 * v[2], sin < 0 ? -1 * cos2 : cos2]
}

export function computeFromMatrix(m) {
  let q = new Array(4)
  let t = m[0] + m[4] + m[8] + 1
  let s

  if (t > 0) {
    s = .5 / Math.sqrt(t)
    q[0] = (m[7] - m[5]) * s
    q[1] = (m[2] - m[6]) * s
    q[2] = (m[3] - m[1]) * s
    q[3] = .25 / s
  } else if (m[0] > m[4] && m[0] > m[8]) {
    s = Math.sqrt(1 + m[0] - m[4] - m[8]) * 2
    q[0] = .5 / s
    q[1] = (m[1] + m[3]) / s
    q[2] = (m[2] + m[6]) / s
    q[3] = (m[5] + m[7]) / s
  } else if (m[4] > m[0] && m[4] > m[8]) {
    s = Math.sqrt(1 + m[4] - m[0] - m[8]) * 2
    q[0] = (m[1] + m[3]) / s
    q[1] = .5 / s
    q[2] = (m[5] + m[7]) / s
    q[3] = (m[2] + m[6]) / s
  } else {
    s = Math.sqrt(1 + m[8] - m[0] - m[4]) * 2
    q[0] = (m[2] + m[6]) / s
    q[1] = (m[5] + m[7]) / s
    q[2] = .5 / s
    q[3] = (m[1] + m[3]) / s
  }

  return q
}
