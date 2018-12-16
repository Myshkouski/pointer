import GenericState from './generic-state'
import config from './config'

import {
	createNullMatrix,
	createIdentityMatrix,
	createMatrixFromArray,
	createMatrixFromString
} from './matrix'

import {
	normalize,
	computeVectorLength
} from './vector'

import {
	computeFromMatrix,
	product,
	rotation
} from './quaternion'

export class TransformState {
	constructor() {
		let matrix
		if (0 in arguments) {
			matrix = arguments[0]
		}

		if (!matrix) {
			matrix = createIdentityMatrix()
		}

		if (typeof matrix === 'string') {
			this.matrix3d = matrix
		} else {
			this.transformMatrix = matrix
		}
	}

	get transformMatrix() {
		const {
			scale3d: s3d,
			translate3d: t3d,
			_quaternion: q3d
		} = this

		const x2 = q3d[0] * q3d[0]
		const y2 = q3d[1] * q3d[1]
		const z2 = q3d[2] * q3d[2]

		const xy = q3d[0] * q3d[1]
		const xz = q3d[0] * q3d[2]
		const yz = q3d[1] * q3d[2]

		const xw = q3d[0] * q3d[3]
		const yw = q3d[1] * q3d[3]
		const zw = q3d[2] * q3d[3]

		return [
			s3d[0] * (1 - 2 * (y2 + z2)), s3d[1] * 2 * (xy - zw), s3d[2] * 2 * (xz + yw), 0,
			s3d[0] * 2 * (xy + zw), s3d[1] * (1 - 2 * (x2 + z2)), s3d[2] * 2 * (yz - xw), 0,
			s3d[0] * 2 * (xz - yw), s3d[1] * 2 * (yz + xw), s3d[2] * (1 - 2 * (x2 + y2)), 0,
			t3d[0], t3d[1], t3d[2], 1
		]
	}
	set transformMatrix(matrix) {
		matrix = createMatrixFromArray(matrix)

		const scale3d = [
			computeVectorLength([matrix[0], matrix[4], matrix[8]]),
			computeVectorLength([matrix[1], matrix[5], matrix[9]]),
			computeVectorLength([matrix[2], matrix[6], matrix[10]])
		]

		const _quaternion = computeFromMatrix([
			scale3d[0] * matrix[0], scale3d[1] * matrix[1], scale3d[2] * matrix[2],
			scale3d[0] * matrix[4], scale3d[1] * matrix[5], scale3d[2] * matrix[6],
			scale3d[0] * matrix[8], scale3d[1] * matrix[9], scale3d[2] * matrix[10]
		])

		const translate3d = matrix.slice(12, 15)

		Object.assign(this, {
			scale3d,
			translate3d,
			_quaternion
		})
	}

	get matrix3d() {
		return `matrix3d(${ this.transformMatrix.join(',') })`
	}
	set matrix3d(value) {
		this.transformMatrix = createMatrixFromString(value)
	}

	get rotateX() {
		const q = this._quaternion
		return Math.atan2(2 * (q[0] * q[3] + q[1] * q[2]), 1 - 2 * (q[2] * q[2] + q[3] * q[3])) % Math.PI
	}
	// set rotateX(angle) {
	// 	this._quaternionX = _computeQuaternion2(axisZ, Math.sin(angle), Math.cos(angle))
	// }

	get rotateY() {
		const q = this._quaternion
		return Math.asin(2 * (q[0] * q[2] - q[3] * q[1])) % Math.PI
	}
	// set rotateY(angle) {
	// 	this._quaternionY = _computeQuaternion2(axisZ, Math.sin(angle), Math.cos(angle))
	// }

	get rotateZ() {
		const q = this._quaternion
		return Math.atan2(2 * (q[0] * q[1] + q[2] * q[3]), 1 - 2 * (q[1] * q[1] + q[2] * q[2])) % Math.PI
	}
	// set rotateZ(angle) {
	// 	this._quaternionZ = _computeQuaternion2(axisZ, Math.sin(angle), Math.cos(angle))
	// }

	get rotate3d() {
		const q3d = this._quaternion
		return [...q3d.slice(0, 3), 2 * Math.acos(q3d[3])]
	}
	set rotate3d(value) {
		this._quaternion = normalize([...value.slice(0, 3), Math.cos(.5 * value[3])])
	}

	get skewX() {
		const q3d = this._quaternion
		return Math.atan(2 * (q3d[0] * q3d[1] + q3d[2] * q3d[3]))
	}

	get skewY() {
		const q3d = this._quaternion
		return Math.atan(2 * (q3d[0] * q3d[1] - q3d[2] * q3d[3]))
	}

	get scaleX() {
		return this.scale3d[0]
	}
	set scaleX(value) {
		this.scale3d[0] = value
	}

	get scaleY() {
		return this.scale3d[1]
	}
	set scaleY(value) {
		this.scale3d[1] = value
	}

	get scaleZ() {
		return this.scale3d[2]
	}
	set scaleZ(value) {
		this.scale3d[2] = value
	}

	get translateX() {
		return this.translate3d[0]
	}
	set translateX(value) {
		this.translate3d[0] = value
	}

	get translateY() {
		return this.translate3d[1]
	}
	set translateY(value) {
		this.translate3d[1] = value
	}

	get translateZ() {
		return this.translate3d[2]
	}
	set translateZ(value) {
		this.translate3d[2] = value
	}
}

export class TransformStateTracker extends GenericState {
	static get limit() {
    return 4
  }

  static get offset() {
    return 2
  }

	update(matrix) {
		const state = new TransformState(matrix)

		return GenericState.prototype.update.call(this, state)
	}
}
