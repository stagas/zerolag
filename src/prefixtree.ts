// var WORD = /\w+/g;
const WORD = /[a-zA-Z0-9]{1,}/g
// var rank = 0;

export class PrefixTreeNode {
  value: string
  rank: number
  children: Record<string, PrefixTreeNode>
  constructor() {
    this.value = ''
    this.rank = 0
    this.children = {}
  }
  getChildren(): PrefixTreeNode[] {
    const children = Object.keys(this.children).map(key => this.children[key])

    return children.reduce((p, n) => p.concat(n.getChildren()), children)
  }
  collect(key: string) {
    let collection: PrefixTreeNode[] = []
    const node = this.find(key)
    if (node) {
      collection = node
        .getChildren()
        .filter(node => node.value)
        .sort((a, b) => {
          let res = b.rank - a.rank
          if (res === 0) res = b.value.length - a.value.length
          if (res === 0) res = (a.value > b.value) as unknown as number
          return res
        })

      if (node.value) collection.push(node)
    }
    return collection
  }
  find(key: string) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let node: PrefixTreeNode = this
    for (const char in key as unknown as string[]) {
      if (key[char] in node.children) {
        node = node.children[key[char]]
      } else {
        return
      }
    }
    return node
  }
  insert(s: string) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let node: PrefixTreeNode = this
    let i = 0
    const n = s.length

    while (i < n) {
      if (s[i] in node.children) {
        node = node.children[s[i]]
        i++
      } else {
        break
      }
    }

    while (i < n) {
      node = node.children[s[i]] = node.children[s[i]] || new PrefixTreeNode()
      i++
    }

    node.value = s
    node.rank++
  }
  index(s: string) {
    let word
    while ((word = WORD.exec(s))) {
      this.insert(word[0])
    }
  }
}
