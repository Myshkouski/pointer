import GenericTracker from './generic-state'

import {
	TransformState
} from './transform'

import {
	sum,
	invert as invertV,
	NULL_VECTOR_3
} from './vector'

import {
	POINTER_MOVE,
	POINTER_UP,
	POINTER_CANCEL,
	POINTER_DOWN
} from './event-names'

import Quaternion, {
	rotation,
	slerp,
	product,
	invert
} from './quaternion'

const stateProps = ['client', 'element', 'size', 'tilt', 'pressure', 'timeStamp']
const eventProps = ['clientX', 'clientY', 'offsetX', 'offsetY', 'width', 'height', 'tiltX', 'tiltY', 'pressure', 'timeStamp']

const nullEvent = {}
for (const key of eventProps) {
	nullEvent[key] = 0
}

const defaultEvent = Object.assign({}, nullEvent, {
	width: 1,
	height: 1,
	pressure: .5
})

class PointerState {
	constructor(event = {}) {
		const options = {}
		for (const key of eventProps) {
			options[key] = key in event ? event[key] : defaultEvent[key]
		}

		Object.assign(this, {
			client: [options.clientX, options.clientY, 0],
			element: [options.offsetX, options.offsetY, 0],
			size: [options.width, options.height, 0],
			tilt: [options.tiltX, options.tiltY, 0],
			pressure: [0, 0, options.pressure],
			timeStamp: [options.timeStamp]
		})
	}
}

class PointerStateDelta {
	constructor(from, to) {
		if (from && to) {
			for (let key of stateProps) {
				this[key] = sum(invertV(from[key]), to[key])
			}
		} else {
			Object.assign(this, new PointerState(nullEvent))
		}
	}

	swipe(options = {}) {
		options = Object.assign({
			timeout: Infinity,
			length: 0
		}, options)

		const isRapid = this.timeStamp[0] <= options.timeout

		const swipe = {
			left: isRapid && (this.client[0] < -options.length),
			right: isRapid && (this.client[0] > options.length),
			top: isRapid && (this.client[1] < -options.length),
			bottom: isRapid && (this.client[1] > options.length)
		}

		return swipe
	}
}

const pointerStatePropsDecriptor = {}
for (let key of stateProps) {
	pointerStatePropsDecriptor[key] = {
		enumerable: true,
		get() {
			const state = this.get()

			if (state) {
				return state[key]
			}

			return null
		}
	}
}

class PointerStateTracker extends GenericTracker {
	static get limit() {
		return 3
	}

	static get offset() {
		return 1
	}

	constructor(...args) {
		super(...args)

		Object.defineProperties(this, pointerStatePropsDecriptor)
	}

	update(event) {
		const state = new PointerState(event)

		return GenericTracker.prototype.update.call(this, state)
	}

	transformation(from, to) {
		const delta = new PointerStateDelta(this.get(from), this.get(to))

		if (delta) {
			const transformState = new TransformState()

			transformState.translate3d = delta.client

			return transformState
		}

		return null
	}
}

class MeanPointerStateTracker extends PointerStateTracker {
	constructor(iterable = []) {
		super()

		if (iterable.length) {
			const state = {}

			for (let key of stateProps) {
				for (let pointer of iterable) {
					state[key] = sum(NULL_VECTOR_3, pointer[key])
				}

				state[key] = state[key].map(value => value / iterable.length)
			}

			GenericTracker.prototype.update.call(this, state)
		}
	}
}

export class PointingState {
	constructor(iterable) {
		Object.defineProperties(this, {
			_state: {
				value: new Map(iterable || [])
			},
			_computedCache: {
				configurable: true,
				value: {}
			}
		})

	}

	get count() {
		return this._state.size
	}

	get center() {
		const state = this._state

		if (state.size) {
			if (!this._computedCache) {
				this._computedCache = {}
			}

			if (!this._computedCache.center) {
				this._computedCache.center = new MeanPointerStateTracker([...state.values()])
			}

			return this._computedCache.center
		}

		return null
	}

	get stretching() {
		const stretching = new Map()
		const center = this.center

		if (center) {
			const state = this._state

			for (let [id, pointer] of state) {
				stretching.set(id, new PointerStateDelta(center, pointer))
			}
		}

		return stretching
	}

	get shift() {
		const state = this._state
		const shift = new Map()

		for (let [id, pointer] of state) {
			const from = pointer.get(0)
			const to = pointer.get(-1)
			shift.set(id, new PointerStateDelta(from, to))
		}

		return shift
	}

	get rotation() {
		const qs = []

		const center = this.center
		const pointers = this._state

		for (let [id, pointer] of pointers) {
			const a = new PointerStateDelta(center, pointers.get(0))
			const b = new PointerStateDelta(center, pointers.get(-1))

			const q = rotation(a, b)

			qs.push(q)
		}

		const r = slerp(...qs)

		return r
	}

	get pointers() {
		return new Map(this._state)
	}

	end(event) {
		this._state.delete(event.pointerId)
		return this
	}

	start(event) {
		const currentPointerStateTracker = this._state.get(event.pointerId)
		const nextPointerStateTracker = new PointerStateTracker(currentPointerStateTracker && currentPointerStateTracker.values())
		nextPointerStateTracker.update(event)
		this._state.set(event.pointerId, nextPointerStateTracker)

		return this
	}

	pointer(pointerId) {
		return this._state.get(pointerId)
	}
}

export class PointingStateTracker extends GenericTracker {
	static get limit() {
		return 3
	}

	static get offset() {
		return 1
	}

	update(event) {
		const state = this.get(-1)
		let nextPointingState = new PointingState(state && state.pointers)

		if (event.type === POINTER_CANCEL || event.type === POINTER_UP) {
			nextPointingState.start(event)
			GenericTracker.prototype.update.call(this, nextPointingState)
			nextPointingState = new PointingState(nextPointingState.pointers)
			nextPointingState.end(event)
		} else if (event.type === POINTER_DOWN || event.type === POINTER_MOVE) {
			nextPointingState.start(event)
		}

		return GenericTracker.prototype.update.call(this, nextPointingState)
	}

	delta(fromIndex = 0, toIndex = -1) {
		const from = this.get(fromIndex)
		let fromCenter
		if (from) {
			fromCenter = from.center
		}
		const to = this.get(toIndex)
		let toCenter
		if (to) {
			toCenter = to.center
		}

		return new PointerStateDelta(fromCenter, toCenter)
	}
}

const event1 = Object.assign({}, defaultEvent, {
	clientX: 100,
	clientY: 100,

	type: 'pointerdown',
	pointerId: 1
})

const event2 = Object.assign({}, defaultEvent, {
	clientX: 105,
	clientY: 105,

	type: 'pointermove',
	pointerId: 1
})

const event3 = Object.assign({}, defaultEvent, {
	clientX: 110,
	clientY: 110,

	type: 'pointerup',
	pointerId: 1
})

const tracker = new PointingStateTracker()

tracker.update(event1)
console.log(tracker.values())
