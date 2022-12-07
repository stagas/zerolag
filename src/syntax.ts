import { Regexp } from './regexp'

function entities(text: string) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const R = Regexp.create

const NewLine = R(['newline'], 'g')

//NOTE: order matters
const syntax = Regexp.join(
  [
    'newline',
    'comment',
    'number',
    'buffer',
    'special',
    'operator',
    'symbol',
    'brackets',
    'params',
    'attribute',
    // 'keyword',
    'definition',
    'call',
    'keyword',
    'variable',
    // ['variable', R(['variable', 'call'], '')],
    // ['keyword', R(['operator'])],
    // 'string',
  ],
  'gm'
)

// var Indent = {
//   regexp: R(['indent'], 'gm'),
//   replacer: s => s.replace(/ {1,2}|\t/g, '<x>$&</x>'),
// }

const AnyChar = /\S/g

const Blocks = Regexp.join(
  [
    'comment',
    // 'string',
    // ['definition', R(['arguments']), '^'],
    ['property', R(['declare'])],
    ['keyword', R(['keyword'])],
    ['string', R(['string'])],
    // 'regexp',
  ],
  'gm'
)

// var LongLines = /(^.{1000,})/gm

// var Tag = {
//   '//': 'comment',
//   '/*': 'comment',
//   '`': 'string',
//   '"': 'string',
//   "'": 'string',
//   // '/': 'regexp',
// }

interface Options {
  tab: string
}

type Block = [string, string, number?]

export class Syntax {
  tab: string
  blocks: Block[]
  blockIndex: number

  constructor({ tab = '\t' }: Options) {
    this.tab = tab
    this.blocks = []
    this.blockIndex = 0
  }
  highlight(code: string) {
    //TODO: offset????
    code += '\n`*/\n'

    // code = this.createIndents(code);
    code = this.createBlocks(code)
    // console.log(code)
    // code = entities(code);
    const pieces: Block[] = []

    let match: RegExpExecArray | null,
      piece: Block, //(string | number)[],
      lastPos = 0,
      text
    //,
    // add = 0
    while ((match = syntax.exec(code))) {
      if (match.index > lastPos) {
        text = code.slice(lastPos, match.index)
        const blocks = this.restoreBlocks(text)
        blocks.forEach(block => {
          pieces.push([block[0], block[1], block[2]! + lastPos]) // TODO: ?????
        })
      }
      piece = Object.entries(match.groups!).filter(
        ([_, value]) => value !== undefined
      )[0]
      piece.push(match.index)
      pieces.push(piece)
      lastPos = match.index + (piece[1] as string).length
    }

    // code = this.restoreBlocks(code);
    // code = code.replace(Indent.regexp, Indent.replacer);
    pieces.pop()
    while (pieces.pop()![0] !== 'newline') { } // TODO: whoa
    return pieces
  }
  createIndents(code: string) {
    const lines = code.split(/\n/g)
    let indent = 0
    let match
    let line
    let i

    i = lines.length

    while (i--) {
      line = lines[i]
      AnyChar.lastIndex = 0
      match = AnyChar.exec(line)
      if (match) indent = match.index
      else if (indent && !line.length) {
        lines[i] = new Array(indent + 1).join(this.tab)
      }
    }

    code = lines.join('\n')

    return code
  }
  restoreBlocks(code: string) {
    let block
    const blocks = this.blocks
    const regexp = /\uffee/g

    let match,
      lastPos = 0,
      text,
      add = 0

    const out: Block[] = []

    let newLineMatch,
      lastNewLinePos = 0
    while ((match = regexp.exec(code))) {
      if (match.index > lastPos) {
        text = code.slice(lastPos, match.index)
        if (text.length) {
          out.push(['text', text, lastPos])
        }
        add += text.length
      }
      block = blocks[this.blockIndex++]
      const tag = block[0]

      lastNewLinePos = 0
      while ((newLineMatch = NewLine.exec(block[1]))) {
        text = block[1].slice(lastNewLinePos, newLineMatch.index)
        out.push([tag, text, lastNewLinePos + add])
        out.push(['newline', '\n', newLineMatch.index + add])
        lastNewLinePos = newLineMatch.index + 1
      }

      if (!lastNewLinePos) {
        out.push([tag, block[1], match.index])
      } else {
        out.push([tag, block[1].slice(lastNewLinePos), lastNewLinePos + add])
      }
      add += block[1].length
      lastPos = match.index + block[1].length
    }

    text = code.slice(lastPos)
    if (text.length) out.push(['text', text, lastPos])

    return out
  }
  createBlocks(code: string) {
    this.blocks = []
    this.blockIndex = 0

    const parts = []
    let match,
      piece,
      lastPos = 0,
      text //,
    // add = 0

    while ((match = Blocks.exec(code))) {
      if (match.index > lastPos) {
        text = code.slice(lastPos, match.index)
        parts.push(text)
      }
      piece = Object.entries(match.groups!).filter(
        ([_, value]) => value !== undefined
      )[0]
      piece.push(match.index as any) // TODO: ?????????
      this.blocks.push(piece)
      parts.push('\uffee' + ' '.repeat(piece[1].length - 1))
      lastPos = match.index + piece[1].length
    }

    if (lastPos < code.length) parts.push(code.slice(lastPos))

    return parts.join('')

    // code = code
    //   // .replace(LongLines, (block) => {
    //   //   this.blocks.push(block);
    //   //   return '\uffec';
    //   // })
    //   .replace(Blocks, (block, a, b, c, d, e, f, g) => {
    //     console.log(block, a, b, c, d, e, f, g)
    //     this.blocks.push(block)
    //     return '\uffee' + ','.repeat(block.length - 1);
    //   });
    // return code;
  }

  entities!: typeof entities
}

Syntax.prototype.entities = entities

// function createId() {
//   var alphabet = 'abcdefghijklmnopqrstuvwxyz'
//   var length = alphabet.length - 1
//   var i = 6
//   var s = ''
//   while (i--) {
//     s += alphabet[(Math.random() * length) | 0]
//   }
//   return s
// }

// function compile(regexp, tag) {
//   var openTag = '<' + tag + '>'
//   var closeTag = '</' + tag + '>'
//   return {
//     name: tag,
//     regexp: regexp,
//     replacer: openTag + '$&' + closeTag,
//   }
// }

// function map(obj, fn) {
//   var result = {}
//   for (var key in obj) {
//     result[key] = fn(obj[key], key)
//   }
//   return result
// }

// function replace(pass, code) {
//   for (var i = 0; i < pass.length; i++) {
//     code = code.replace(pass[i][0], pass[i][1])
//   }
//   return code
// }

// function insert(offset, string, part) {
//   return string.slice(0, offset) + part + string.slice(offset)
// }

// function identify(block) {
//   var one = block[0]
//   var two = one + block[1]
//   return Tag[two] || Tag[one]
// }
