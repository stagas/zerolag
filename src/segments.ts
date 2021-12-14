import { PointLike } from './point'
import { binarySearch } from './util'
import { Parts } from './parts'
import { Tokens } from './tokens'

const Begin = /[\/'"`]/g

const Type = Tokens.Type

const Match: Record<string, [string, string]> = {
  'single comment': ['//', '\n'],
  'double comment': ['/*', '*/'],
  'template string': ['`', '`'],
  'single quote string': ["'", "'"],
  'double quote string': ['"', '"'],
  regexp: ['/', '/'],
}

const Skip: Record<string, string | boolean> = {
  'single quote string': '\\',
  'double quote string': '\\',
  'single comment': false,
  'double comment': false,
  regexp: '\\',
}

const Token: Record<string, string> = {}
for (const key in Match) {
  const M = Match[key]
  Token[M[0]] = key
}

const Length: Record<string, number> = {
  'open comment': 2,
  'close comment': 2,
  'template string': 1,
}

const NotOpen: Record<string, boolean> = {
  'close comment': true,
}

const Closes: Record<string, string> = {
  'open comment': 'close comment',
  'template string': 'template string',
}

const Tag: Record<string, string> = {
  'open comment': 'comment',
  'template string': 'string',
}

interface TextBuffer {
  todo: number
  tokens: Tokens<Parts>
  charAt(x: number): string
  getLine(y: number): { offsetRange: [number, number] }
  getOffsetRangeText(range: [number, number]): string
  getOffsetPoint(offest: number): PointLike
}

interface Segment {
  offset: number
  type: string
  index: number
  point: PointLike
}

export class Segments {
  buffer: TextBuffer
  cache: {
    state: Segment[]
    offset: Record<string | number, PointLike>
    range: Record<string | number, boolean>
    point: Record<string, string | null>
  }
  constructor(buffer: TextBuffer) {
    this.buffer = buffer
    this.cache = {
      state: [],
      offset: {},
      range: {},
      point: {},
    }
    this.reset()
  }
  clearCache(offset?: number) {
    if (offset) {
      const s = binarySearch(this.cache.state!, s => s.offset < offset) //, true) ???????????
      this.cache.state!.splice(s.index)
    } else {
      this.cache.state = []
    }
    this.cache.offset = {}
    this.cache.range = {}
    this.cache.point = {}
  }
  reset() {
    this.clearCache()
  }
  get(y: number) {
    if (y in this.cache.point) {
      return this.cache.point[y]
    }

    const segments = this.buffer.tokens.getCollection('segments')
    let open = false
    let state = null
    let waitFor = ''
    let point: PointLike = { x: -1, y: -1 }
    let close = 0
    let offset
    let segment: Partial<Segment>
    let range
    // var text;
    let valid
    let last: Partial<Segment>

    // var lastCacheStateOffset = 0;

    let i = 0

    const cacheState = this.getCacheState(y)
    if (cacheState && cacheState.item) {
      open = true
      state = cacheState.item
      waitFor = Closes[state.type]
      i = state.index + 1
    }

    for (; i < segments.length; i++) {
      offset = segments.get(i)
      segment = {
        offset: offset,
        type: Type[this.buffer.charAt(offset)],
      }

      // searching for close token
      if (open) {
        if (waitFor === segment.type) {
          point = this.getOffsetPoint(segment.offset!)

          if (!point) {
            return (this.cache.point[y] = null)
          }

          if (point.y! >= y) {
            return (this.cache.point[y] = Tag[state!.type!]) //TODO: ???????????
          }

          last = segment
          last.point = point
          state = null
          open = false

          if (point.y! >= y) break
        }
      }

      // searching for open token
      else {
        point = this.getOffsetPoint(segment.offset!)

        if (!point) {
          return (this.cache.point[y] = null)
        }

        range = this.buffer.getLine(point.y!).offsetRange

        if (last! && last!.point!.y! === point.y) {
          //TODO: ???????????????
          close = last!.point!.x! + Length[last!.type!] //TODO: ?????????????
        } else {
          close = 0
        }

        valid = this.isValidRange(
          [range[0], range[1] + 1],
          segment as Segment,
          close
        )

        if (valid) {
          if (NotOpen[segment.type!]) continue
          open = true
          state = segment
          state.index = i
          state.point = point
          // state.toString = function() { return this.offset };
          waitFor = Closes[state.type!]
          if (
            !this.cache.state.length ||
            (this.cache.state.length &&
              state.offset! >
                this.cache.state[this.cache.state.length - 1].offset)
          ) {
            this.cache.state.push(state as Segment)
          }
        }

        if (point.y! >= y) break
      }
    }

    if (state && state.point!.y! < y) {
      return (this.cache.point[y] = Tag[state.type!]) // TODO: ????????????
    }

    return (this.cache.point[y] = null)
  }
  //TODO: cache in Buffer
  getOffsetPoint(offset: number) {
    if (offset in this.cache.offset) return this.cache.offset[offset]
    return (this.cache.offset[offset] = this.buffer.getOffsetPoint(offset))
  }
  isValidRange(range: [number, number], segment: Segment, close: number) {
    const key = range.join()
    if (key in this.cache.range) return this.cache.range[key]
    const text = this.buffer.getOffsetRangeText(range)
    const valid = this.isValid(text, segment.offset - range[0], close)!
    return (this.cache.range[key] = valid)
  }
  isValid(text: string, offset: number, lastIndex: number) {
    Begin.lastIndex = lastIndex

    const match = Begin.exec(text)
    if (!match) return false // TODO: 'false' added here

    let i = match.index

    let last = i

    let valid = true

    outer: for (; i < text.length; i++) {
      let one = text[i]
      const next = text[i + 1]
      let two = one + next
      if (i === offset) return true

      let o = Token[two]
      if (!o) o = Token[one]
      if (!o) {
        continue
      }

      const waitFor = Match[o][1]

      last = i

      switch (waitFor.length) {
        case 1:
          while (++i < text.length) {
            one = text[i]

            if (one === Skip[o]) {
              ++i
              continue
            }

            if (waitFor === one) {
              i += 1
              break
            }

            if ('\n' === one && !valid) {
              valid = true
              i = last + 1
              continue outer
            }

            if (i === offset) {
              valid = false
              continue
            }
          }
          break
        case 2:
          while (++i < text.length) {
            one = text[i]
            two = text[i] + text[i + 1]

            if (one === Skip[o]) {
              ++i
              continue
            }

            if (waitFor === two) {
              i += 2
              break
            }

            if ('\n' === one && !valid) {
              valid = true
              i = last + 2
              continue outer
            }

            if (i === offset) {
              valid = false
              continue
            }
          }
          break
      }
    }
    return valid
  }
  getCacheState(y: number) {
    const s = binarySearch(this.cache.state, s => s.point.y! < y) // TODO: ???????????????
    if (s.item && y - 1 < s.item.point.y!) return null
    else return s
    // return s;
  }
}
