// const Regexp: Record<string, unknown> = {}

export class Regexp {
  static create(
    names: string[],
    flags = '',
    fn: (s: string) => string = (s: string) => s
  ) {
    return new RegExp(
      names
        .map(n => ('string' === typeof n ? Regexp.types[n] : n))
        .map(r => fn(r.toString().slice(1, -1)))
        .join('|'),
      flags
    )
  }

  static join(regexps: (string | [string, RegExp])[], flags: string) {
    return new RegExp(
      regexps
        .map(n => ('string' === typeof n ? [n, Regexp.types[n]] : n))
        .map(
          r =>
            (r[2] ?? '') +
            '(?<' +
            (r[0] as string).replace(/\s/g, '_') +
            '>' +
            r[1].toString().slice(1, -1) +
            ')'
        )
        .join('|'),
      flags
    )
  }

  static types: Record<string, RegExp> = {
    tokens: /.+?\b|.\B|\b.+?/,
    definition: /^[a-zA-Z_]+?(?=\([^]*\)=)/,
    buffer: /#/,
    call: /[a-zA-Z_]+?(?=\()/,
    words: /[a-zA-Z0-9]{1,}/,
    parts: /[./\\()"'\-:,.;<>~!@#$%^&*|+=[\]{}`~? ]+/,

    'single comment': /\\.*?$|\/\/.*?$/,
    // 'single comment': /\/\/.*?$/,
    'double comment': /\/\*[^]*?\*\//,
    'single quote string': /('(?:(?:\\\n|\\'|[^'\n]))*?')/,
    'double quote string': /("(?:(?:\\\n|\\"|[^"\n]))*?")/,
    'template string': /(`(?:(?:\\`|[^`]))*?`)/,

    number: /-?(0x[\dA-Fa-f]+|\d*\.?\d+([Ee][+-]?\d+)?[fkKbBs]?|NaN|-?Infinity)\b/,
    operator:
      /!|\.\.|\.|::|:|>=?|<=?|={1,3}|(?:&){1,2}|\|?\||\?|\*|\/|~|\^|%|\+{1,2}|-{1,2}/, // \.(?!\d)|
    attribute:
      / ((?!\d|[. ]*?(if|else|do|for|case|try|catch|while|with|switch))[a-zA-Z0-9_ $]+)(?=\(.*\).*{)/,
    keyword:
      /\b(drop|async|await|break|case|catch|const|continue|debugger|default|delete|do|else|export|extends|finally|for|from|if|implements|import|in|instanceof|interface|let|new|package|private|protected|public|return|static|super|switch|throw|try|typeof|while|with|yield)\b/,
    declare: /\b(function|interface|class|var|let|const|enum|void)\b/,
    variable:
      /\b(Object|Function|Boolean|Error|EvalError|InternalError|RangeError|ReferenceError|StopIteration|SyntaxError|TypeError|URIError|Number|Math|Date|String|RegExp|Array|Float32Array|Float64Array|Int16Array|Int32Array|Int8Array|Uint16Array|Uint32Array|Uint8Array|Uint8ClampedArray|ArrayBuffer|DataView|JSON|Intl|arguments|console|window|document|Symbol|Set|Map|WeakSet|WeakMap|Proxy|Reflect|Promise)\b/,
    special: /\b(true|false|null|undefined)\b/,
    params: /function[ (]{1}[^]*?\{/,
    brackets: /[{}()[\]]/,
    symbol: /[;,.]/,

    // 'arguments': /(?:(?!if|else|do|for|case|try|catch|while|with|switch))(?:[^\(\n]*)(?:\().([^{()}]+)(?=[\}\)]+\s?\{)/,
    // / (?!\d|[. ]*?(?=if|else|do|for|case|try|catch|while|with|switch))(?=[a-zA-Z0-9_ $])+(?!\()([^{()}]+)(?=[\}\)]+\s?\{)/,
    // 'arguments': /(?!\()([^()]+)(?=\).+\{)/,
    regexp: /(?![^/])(\/(?![/|*]).*?[^\\^]\/)([;\n.)\]} gim])/,

    xml: /<[^>]*>/,
    url: /((\w+:\/\/)[-a-zA-Z0-9:@;?&=/%+.*!'(),$_{}^~[\]`#|]+)/,
    indent: /^ +|^\t+/, //(?!.*(if|else|do|for|case|try|catch|while|with|switch))
    line: /^.+$|^\n/,
    newline: /\r\n|\r|\n/,
  }

  static parse(
    s: string,
    regexp: RegExp,
    filter?: (s: RegExpExecArray) => boolean
  ) {
    const words: RegExpExecArray[] = []
    let word: RegExpExecArray | null

    if (filter) {
      while ((word = regexp.exec(s))) {
        if (filter(word)) words.push(word)
      }
    } else {
      while ((word = regexp.exec(s))) {
        words.push(word)
      }
    }

    return words
  }
}

Regexp.types.comment = Regexp.create(['single comment', 'double comment'])

Regexp.types.string = Regexp.create([
  'single quote string',
  'double quote string',
  'template string',
])

Regexp.types.multiline = Regexp.create([
  'double comment',
  'template string',
  'indent',
  'line',
])
