import { PrefixTreeNode } from '../src/prefixtree'

describe('PrefixTree', () => {
  const words = ['foo', 'fo', 'ba', 'bar']

  it('insert', () => {
    const node = new PrefixTreeNode()
    words.forEach(word => node.insert(word))
    expect('').toEqual(node.value)
    expect('').toEqual(node.children.f.value)
    expect('fo').toEqual(node.children.f.children.o.value)
    expect('foo').toEqual(node.children.f.children.o.children.o.value)
    expect('ba').toEqual(node.children.b.children.a.value)
    expect('bar').toEqual(node.children.b.children.a.children.r.value)
  })

  it('find', () => {
    const node = new PrefixTreeNode()
    words.forEach(word => node.insert(word))
    expect(undefined).toEqual(node.find('x'))
    expect('').toEqual(node.find('f')!.value)
    expect('fo').toEqual(node.find('fo')!.value)
    expect('foo').toEqual(node.find('foo')!.value)
    expect('').toEqual(node.find('b')!.value)
    expect('ba').toEqual(node.find('ba')!.value)
    expect('bar').toEqual(node.find('bar')!.value)
  })

  // it('getChildren', function() {
  //   var node = new PrefixTreeNode;
  //   words.forEach((word) => node.insert(word));
  //   expect(['ba', 'fo', 'bar', 'foo']).toEqual(
  //     node.getChildren().map(node => node.value)
  //   )
  //   node.children.f.children.o.incrementRank();
  //   expect(['fo', 'ba', 'bar', 'foo']).toEqual(
  //     node.getChildren().map(node => node.value)
  //   )
  // })

  it('collect', () => {
    const node = new PrefixTreeNode()
    words.forEach(word => node.insert(word))
    expect(['bar', 'ba']).toEqual(node.collect('b').map(node => node.value))
    expect(['foo', 'fo']).toEqual(node.collect('f').map(node => node.value))
    expect(['foo']).toEqual(node.collect('foo').map(node => node.value))
    expect([]).toEqual(node.collect('x'))
  })

  it('index', () => {
    const node = new PrefixTreeNode()
    const s = 'foo bar fo ba'
    node.index(s)
    expect(['', '', 'fo', 'foo', 'ba', 'bar']).toEqual(
      node.getChildren().map(node => node.value)
    )
  })
})
