import onPointerMove from './pointer-move'
import onPointerUp from './pointer-up'

import {
  POINTER_MOVE,
  POINTER_UP,
  POINTER_CANCEL,
  POINTER_LEAVE,
  VISIBILITY_CHANGE,
  POINTER_DOWN
} from '../event-names'

const options = {
  passive: false
}

const map = [
  [POINTER_MOVE, onPointerMove, options],
  [POINTER_UP, onPointerUp, options],
  [POINTER_CANCEL, onPointerUp, options],
  [POINTER_LEAVE, onPointerUp, options],
  [VISIBILITY_CHANGE, onPointerUp, options]
]

export default map
