<template lang="pug">
div(
	style="touch-action: none"
	)
	div.mid(v-if="testMid" :style="{transform: `translate3d(${testMid.client.join('px,')}px)`}")
		span(v-if="testMid") {{testMid.client}}
	div.container
		div#test-box(
			v-pointer:transform
			v-pointer:translate.x.reset
			v-pointer:rotate.z.reset
			v-pointer:on="onTestUpdate"
			@pointerdown.prevent
			@pointermove.prevent
			@pointerup.prevent
			@pointercancel.prevent
			@touchstart.prevent
			@touchmove.prevent
			)

	div.container
		div#slider(
			ref="slider"
			v-pointer:translate.x
			v-pointer:on="on"
			@pointerdown.prevent
			@pointermove.prevent
			@pointerup.prevent
			@pointercancel.prevent
			@touchstart.prevent
			)
			div.slides-wrapper
				div.slide(ref="slide" :style="sliderStyle")
					p {{sliderStyle}}
				div.slide(v-for="index in 2" :style="sliderStyle")
</template>

<script>
import {
	createIdentityMatrix,
	createMatrixFromString,
	stringifyMatrix
} from '../utils/matrix'

import PointerDirective, {
	getTransformState,
	setTransformState
} from '../directives/pointer'

export default {
	directives: {
		pointer: PointerDirective
	},

	data() {
		return {
			testMid: null,
			sliderMatrix: createIdentityMatrix(),
			applyTransformStyleProp: false,
			applyTransition: false,
			targetedSlide: null
		}
	},

	computed: {
		sliderStyle() {
			const style = {}

			if (this.applyTransformStyleProp) {
				style.transform = stringifyMatrix(this.sliderMatrix)
			}

			if (this.applyTransition) {
				style.transition = 'transform 0s'
			}

			return style
		}
	},

	methods: {
		onTestUpdate(event, { pointer }) {
			const pointerState = pointer.get(-1)

			if (pointerState) {
				this.testMid = pointerState.center
			} else {
				this.testMid = null
			}
		},

		// modifyTranslate(translate3d) {
		// 	return translate3d.map(v => 2 * v)
		// },

		on(event, {
			pointer,
			transform
		}) {
			if (event.type === 'pointerdown') {
				this.applyTransformStyleProp = true
				this.applyTransition = true

				const matrix = window.getComputedStyle(this.$refs.slide).getPropertyValue('transform')
				this.sliderMatrix = createMatrixFromString(matrix)

				transform.get(0).matrix3d = matrix
			} else if (event.type === 'pointermove') {
				this.sliderMatrix = transform.get().transformMatrix
			} else if (event.type === 'pointerup' || event.type === 'pointercancel') {
				this.applyTransformStyleProp = false
				this.applyTransition = false

				const delta = pointer.delta(0, -2)
				const swipe = delta.swipe({
					timeout: 400,
					length: 50
				})

				const lastM = transform.get(-2).transformMatrix

				if (swipe.left || swipe.right) {
					lastM[12] += delta.client[0]
					this.sliderMatrix = lastM
					this.applyTransformStyleProp = true
				}
			}
		}
	}
}
</script>

<style lang="sass">
*
  box-sizing: border-box

.container
  display: flex
  justify-content: center
  align-items: center
  width: 100%
  min-width: 200px
  height: 400px
  margin-bottom: 1rem
  background-color: #999
  touch-action: none

.mid
	position: fixed !important
	top: 0
	left: 0
	margin-top: -5px
	margin-left: -5px
	width: 10px
	height: 10px
	border-radius: 50%
	background-color: red
	z-index: 999

// @keyframes left-n-right
// 	0%
// 		transform: translateX(0)
// 	25%
// 		transform: translateX(-100px)
// 	75%
// 		transform: translateX(100px)
// 	100%
// 		transform: translateX(0)

@keyframes rotate
	0%
		transform: rotateZ(0)
	100%
		transform: rotateZ(360deg)

#test-box
	width: 100px
	height: 100px
	background-color: #8f8
	transition: transform 1s ease
	transform: rotateZ(30deg)
	// animation-name: left-n-right
	animation-name: rotate
	animation-duration: 2s
	animation-iteration-count: infinite
	animation-timing-function: linear

#slider
  position: relative
  overflow: hidden
  width: 100%
  height: 100%

.slides-wrapper
  position: absolute
  top: 0
  bottom: 0
  left: 0
  right: 0
  white-space: nowrap

.slide
	display: inline-block
	position: relative
	width: 100%
	height: 100%
	transition: transform 1s ease
	overflow: hidden

	&:nth-child(1)
		background-color: red
	&:nth-child(2)
		width: 50%
		background-color: green
	&:nth-child(3)
		background-color: blue
</style>
