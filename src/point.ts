/* eslint-disable @typescript-eslint/no-explicit-any */
export interface PointLike {
  x?: number
  y?: number
  width?: number
  height?: number
}
export interface AreaLike {
  begin: PointLike
  end: PointLike
}
export class Point {
  x = 0
  y = 0
  constructor(p?: PointLike) {
    if (p) {
      this.x = p.x!
      this.y = p.y!
    }
  }
  set(p: PointLike) {
    this.x = p.x!
    this.y = p.y!
  }
  isNotZero() {
    return this.x !== 0 || this.y !== 0
  }
  copy() {
    return new Point(this)
  }
  equal(p: PointLike) {
    return this.x === p.x && this.y === p.y
  }
  addRight(x: number) {
    this.x += x
    return this
  }
  abs() {
    return new Point({
      x: Math.abs(this.x),
      y: Math.abs(this.y),
    })
  }
  sign() {
    return new Point({
      x: Math.sign(this.x),
      y: Math.sign(this.y),
    })
  }
  div(p: PointLike) {
    return new Point({
      x: this.x / (p.x || p.width || 0),
      y: this.y / (p.y || p.height || 0),
    })
  }
  floorDiv(p: PointLike) {
    return new Point({
      x: (this.x / (p.x || p.width || 0)) | 0,
      y: (this.y / (p.y || p.height || 0)) | 0,
    })
  }
  roundDiv(p: PointLike) {
    return new Point({
      x: Math.round(this.x / (p.x || p.width || 0)),
      y: Math.round(this.y / (p.y || p.height || 0)),
    })
  }
  ceilDiv(p: PointLike) {
    return new Point({
      x: Math.ceil(this.x / (p.x || p.width || 0)),
      y: Math.ceil(this.y / (p.y || p.height || 0)),
    })
  }
  add(p: PointLike) {
    return new Point({
      x: this.x + (p.x || p.width || 0),
      y: this.y + (p.y || p.height || 0),
    })
  }
  sub(p: PointLike) {
    return new Point({
      x: this.x - (p.x || p.width || 0),
      y: this.y - (p.y || p.height || 0),
    })
  }
  mul(p: PointLike) {
    return new Point({
      x: this.x * (p.x || p.width || 0),
      y: this.y * (p.y || p.height || 0),
    })
  }
  ceilMul(p: PointLike) {
    return new Point({
      x: Math.ceil(this.x * (p.x || p.width || 0)),
      y: Math.ceil(this.y * (p.y || p.height || 0)),
    })
  }
  roundMul(p: PointLike) {
    return new Point({
      x: Math.round(this.x * (p.x || p.width || 0)),
      y: Math.round(this.y * (p.y || p.height || 0)),
    })
  }
  floorMul(p: PointLike) {
    return new Point({
      x: (this.x * (p.x || p.width || 0)) | 0,
      y: (this.y * (p.y || p.height || 0)) | 0,
    })
  }
  lerp(p: PointLike, a: number) {
    return new Point({
      x: this.x + (p.x! - this.x) * a,
      y: this.y + (p.y! - this.y) * a,
    })
  }
  clamp(area: AreaLike) {
    return Point.clamp(area, this)
  }
  toString() {
    return this.x + ',' + this.y
  }
  static sort(a: PointLike, b: PointLike) {
    return a.y! === b.y! ? a.x! - b.x! : a.y! - b.y!
  }
  static gridRound(b: PointLike, a: PointLike) {
    return {
      x: Math.round(a.x! / b.width!),
      y: Math.round(a.y! / b.height!),
    }
  }
  static low(low: PointLike, p: PointLike) {
    return {
      x: Math.max(low.x!, p.x!),
      y: Math.max(low.y!, p.y!),
    }
  }
  static clamp(area: AreaLike & PointLike, p: PointLike) {
    return new Point({
      x: Math.min(
        area.end?.x ?? area.width!,
        Math.max(area.begin?.x ?? 0, p.x!)
      ),
      y: Math.min(
        area.end?.y ?? area.height!,
        Math.max(area.begin?.y ?? 0, p.y!)
      ),
    })
  }
  static offset(b: PointLike, a: PointLike) {
    return { x: a.x! + b.x!, y: a.y! + b.y! }
  }
  static offsetX(x: number, p: PointLike) {
    return { x: p.x! + x, y: p.y! }
  }
  static offsetY(y: number, p: PointLike) {
    return { x: p.x!, y: p.y! + y }
  }
  static toLeftTop(p: PointLike) {
    return {
      left: p.x,
      top: p.y,
    }
  }

  '/': any
  '_/': any
  'o/': any
  '^/': any
  '+': any
  '-': any
  plus: any
  minus: any
  '*': any
  '^*': any
  'o*': any
  '_*': any
}

Point.prototype['/'] = Point.prototype.div

Point.prototype['_/'] = Point.prototype.floorDiv

Point.prototype['o/'] = Point.prototype.roundDiv

Point.prototype['^/'] = Point.prototype.ceilDiv

Point.prototype['+'] = Point.prototype.plus = Point.prototype.add

Point.prototype['-'] = Point.prototype.minus = Point.prototype.sub

Point.prototype['*'] = Point.prototype.mul

Point.prototype['^*'] = Point.prototype.ceilMul

Point.prototype['o*'] = Point.prototype.roundMul

Point.prototype['_*'] = Point.prototype.floorMul
