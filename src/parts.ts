import { binarySearch } from './util'

function last<T>(array: T[]): T {
  return array[array.length - 1]
}

function remove<T>(array: T[], a: number, b?: number): T[] {
  if (b == null) {
    return array.splice(a)
  } else {
    return array.splice(a, b - a)
  }
}

function insert<T>(target: T[], index: number, array: number[]) {
  const op = array.slice() as [number, number]
  op.unshift(index, 0)
  target.splice.apply(target, op)
}

interface Part extends Array<number> {
  slice(): Part
  concat(n: Part): Part
  startIndex: number
  startOffset: number
}

export interface Find {
  offset: number
  index: number
  local: number
  part: Part
  partIndex: number
}

export class Parts {
  minSize: number
  parts: Part[]
  length: number

  constructor(minSize?: number) {
    minSize = minSize || 5000
    this.minSize = minSize
    this.parts = []
    this.length = 0
  }
  push(item: number) {
    this.append([item])
  }
  append(items: number[]) {
    let part = last(this.parts)

    if (!part) {
      part = [] as never
      part.startIndex = 0
      part.startOffset = 0
      this.parts.push(part)
    } else if (part.length >= this.minSize) {
      const startIndex = part.startIndex + part.length
      const startOffset = items[0]

      part = [] as never
      part.startIndex = startIndex
      part.startOffset = startOffset
      this.parts.push(part)
    }

    part.push.apply(
      part,
      items.map(offset => offset - part.startOffset)
    )

    this.length += items.length
  }
  get(index: number) {
    const part = this.findPartByIndex(index).item
    if (!part) return -1
    return (
      (part[Math.min(part.length - 1, index - part.startIndex)] ?? -1) +
      part.startOffset
    )
  }
  find(offset: number): Find | null {
    const p = this.findPartByOffset(offset)
    if (!p.item) return null

    const part = p.item
    const partIndex = p.index
    const o = this.findOffsetInPart(offset, part)
    return {
      offset: o.item! + part.startOffset,
      index: o.index + part.startIndex,
      local: o.index,
      part: part,
      partIndex: partIndex,
    }
  }
  insert(offset: number, array: number[]) {
    const o = this.find(offset)
    if (!o) {
      return this.append(array)
    }
    if (o.offset > offset) o.local = -1
    const length = array.length
    //TODO: maybe subtract 'offset' instead ????????????????????
    array = array.map(el => (el -= o.part.startOffset))
    insert(o.part, o.local + 1, array)
    this.shiftIndex(o.partIndex + 1, -length)
    this.length += length
  }
  shiftOffset(offset: number, shift: number) {
    const parts = this.parts
    const item = this.find(offset)
    if (!item) return
    if (offset > item.offset) item.local += 1

    let removed = 0
    for (let i = item.local; i < item.part.length; i++) {
      item.part[i] += shift
      if (item.part[i] + item.part.startOffset < offset) {
        removed++
        item.part.splice(i--, 1)
      }
    }
    if (removed) {
      this.shiftIndex(item.partIndex + 1, removed)
      this.length -= removed
    }
    for (let i = item.partIndex + 1; i < parts.length; i++) {
      parts[i].startOffset += shift
      if (parts[i].startOffset < offset) {
        if (last(parts[i]) + parts[i].startOffset < offset) {
          removed = parts[i].length
          this.shiftIndex(i + 1, removed)
          this.length -= removed
          parts.splice(i--, 1)
        } else {
          this.removeBelowOffset(offset, parts[i])
        }
      }
    }
  }
  removeRange(range: [number, number]) {
    const a = this.find(range[0])
    const b = this.find(range[1])
    if (!a || !b) return

    if (a.partIndex === b.partIndex) {
      if (a.offset >= range[1] || a.offset < range[0]) a.local += 1
      if (b.offset >= range[1] || b.offset < range[0]) b.local -= 1
      const shift = remove(a.part, a.local, b.local + 1).length
      this.shiftIndex(a.partIndex + 1, shift)
      this.length -= shift
    } else {
      if (a.offset >= range[1] || a.offset < range[0]) a.local += 1
      if (b.offset >= range[1] || b.offset < range[0]) b.local -= 1
      const shiftA = remove(a.part, a.local).length
      const shiftB = remove(b.part, 0, b.local + 1).length
      if (b.partIndex - a.partIndex > 1) {
        const removed = remove(this.parts, a.partIndex + 1, b.partIndex)
        const shiftBetween = removed.reduce((p, n) => p + n.length, 0)
        b.part.startIndex -= shiftA + shiftBetween
        this.shiftIndex(
          b.partIndex - removed.length + 1,
          shiftA + shiftB + shiftBetween
        )
        this.length -= shiftA + shiftB + shiftBetween
      } else {
        b.part.startIndex -= shiftA
        this.shiftIndex(b.partIndex + 1, shiftA + shiftB)
        this.length -= shiftA + shiftB
      }
    }

    //TODO: this is inefficient as we can calculate the indexes ourselves
    if (!a.part.length) {
      this.parts.splice(this.parts.indexOf(a.part), 1)
    }
    if (!b.part.length) {
      this.parts.splice(this.parts.indexOf(b.part), 1)
    }
  }
  shiftIndex(startIndex: number, shift: number) {
    for (let i = startIndex; i < this.parts.length; i++) {
      this.parts[i].startIndex -= shift
    }
  }
  removeBelowOffset(offset: number, part: Part) {
    const o = this.findOffsetInPart(offset, part)
    const shift = remove(part, 0, o.index).length
    //TODO: this.shiftIndex(o.partIndex + 1, shift) ???????????
    this.shiftIndex(o.index + 1, shift)
    this.length -= shift
  }
  findOffsetInPart(offset: number, part: Part) {
    offset -= part.startOffset
    return binarySearch(part, o => o <= offset)
  }
  findPartByIndex(index: number) {
    return binarySearch(this.parts, s => s.startIndex <= index)
  }
  findPartByOffset(offset: number) {
    return binarySearch(this.parts, s => s.startOffset <= offset)
  }
  toArray() {
    return this.parts.reduce((p, n) => p.concat(n), [] as Part[])
  }
  slice() {
    const parts = new Parts(this.minSize)
    this.parts.forEach((part: Part) => {
      const p = part.slice()
      p.startIndex = part.startIndex
      p.startOffset = part.startOffset
      parts.parts.push(p)
    })
    parts.length = this.length
    return parts
  }
}
