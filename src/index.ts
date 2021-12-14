import { Area } from './area'
import { Point } from './point'
import { Event } from './event'
import { Regexp } from './regexp'

import { SkipString } from './skipstring'
import { PrefixTreeNode } from './prefixtree'
import { Segments } from './segments'
import { Indexer } from './indexer'
import { Tokens } from './tokens'
import { Parts } from './parts'
// import { Syntax } from './syntax'

const EOL = /\r\n|\r|\n/g
const NEWLINE = /\n/g
const WORDS = Regexp.create(['tokens'], 'g')

// const SEGMENT: Record<string, string> = {
//   comment: '/*',
//   string: '`',
// }

interface BufferPoint extends Point {
  offset: number
  line: Line
  point: BufferPoint
}

class Line {
  offsetRange: Range = [-1, -1]
  offset = 0
  length = 0
  point = new Point()
}

function normalizeEOL(s: string) {
  return s.replace(EOL, '\n')
}

type Range = [number, number]

type LogEntry = ['insert' | 'remove', Range, string]

export class Buffer extends Event {
  log: LogEntry[]

  raw = ''

  indexer: Indexer
  segments: Segments

  text!: SkipString
  tokens!: Tokens<Parts>
  prefix!: PrefixTreeNode

  constructor() {
    super()
    this.log = []
    // this.syntax = new Syntax;
    this.indexer = new Indexer(this)
    this.segments = new Segments(this as any)
    this.setText('')
  }
  updateRaw() {
    this.raw = this.text.toString()
  }
  copy() {
    this.updateRaw()
    const buffer = new Buffer()
    buffer.replace(this)
    return buffer
  }
  replace(data: Buffer) {
    this.raw = data.raw
    this.text.set(this.raw)
    this.tokens = data.tokens.copy()
    this.segments.clearCache()
  }
  setText(text: string) {
    text = normalizeEOL(text)

    this.raw = text //this.syntax.highlight(text);

    // this.syntax.tab = ~this.raw.indexOf('\t') ? '\t' : ' ';
    this.text = new SkipString()
    this.text.set(this.raw)

    this.tokens = new Tokens(() => new Parts())
    this.tokens.index(this.raw)
    this.tokens.on('change segments', this.emit.bind(this, 'change segments'))

    this.prefix = new PrefixTreeNode()
    this.prefix.index(this.raw)

    this.emit('set')
  }
  insertTextAtPoint(p: BufferPoint, text: string, noLog: boolean) {
    if (!noLog) this.emit('before update')

    text = normalizeEOL(text)

    const length = text.length
    const point = this.getPoint(p)
    const shift = (text.match(NEWLINE) || []).length
    const range: Range = [point.y, point.y + shift]
    const offsetRange = this.getLineRangeOffsets(range)

    const before = this.getOffsetRangeText(offsetRange)
    this.text.insert(point.offset, text)
    offsetRange[1] += text.length
    const after = this.getOffsetRangeText(offsetRange)
    this.prefix.index(after)
    this.tokens.update(offsetRange, after, length)
    this.segments.clearCache(offsetRange[0])
    if (!noLog)
      this.appendLog('insert', [point.offset, point.offset + text.length], text)

    if (!noLog) this.emit('update', range, shift, before, after)

    return text.length
  }
  removeOffsetRange(o: Range, noLog?: boolean) {
    if (!noLog) this.emit('before update')

    const a = this.getOffsetPoint(o[0])
    const b = this.getOffsetPoint(o[1])
    const length = o[0] - o[1]
    const range: Range = [a.y, b.y]
    const shift = a.y - b.y

    const offsetRange = this.getLineRangeOffsets(range)
    const before = this.getOffsetRangeText(offsetRange)
    const text = this.text.getRange(o)
    this.text.remove(o)
    offsetRange[1] += length
    const after = this.getOffsetRangeText(offsetRange)
    this.prefix.index(after)
    this.tokens.update(offsetRange, after, length)
    this.segments.clearCache(offsetRange[0])
    if (!noLog) this.appendLog('remove', o, text)

    if (!noLog) this.emit('update', range, shift, before, after)
  }
  appendLog(type: 'insert' | 'remove', offsets: Range, text: string) {
    if (type === 'insert') {
      const lastLog = this.log[this.log.length - 1]
      if (lastLog && lastLog[0] === 'insert' && lastLog[1][1] === offsets[0]) {
        lastLog[1][1] += text.length
        lastLog[2] += text
      } else {
        this.log.push(['insert', offsets, text])
      }
    } else if (type === 'remove') {
      const lastLog = this.log[this.log.length - 1]
      if (lastLog && lastLog[0] === 'remove' && lastLog[1][0] === offsets[1]) {
        lastLog[1][0] -= text.length
        lastLog[2] = text + lastLog[2]
      } else {
        this.log.push(['remove', offsets, text])
      }
    }
  }
  removeArea(area: Area) {
    const offsets = this.getAreaOffsetRange(area)
    return this.removeOffsetRange(offsets)
  }
  removeCharAtPoint(p: Point) {
    const point = this.getPoint(p)
    const offsetRange: Range = [point.offset, point.offset + 1]
    return this.removeOffsetRange(offsetRange)
  }
  // get(range) {
  //   let code = this.getLineRangeText(range)

