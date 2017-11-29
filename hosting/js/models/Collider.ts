import Boundaries from '../interfaces/Boundaries'
import Collision from '../interfaces/Collision'

export default abstract class Collider {
  abstract boundaries(): Boundaries
}
