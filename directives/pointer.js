import {
	PointingStateTracker,
	PointingState
} from '../utils/pointer'

import {
	TransformState,
	TransformStateTracker
} from '../utils/transform'

import {
	NONE,
	TRANSFORM,
	TRANSLATE,
	TOUCH_ACTION,
	ANIMATION,
	TRANSITION,
	ROTATE,
	setStyleProperties,
	removeStyleProperties
} from '../utils/style'

import pointerConfig from '../utils/config'

import mapEventListeners from '../utils/listeners/map-event-listeners'

import onPointerDown from '../utils/listeners/pointer-down'
import onPointerMove from '../utils/listeners/pointer-move'
import onPointerUp from '../utils/listeners/pointer-up'

import {
	POINTER_DOWN
} from '../utils/event-names'

if (process.browser) {
	if (!window.PointerEvent) {
		require('points')
	}
}

function bindOrUpdate(el, bindings, vnode) {
	let options

	if (pointerConfig.has(el)) {
		options = pointerConfig.get(el)
	} else {
		options = {
			nocatch: 'nocatch' in bindings.modifiers ? bindings.modifiers.nocatch : false,
			timeStamp: Date.now(),
			track: {
				pointer: new PointingStateTracker(),
				transform: new TransformStateTracker()
			},
			listeners: [
				[POINTER_DOWN, onPointerDown.bind(el), {
					passive: false
				}]
			]
		}
	}

	if (bindings.arg === TRANSFORM) {
		options.transform = (typeof bindings.value)[0] === 'f' ? bindings.value.bind(vnode.context) : true
	} else if (bindings.arg === 'on') {
		options.on = bindings.value.bind(vnode.context)
	} else {
		const xyz = !('x' in bindings.modifiers || 'y' in bindings.modifiers || 'z' in bindings.modifiers)

		const bindingOptions = {
			xyz,
			x: bindings.modifiers.x || xyz,
			y: bindings.modifiers.y || xyz,
			z: bindings.modifiers.z || xyz,
			reset: !!bindings.modifiers.reset,
		}

		if((typeof bindings.value)[0] === 'f') {
			bindingOptions.modify = bindings.value.bind(vnode.context)
		}

		if (bindings.arg === TRANSLATE) {
			options.translate = bindingOptions
		} else if (bindings.arg === ROTATE) {
			options.rotate = bindingOptions
		}
	}

	pointerConfig.set(el, options)
}

export default {
	bind: bindOrUpdate,

	inserted(el) {
		if (pointerConfig.has(el)) {
			const options = pointerConfig.get(el)

			mapEventListeners(options.listeners, el.addEventListener.bind(el))
		}

		// console.log('inserted')
	},

	unbind(el) {
		// console.log('unbind')
		if (pointerConfig.has(el)) {
			const {
				listeners
			} = pointerConfig.get(el)

			mapEventListeners(listeners, el.removeEventListener.bind(el))

			pointerConfig.delete(el)
		}
	}
}

export function getTransformState(el) {
	const options = pointerConfig.get(el)

	if (options) {
		return options.track.transform.get()
	}
}

export function setTransformState(el, matrix) {
	const options = pointerConfig.get(el)

	if (options) {
		return options.track.transform.update(matrix)
	}
}
