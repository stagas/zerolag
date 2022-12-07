/* eslint-disable @typescript-eslint/no-explicit-any */
import { AreaLike, Point } from './point'

export class Area {
  static offset(b: Area, a: Area) {
    return {
      begin: Point.offset(b.begin, a.begin),
      end: Point.offset(b.end, a.end),
    }
  }

  static offsetX(x: number, a: Area) {
    return {
      begin: Point.offsetX(x, a.begin),
      end: Point.offsetX(x, a.end),
    }
  }

  static offsetY(y: number, a: Area) {
    return {
      begin: Point.offsetY(y, a.begin),
      end: Point.offsetY(y, a.end),
    }
  }

  static sort(a: Area, b: Area) {
    return a.begin.y === b.begin.y
      ? a.begin.x - b.begin.x
      : a.begin.y - b.begin.y
  }

  static toPointSort(a: Area, b: Point) {
    return a.begin.y <= b.y && a.end.y >= b.y
      ? a.begin.y === b.y
        ? a.begin.x - b.x
        : a.end.y === b.y
        ? a.end.x - b.x
        : 0
      : a.begin.y - b.y
  }

  static join(areas: Area[]) {
    const sorted = areas.map(a => a.get()).flatMap(a => [a.begin, a.end]).sort(Point.sort)
    const begin = sorted[0]
    const end = sorted.at(-1)!
    return new Area({ begin, end })
  }

  begin: Point
  end: Point

  constructor(a?: AreaLike) {
    if (a) {
      this.begin = new Point(a.begin)
      this.end = new Point(a.end)
    } else {
      this.begin = new Point()
      this.end = new Point()
    }
  }

  copy() {
    return new Area(this)
  }

  get() {
    const s = [this.begin, this.end].sort(Point.sort)
    return new Area({
      begin: new Point(s[0]),
      end: new Point(s[1]),
    })
  }

  set(area: Area) {
    this.begin.set(area.begin)
    this.end.set(area.end)
  }

  get height() {
    const { begin, end } = this.get()
    return end.y - begin.y
  }

  setLeft(bx: number, ex: number) {
    this.begin.x = bx
    if (ex != null) this.end.x = ex
    return this
  }

  addRight(x: number) {
    this.begin.x += x
    this.end.x += x
    return this
  }

  addBottom(y: number) {
    this.end.y += y
    return this
  }

  shiftByLines(y: number) {
    this.begin.y += y
    this.end.y += y
    return this
  }

  normalizeY() {
    return this.shiftByLines(-this.begin.y)
  }

  greaterThan(a: Area) {
    return this.begin.y === a.end.y
      ? this.begin.x > a.end.x
      : this.begin.y > a.end.y
  }

  greaterThanOrEqual(a: Area) {
    return this.begin.y === a.begin.y
      ? this.begin.x >= a.begin.x
      : this.begin.y > a.begin.y
  }

  lessThan(a: Area) {
    return this.end.y === a.begin.y
      ? this.end.x < a.begin.x
      : this.end.y < a.begin.y
  }

  lessThanOrEqual(a: Area) {
    return this.end.y === a.end.y ? this.end.x <= a.end.x : this.end.y < a.end.y
  }

  isEmpty() {
    return this.begin.equal(this.end)
  }

  inside(a: Area) {
    return (this as any)['>'](a) && (this as any)['<'](a)
  }

  outside(a: Area) {
    return (this as any)['<'](a) || (this as any)['>'](a)
  }

  insideEqual(a: Area) {
    return (this as any)['>='](a) && (this as any)['<='](a)
  }

  outsideEqual(a: Area) {
    return (this as any)['<='](a) || (this as any)['>='](a)
  }

  equal(a: Area) {
    return (
      this.begin.x === a.begin.x
      && this.begin.y === a.begin.y
      && this.end.x === a.end.x
      && this.end.y === a.end.y
    )
  }

  beginLineEqual(a: Area) {
    return this.begin.y === a.begin.y
  }

  endLineEqual(a: Area) {
    return this.end.y === a.end.y
  }

  linesEqual(a: Area) {
    return (this as any)['|='](a) && (this as any)['=|'](a)
  }

  sameLine(a: Area) {
    return this.begin.y === this.end.y && this.begin.y === a.begin.y
  }

  shortenByX(x: number) {
    return new Area({
      begin: {
        x: this.begin.x + x,
        y: this.begin.y,
      },
      end: {
        x: this.end.x - x,
        y: this.end.y,
      },
    })
  }

  widenByX(x: number) {
    return new Area({
      begin: {
        x: this.begin.x - x,
        y: this.begin.y,
      },
      end: {
        x: this.end.x + x,
        y: this.end.y,
      },
    })
  }

  toString() {
    const area = this.get()
    return '' + area.begin + '|' + area.end
  }
}

const proto = Area.prototype as any
proto['>'] = proto.greaterThan
proto['>='] = proto.greaterThanOrEqual
proto['<'] = proto.lessThan
proto['<='] = proto.lessThanOrEqual
proto['><'] = proto.inside
proto['<>'] = proto.outside
proto['>=<'] = proto.insideEqual
proto['<=>'] = proto.outsideEqual
proto['==='] = proto.equal
proto['|='] = proto.beginLineEqual
proto['=|'] = proto.endLineEqual
proto['|=|'] = proto.linesEqual
proto['=|='] = proto.sameLine
proto['-x-'] = proto.shortenByX
proto['+x+'] = proto.widenByX
