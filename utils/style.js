import {
	stringifyMatrix
} from './matrix'

import {
	COMMA,
	SPACE,
	OPEN_BRACKET,
	CLOSE_BRACKET
} from './symbols'

export const NONE = 'none'
export const TRANSFORM = 'transform'
export const TRANSLATE = 'translate'
export const ROTATE = 'rotate'
export const TOUCH_ACTION = 'touch-action'
export const ANIMATION = 'animation'
export const TRANSITION = 'transition'
export const PX = 'px'

export function stringifyTransform(state, options = {}) {
	const transform = []

	if (options.translate) {
		if (options.translate.xyz) {
			transform.push(TRANSLATE + '3d' + OPEN_BRACKET + state.translate3d.join(PX + COMMA) + CLOSE_BRACKET)
		} else {
			transform.push(TRANSLATE + 'X' + OPEN_BRACKET + state.translateX + PX + CLOSE_BRACKET)
			transform.push(TRANSLATE + 'Y' + OPEN_BRACKET + state.translateY + PX + CLOSE_BRACKET)
			transform.push(TRANSLATE + 'Z' + OPEN_BRACKET + state.translateZ + PX + CLOSE_BRACKET)
		}
	}

	return transform.join(SPACE)
}

function _setStyleProperties(el, mapObject, cb) {
	for (let key in mapObject) {
		el.style.setProperty(key, mapObject[key])
	}

	cb && setImmediate(cb)
}
let setStyleProperties = _setStyleProperties

function _removeStyleProperties(el, keyArray, cb) {
	for (let key of keyArray) {
		el.style.removeProperty(key)
	}

	cb && setImmediate(cb)
}
let removeStyleProperties = _removeStyleProperties

if (process.browser) {
	if (window.requestAnimationFrame) {
		setStyleProperties = (el, mapObject, cb) => {
			window.requestAnimationFrame(() => {
				_setStyleProperties(el, mapObject, cb)
			})
		}

		removeStyleProperties = (el, mapObject, cb) => {
			window.requestAnimationFrame(() => {
				_removeStyleProperties(el, mapObject, cb)
			})
		}
	}
}

export {
	setStyleProperties,
	removeStyleProperties
}
