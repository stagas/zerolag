/*

example search for offset `4` :
`o` are node's levels, `x` are traversal steps

x
x
o-->x   o   o
o o x   o   o o o
o o o-x o o o o o
1 2 3 4 5 6 7 8 9

*/

class Node {
  value: string | null
  level: number
  width: number[]
  next: (Node | null)[]

  constructor(value: string | null, level: number) {
    this.value = value
    this.level = level
    this.width = new Array(this.level).fill((value && value.length) || 0)
    this.next = new Array(this.level).fill(null)
  }
  get length() {
    return this.width[0]
  }
}

interface NonNullNode extends Node {
  value: string
}

interface Options {
  levels?: number
  bias?: number
  chunkSize?: number
}

interface Search {
  node: NonNullNode
  steps: Node[]
  width: number[]
  offset: number
}

export class SkipString {
  levels: number
  bias: number
  head: Node //| null
  chunkSize: number

  constructor({
    levels = 11,
    bias = 1 / Math.E,
    chunkSize = 5000,
  }: Options = {}) {
    this.levels = levels
    this.bias = bias
    this.head = new Node(null, this.levels)
    this.chunkSize = chunkSize
  }

  get length() {
    return this.head.width[this.levels - 1]
  }

  get(offset: number) {
    // great hack to do offset >= for .search()
    // we don't have fractions anyway so..
    return this.search(offset, true)
  }

  set(text: string) {
    this.insertChunked(0, text)
  }

  search(offset: number, incl?: boolean | number): Search {
    incl = incl ? 0.1 : 0

    // prepare to hold steps
    const steps = new Array(this.levels)
    const width = new Array(this.levels)

    // iterate levels down, skipping top
    let i = this.levels
    let node: Node | null = this.head

    while (i--) {
      while (node && offset + incl > node.width[i] && null != node.next[i]) {
        offset -= node.width[i]
        node = node.next[i]
      }
      steps[i] = node
      width[i] = offset
    }

    return {
      node: node! as NonNullNode, // TODO: test for case where .head is null
      steps: steps,
      width: width,
      offset: offset,
    }
  }

  splice(
    s: Search,
    _offset: number,
    value: string,
    level = this.randomLevel()
  ) {
    const steps = s.steps // skip steps left of the offset
    const width = s.width

    let p // left node or `p`
    const q = new Node(value, level) // right node or `q` (our new node)
    // let len

    // create new node
    // level = level || this.randomLevel()
    // q = new Node(value, level)
    const length = q.width[0]

    // iterator
    let i

    // iterate steps levels below new node level
    i = level
    while (i--) {
      p = steps[i] // get left node of this level step
      q.next[i] = p.next[i] // insert so inherit left's next
      p.next[i] = q // left's next is now our new node
      q.width[i] = p.width[i] - width[i] + length
      p.width[i] = width[i]
    }

    // iterate steps all levels down until except new node level
    i = this.levels
    while (i-- > level) {
      p = steps[i] // get left node of this level
      p.width[i] += length // add new node width
    }

    // return new node
    return q
  }

  insert(offset: number, value: string, level?: number) {
    const s = this.search(offset)

    // if search falls in the middle of a string
    // insert it there instead of creating a new node
    if (s.node && s.offset && s.node.value && s.offset < s.node.value.length) {
      this.update(s, insert(s.offset, s.node.value, value))
      return s.node
    }

    return this.splice(s, offset, value, level)
  }

  update(s: Search, value: string) {
    // values length difference
    const length = s.node.value.length - value.length

    // update value
    s.node.value = value

    // iterator
    let i

    // fix widths on all levels
    i = this.levels

    while (i--) {
      s.steps[i].width[i] -= length
    }

    return length
  }

  remove(range: [number, number]) {
    if (range[1] > this.length) {
      throw new Error(
        'range end over maximum length(' +
          this.length +
          '): [' +
          range.join() +
          ']'
      )
    }

    // remain distance to remove
    let x = range[1] - range[0]

    // search for node on left edge
    const s = this.search(range[0])
    const offset = s.offset
    const steps = s.steps
    let node: Node | null = s.node

    // skip head
    if (this.head === node) node = node.next[0] as NonNullNode // ?????

    // slice left edge when partial
    if (offset) {
      if (offset < node.width[0]) {
        x -= this.update(
          s,
          node.value!.slice(0, offset) +
            node.value!.slice(offset + Math.min(x, node.length - offset))
        )
      }

      node = node.next[0]

      if (!node) return
    }

    // remove all full nodes in range
    while (node && x >= node.width[0]) {
      x -= this.removeNode(steps, node)
      node = node.next[0]
    }

    // slice right edge when partial
    if (x) {
      this.replace(steps, node!, node!.value!.slice(x)) // ??????
    }
  }

  removeNode(steps: Node[], node: Node) {
    const length = node.width[0]

    let i

    i = node.level
    while (i--) {
      steps[i].width[i] -= length - node.width[i]
      steps[i].next[i] = node.next[i]
    }

    i = this.levels
    while (i-- > node.level) {
      steps[i].width[i] -= length
    }

    return length
  }

  replace(steps: Node[], node: Node, value: string) {
    const length = node.value!.length - value.length

    node.value = value

    let i
    i = node.level
    while (i--) {
      node.width[i] -= length
    }

    i = this.levels
    while (i-- > node.level) {
      steps[i].width[i] -= length
    }

    return length
  }

  removeCharAt(offset: number) {
    return this.remove([offset, offset + 1])
  }

  insertChunked(offset: number, text: string) {
    for (let i = 0; i < text.length; i += this.chunkSize) {
      const chunk = text.substr(i, this.chunkSize)
      this.insert(i + offset, chunk)
    }
  }

  substring(a: number, b: number) {
    const length = b - a

    const search = this.search(a, true)
    let node: Node | null = search.node
    if (this.head === node) node = node.next[0]
    let d = length + search.offset
    let s = ''
    while (node && d >= 0) {
      d -= node.width[0]
      s += node.value
      node = node.next[0]
    }
    if (node) {
      s += node.value
    }

    return s.substr(search.offset, length)
  }

  randomLevel() {
    let level = 1
    while (level < this.levels - 1 && Math.random() < this.bias) level++
    return level
  }

  getRange(range: [number, number] = [0, 0]) {
    // range = range || []
    return this.substring(range[0], range[1])
  }

  copy() {
    const copy = new SkipString()
    let node: Node | null = this.head
    let offset = 0
    while ((node = node.next[0])) {
      copy.insert(offset, node.value!)
      offset += node.width[0]
    }
    return copy
  }

  joinString(delimiter: string) {
    const parts = []
    let node: Node | null = this.head
    while ((node = node.next[0])) {
      parts.push(node.value)
    }
    return parts.join(delimiter)
  }

  toString() {
    return this.substring(0, this.length)
  }
}

// function trim(s: string, left: number, right: number) {
//   return s.substr(0, s.length - right).substr(left)
// }

function insert(offset: number, string: string, part: string) {
  return string.slice(0, offset) + part + string.slice(offset)
}
