import {
	NONE,
	TRANSFORM,
	TOUCH_ACTION,
	ANIMATION,
	TRANSITION,
	stringifyTransform,
	setStyleProperties,
	removeStyleProperties
} from '../style'

import {
	createIdentityMatrix
} from '../matrix'

import mapEventListeners from './map-event-listeners'

import pointerConfig from '../config'

import map from './map'

export default function onPointerDown(event) {
	const el = this

	if (pointerConfig.has(el)) {
		'setPointerCapture' in el && el.setPointerCapture(event.pointerId)

		const options = pointerConfig.get(el)

		const computedStyle = window.getComputedStyle(el)

		// pointer states
		const currentPointerState = options.track.pointer.update(event)
		const absolutePointerDelta = options.track.pointer.delta(0, -1)
		const marginalPointerDelta = options.track.pointer.delta(-2, -1)

		// transform states
		if (!options.track.transform.size) {
			options.track.transform.update(createIdentityMatrix())
		}

		let matrix = createIdentityMatrix()

		if (!options.nocatch) {
			if ('getComputedStyle' in window) {
				matrix = window.getComputedStyle(el).getPropertyValue(TRANSFORM)
			} else if (options.track.transform.size > 1) {
				matrix = options.track.transform.get(-1).transformMatrix
			}
		}

		const constantTransformDelta = options.track.transform.get(0)
		const currentTransformState = options.track.transform.update(matrix)
		const initialTransformState = options.track.transform.get(1)

		if (options.translate) {
			if (initialTransformState && absolutePointerDelta) {
				options.translate.x && (currentTransformState.translateX = initialTransformState.translateX + absolutePointerDelta.client[0])
				options.translate.y && (currentTransformState.translateY = initialTransformState.translateY + absolutePointerDelta.client[1])
				options.translate.z && (currentTransformState.translateZ = initialTransformState.translateZ + absolutePointerDelta.client[2])
			}

			if (constantTransformDelta && marginalPointerDelta) {
				if (options.translate.x) {
					constantTransformDelta.translateX -= marginalPointerDelta.client[0]
					currentTransformState.translateX += constantTransformDelta.translateX
				}
				if (options.translate.y) {
					constantTransformDelta.translateY -= marginalPointerDelta.client[1]
					currentTransformState.translateY += constantTransformDelta.translateY
				}
				if (options.translate.z) {
					constantTransformDelta.translateZ -= marginalPointerDelta.client[2]
					currentTransformState.translateZ += constantTransformDelta.translateZ
				}
			}
		}

		if (options.on) {
			try {
				options.on(event, options.track)
			} catch (error) {
				console.error(error)
			}
		}

		if (options.transform) {
			'stopImmediatePropagation' in event ? event.stopImmediatePropagation() : 'stopPropagation' in event ? event.stopPropagation() : (event.cancelBubble = true)
			'preventDefault' in event && event.preventDefault()

			setStyleProperties(el, {
				[TRANSFORM]: currentTransformState.matrix3d,
				[ANIMATION]: NONE,
				[TOUCH_ACTION]: NONE,
				[TRANSITION]: `${ computedStyle.getPropertyValue(TRANSITION) }, ${ TRANSFORM } 0s`
			})
		}

		const listeners = map
			.map(([eventType, listener, options]) => [eventType, listener.bind(el), options])
			.filter(([eventType]) => {
				if (!options.listeners.some(([_eventType]) => eventType === _eventType)) {
					return true
				}
			})

		if (listeners.length) {
			mapEventListeners(listeners, document.addEventListener.bind(document))
			options.listeners = options.listeners.concat(listeners)
		}
	}
}
