import { Event } from './event'
import { Parts, Find } from './parts'

const Type: Record<string, string> = {
  '\n': 'lines',
  '{': 'open curly',
  '}': 'close curly',
  '[': 'open square',
  ']': 'close square',
  '(': 'open parens',
  ')': 'close parens',
  '/': 'open comment',
  '*': 'close comment',
  '`': 'template string',
}

const TOKEN = /\n|\/\*|\*\/|`|\{|\}|\[|\]|\(|\)/g

// Tokens.Type = Type

export class Tokens<T> extends Event {
  static Type = Type

  factory: () => T

  tokens: Record<string, T>
  collection: Record<string, T>

  constructor(factory: () => T) {
    super()

    this.factory = factory

    const t = (this.tokens = {
      lines: factory(),
      blocks: factory(),
      segments: factory(),
    })

    this.collection = {
      '\n': t.lines,
      '{': t.blocks,
      '}': t.blocks,
      '[': t.blocks,
      ']': t.blocks,
      '(': t.blocks,
      ')': t.blocks,
      '/': t.segments,
      '*': t.segments,
      '`': t.segments,
    }
  }
  index(text: string, offset = 0) {
    // const tokens = this.tokens
    let match
    // let type
    let collection

    while ((match = TOKEN.exec(text))) {
      collection = this.collection[text[match.index]] as unknown as number[]
      collection.push(match.index + offset)
    }
  }
  update(range: [number, number], text: string, shift: number) {
    const insert = new Tokens(Array)
    insert.index(text, range[0])

    const lengths: Record<string, number> = {}
    for (const type in this.tokens) {
      lengths[type] = (this.tokens[type] as unknown as Parts).length
    }

    for (const type in this.tokens as unknown as Record<string, Parts>) {
      ;(this.tokens[type] as unknown as Parts).shiftOffset(range[0], shift)
      ;(this.tokens[type] as unknown as Parts).removeRange(range)
      ;(this.tokens[type] as unknown as Parts).insert(
        range[0],
        insert.tokens[type] as number[]
      )
    }

    for (const type in this.tokens) {
      if ((this.tokens[type] as unknown as Parts).length !== lengths[type]) {
        this.emit(`change ${type}`)
      }
    }
  }
  getByIndex(type: string, index: number) {
    return (this.tokens[type] as unknown as Parts).get(index)
  }
  getCollection(type: string) {
    return this.tokens[type]
  }
  getByOffset(type: string, offset: number): Find | null {
    return (this.tokens[type] as unknown as Parts).find(offset)
  }
  copy() {
    const tokens = new Tokens(this.factory)
    const t = tokens.tokens
    for (const key in this.tokens) {
      t[key] = (this.tokens[key] as unknown as Parts).slice() as unknown as T
    }
    tokens.collection = {
      '\n': t.lines,
      '{': t.blocks,
      '}': t.blocks,
      '[': t.blocks,
      ']': t.blocks,
      '(': t.blocks,
      ')': t.blocks,
      '/': t.segments,
      '*': t.segments,
      '`': t.segments,
    }
    return tokens
  }
}