  //   // calculate indent for `code`
  //   //TODO: move to method
  //   const last = code.slice(code.lastIndexOf('\n'))
  //   const AnyChar = /\S/g
  //   let y = range[1]
  //   let match = AnyChar.exec(last)
  //   while (!match && y < this.loc()) {
  //     const after = this.getLineText(++y)
  //     AnyChar.lastIndex = 0
  //     match = AnyChar.exec(after)
  //   }
  //   let indent = 0
  //   if (match) indent = match.index
  //   const indentText = '\n' + new Array(indent + 1).join(this.syntax.tab)

  //   const segment = this.segments.get(range[0])
  //   if (segment) {
  //     code = SEGMENT[segment] + '\uffba\n' + code + indentText + '\uffbe*/`'
  //     code = this.syntax.highlight(code)
  //     code =
  //       '<' +
  //       segment[0] +
  //       '>' +
  //       code.substring(code.indexOf('\uffba') + 2, code.lastIndexOf('\uffbe'))
  //   } else {
  //     code = this.syntax.highlight(code + indentText + '\uffbe*/`')
  //     code = code.substring(0, code.lastIndexOf('\uffbe'))
  //   }
  //   return code
  // }
  getLine(y: number) {
    const line = new Line()
    const loc = this.loc()
    line.offsetRange = this.getLineRangeOffsets([y, y])
    line.offset = line.offsetRange[0]
    line.length = line.offsetRange[1] - line.offsetRange[0] - (y < loc ? 1 : 0)
    line.point.set({ x: 0, y: y >= loc ? loc : y })
    return line
  }
  getPoint(p: Point) {
    const line = this.getLine(p.y)
    const point = new Point({
      x: Math.min(line.length, p.x!),
      y: line.point.y,
    }) as Partial<BufferPoint>
    point.offset = line.offset + point.x!
    point.point = point as BufferPoint
    point.line = line
    return point as BufferPoint
  }
  getLineRangeText(range: [number, number]) {
    const offsets = this.getLineRangeOffsets(range)
    const text = this.text.getRange(offsets)
    return text
  }
  getLineRangeOffsets(range: [number, number]): [number, number] {
    const a = this.getLineOffset(range[0])
    const b =
      range[1] >= this.loc()
        ? this.text.length
        : this.getLineOffset(range[1] + 1)
    const offsets: [number, number] = [a, b]
    return offsets
  }
  getOffsetRangeText(offsetRange: [number, number]) {
    const text = this.text.getRange(offsetRange)
    return text
  }
  getOffsetPoint(offset: number) {
    const token = this.tokens.getByOffset('lines', offset - 0.5)
    if (!token) return new Point()
    return new Point({
      x:
        offset -
        (offset > token.offset
          ? token.offset + (!!token.part.length as unknown as number)
          : 0),
      y: Math.min(
        this.loc(),
        token.index - ((token.offset + 1 > offset) as unknown as number) + 1
      ),
    })
  }
  charAt(offset: number) {
    const char = this.text.getRange([offset, offset + 1])
    return char
  }
  // getOffsetLineText(offset) {
  //   return {
  //     line: line,
  //     text: text,
  //   }
  // }
  getLineLength(line: number) {
    return this.getLine(line).length
  }
  getLineText(y: number) {
    const text = this.getLineRangeText([y, y])
    return text
  }
  getAreaText(area: Area) {
    const offsets = this.getAreaOffsetRange(area)
    const text = this.text.getRange(offsets)
    return text
  }
  wordAreaAtPoint(p: BufferPoint, inclusive?: boolean) {
    const point = this.getPoint(p)
    const text = this.text.getRange(point.line.offsetRange)
    const words = Regexp.parse(text, WORDS)

    if (words.length === 1) {
      const area = new Area({
        begin: { x: 0, y: point.y },
        end: { x: point.line.length, y: point.y },
      })

      return area
    }

    let lastIndex = 0
    let word = []
    let end = text.length

    for (let i = 0; i < words.length; i++) {
      word = words[i]
      if (word.index > point.x - (!!inclusive as unknown as number)) {
        end = word.index
        break
      }
      lastIndex = word.index
    }

    const area = new Area({
      begin: { x: lastIndex, y: point.y },
      end: { x: end, y: point.y },
    })

    return area
  }
  moveAreaByLines(dy: number, area: Area) {
    if (area.begin.y + dy < 0 || area.end.y + dy > this.loc()) return false

    let x = 0
    let y = area.begin.y + dy

    let swap_a = false
    let swap_b = false

    area.end.x = area.begin.x = 0
    area.end.y = area.end.y + 1

    if (dy > 0 && area.end.y === this.loc()) {
      if (area.begin.y === 0) {
        area.begin.x = 0
        area.end.x = 0
        x = Infinity
        swap_b = true
      } else {
        area.end.y = this.loc()
        y = area.begin.y + dy
        x = Infinity
        swap_b = true
      }
    } else if (dy < 0 && area.end.y > this.loc() && y > 0) {
      area.begin.y = y
      area.begin.x = this.getLineLength(area.begin.y)
      y = area.begin.y - 1
      x = Infinity
    } else if (dy < 0 && y === 0 && area.end.y > this.loc()) {
      area.begin.y -= 1
      area.begin.x = this.getLineLength(area.begin.y)
      swap_a = true
    }

    const offsets = this.getAreaOffsetRange(area)
    let text = this.text.getRange(offsets)

    if (swap_a) {
      text = text.slice(1) + text[0]
    }
    if (swap_b) {
      text = text.slice(-1) + text.slice(0, -1)
    }

    this.remove(offsets)
    this.insert({ x, y }, text)

    return true
  }
  getAreaOffsetRange(area: Area): Range {
    const begin = this.getPoint(area.begin)
    const end = this.getPoint(area.end)
    const range: Range = [
      Math.max(0, begin.offset),
      end.y < area.end.y ? end.line.offsetRange[1] : end.offset,
    ]
    return range
  }
  // getOffsetLine(offset) {
  //   return line
  // }
  getLineOffset(y: number) {
    const offset =
      y < 0 ? -1 : y === 0 ? 0 : this.tokens.getByIndex('lines', y - 1) + 1
    return offset
  }
  getLongestLine() {
    return this.getLongestLineLength(true)
  }
  getLongestLineLength(withLineNumber?: boolean) {
    // TODO: this should be part of the 'Parts' class
    // so lookup becomes O(1), currently lookup is O(n)
    let max = this.getLineLength(this.loc()) + 1,
      y = this.loc(),
      diff = 0,
      prev = -1,
      curr = 0
    const parts = this.tokens.getCollection('lines').parts
    for (let i = 0, cy = 0; i < parts.length; i++) {
      const part = parts[i]
      for (let j = 0; j < part.length; j++) {
        cy++
        curr = part[j]
        diff = curr - prev
        prev = curr
        if (diff > max) {
          max = diff
          y = cy
        }
      }
    }
    if (withLineNumber)
      return {
        length: max - 1,
        lineNumber: Math.max(0, y - 1),
      }
    return max - 1 // minus the newline char
  }
  loc() {
    return this.tokens.getCollection('lines').length
  }
  toString() {
    return this.text.toString()
  }

  insert: any
  remove: any
}

// Buffer.prototype.__proto__ = Event.prototype;

Buffer.prototype.insert = Buffer.prototype.insertTextAtPoint
// ;

Buffer.prototype.remove = Buffer.prototype.removeOffsetRange
// ;
