import { sum, random, range } from 'lodash'
import { compose } from 'redux'

export default (list, maxHosts = 20) => {
  const nodes = []

  const calculateWeights = list => {
    if (!list?.length) return []
    let totalWeight = sum(list.map(x => x.weight))

    const rn = random(1, totalWeight)

    const node =
      list.find(node => {
        totalWeight += node.weight
        return rn < totalWeight
      }) || list[list.length - 1]

    nodes.push(node)

    return list.filter(x => x.hostname !== node.hostname)
  }

  compose(...range(maxHosts).map(() => calculateWeights))(list)

  return nodes.map(x => x.hostname)
}
