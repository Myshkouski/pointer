const validType = 'number'

export default class GenericState {
  static get limit() {
    return 2
  }

  static get offset() {
    return 0
  }

  constructor(iterable) {
    Object.defineProperties(this, {
      _state: {
        value: [...(iterable || [])]
      }
    })
  }

  get offset() {
    return this.constructor.offset
  }

  get limit() {
    return this.constructor.limit
  }

  get size() {
    return this._state.length
  }

  get length() {
    return this._state.length
  }

  values() {
    return [...this._state]
  }

  get(index = -1) {
    if(index < 0) {
      index += this._state.length
    }

    if(index in this._state) {
      return this._state[index]
    }
  }

  update(state) {
    this._state.push(state)

    if(this._state.length > this.limit) {
      this._state.splice(this.offset, this._state.length - this.limit)
    }

    return state
  }

  clear() {
		return this._state.splice(0, this._state.length)
	}
}
