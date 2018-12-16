export const NULL_VECTOR_3 = [0, 0, 0]
export const NULL_VECTOR_4 = [0, 0, 0, 0]

export function dot(a, b) {
  if (!a) {
    a = NULL_VECTOR_4
  }

  if (!b) {
    b = NULL_VECTOR_4
  }

  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

export function invert(v) {
  const iv = []

  for (const n of v) {
    iv.push(-n)
  }

  return iv
}

export function cross(a, b) {
  if (!a) {
    a = NULL_VECTOR_4
  }

  if (!b) {
    b = NULL_VECTOR_4
  }

  return [
		a[1] * b[2] - a[2] * b[1],
		a[2] * b[0] - a[0] * b[2],
		a[0] * b[1] - a[1] * b[0]
	]
}

export function sum(...vectors) {
  return vectors.reduce((sum, vector) => {
    if (vector) {
      for (let index in vector) {
        if (index in sum) {
          sum[index] += vector[index]
        } else {
          sum[index] = vector[index]
        }
      }
    }

    return sum
  }, [])
}

export function computeVectorLength(vector) {
  return Math.sqrt(vector.reduce((sum, value) => {
    return sum + Math.pow(value, 2)
  }, 0))
}

export function normalize(vector) {
  let length = computeVectorLength(vector)

  if (length) {
    vector = vector.map(v => v / length)
  }

  return vector
}
