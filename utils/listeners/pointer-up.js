import mapEventListeners from './map-event-listeners'

import {
  NONE,
  TRANSFORM,
  TRANSLATE,
  TOUCH_ACTION,
  ANIMATION,
  TRANSITION,
  setStyleProperties,
  removeStyleProperties
} from '../style'

import pointerConfig from '../config'

import map from './map'

export default function onPointerUp(event) {
  const el = this

  if (pointerConfig.has(el)) {
    const options = pointerConfig.get(el)

    const initialTransformState = options.track.transform.get(1)
    let matrix
    if (options.track.transform.size > 1) {
      matrix = options.track.transform.get(-1).transformMatrix
    } else {
      matrix = window.getComputedStyle(el).getPropertyValue(TRANSFORM)
    }

    const currentTransformState = options.track.transform.update(matrix)
    const constantTransformDelta = options.track.transform.get(0)

    const currentPointerState = options.track.pointer.update(event)
    const absolutePointerDelta = options.track.pointer.delta(0, -1)
    const marginalPointerDelta = options.track.pointer.delta(-2, -1)

    if (initialTransformState && absolutePointerDelta) {
      if (options.translate) {
        if (options.translate.x) {
          currentTransformState.translateX = initialTransformState.translateX + absolutePointerDelta.client[0]
        }

        if (options.translate.y) {
          currentTransformState.translateY = initialTransformState.translateY + absolutePointerDelta.client[1]
        }

        if (options.translate.z) {
          currentTransformState.translateZ = initialTransformState.translateZ + absolutePointerDelta.client[2]
        }
      }
    }

    if (marginalPointerDelta) {
      if (options.translate) {
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
				[TRANSFORM]: currentTransformState.matrix3d
      })
    }

    if (currentPointerState && !currentPointerState.count) {
      removeStyleProperties(el, [TRANSITION, TOUCH_ACTION, TRANSFORM, ANIMATION])
      options.track.transform.clear()
      options.track.pointer.clear()

      const eventTypesToRemove = map.map(([eventType]) => eventType)

      options.listeners = options.listeners.filter(([eventType, listener, options]) => {
        if (!~eventTypesToRemove.indexOf(eventType)) {
          return true
        }

        document.removeEventListener(eventType, listener, options)
      })

      'releasePointerCapture' in el && el.releasePointerCapture(event.pointerId)
    }
  }
}
