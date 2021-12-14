interface TextBuffer {
  raw: string
}
export class Indexer {
  buffer: TextBuffer
  constructor(buffer: TextBuffer) {
    this.buffer = buffer
  }
  find(s: string): number[] {
    if (!s) return []
    const offsets = []
    const text = this.buffer.raw
    const len = s.length
    let index = -1
    while (~(index = text.indexOf(s, index + len))) {
      offsets.push(index)
    }
    return offsets
  }
}
