import pointerConfig from '../config'

import {
  createIdentityMatrix
} from '../matrix'

import {
  TRANSFORM,
  setStyleProperties,
  removeStyleProperties,
  stringifyTransform
} from '../style'

export default function onPointerMove(event) {
  const el = this

  if (pointerConfig.has(el)) {
    const options = pointerConfig.get(el)

    const currentPointerState = options.track.pointer.update(event)
    const absolutePointerDelta = options.track.pointer.delta(0, -1)
    const marginalPointerDelta = options.track.pointer.delta(-2, -1)

    // transform states
    if (!options.track.transform.size) {
      options.track.transform.update(createIdentityMatrix())
    }

    let matrix = createIdentityMatrix()

    if('getComputedStyle' in window) {
      matrix = window.getComputedStyle(el).getPropertyValue(TRANSFORM)
    } else if (options.track.transform.size > 1) {
      matrix = options.track.transform.get(-1).transformMatrix
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

      if (constantTransformDelta) {
        options.translate.x && (currentTransformState.translateX += constantTransformDelta.translateX)
        options.translate.y && (currentTransformState.translateY += constantTransformDelta.translateY)
        options.translate.z && (currentTransformState.translateZ += constantTransformDelta.translateZ)
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
  }
}
