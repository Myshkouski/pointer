import {
	COMMA,
	SPACE,
	OPEN_BRACKET,
	CLOSE_BRACKET
} from './symbols'

export function createNullMatrix() {
	return new Array(16).fill(0)
}

export function createIdentityMatrix() {
	const matrix = createNullMatrix()

	matrix[0] = matrix[5] = matrix[10] = matrix[15] = 1

	return matrix
}

export function createMatrixFromArray(matrix = createNullMatrix()) {
	if (matrix.length === 6) {
		let _matrix = createIdentityMatrix()
		_matrix[0] = matrix[0]
		_matrix[1] = matrix[1]
		_matrix[4] = matrix[2]
		_matrix[5] = matrix[3]
		_matrix[12] = matrix[4]
		_matrix[13] = matrix[5]

		matrix = _matrix
	} else if (matrix.length !== 16) {
		throw new Error('Invalid matrix length: ' + matrix.length)
	}

	return matrix
}

const tokens = ['matrix', '3d']
const re = new RegExp('^' + OPEN_BRACKET + tokens[0] + CLOSE_BRACKET + OPEN_BRACKET + tokens[1] + CLOSE_BRACKET + '?(.*)')

export function createMatrixFromString(string) {
	const match = string.match(re)

	let matrix
	if (match) {
		matrix = match[3].match(/-?([\d\.]+)(e-?\d+)?/g).map(value => parseFloat(value))
	} else {
		matrix = createIdentityMatrix()
	}

	return createMatrixFromArray(matrix)
}

export function stringifyMatrix(matrix) {
	matrix = createMatrixFromArray(matrix)

	return tokens[0] + tokens[1] + OPEN_BRACKET + matrix.join(COMMA) + CLOSE_BRACKET
}
