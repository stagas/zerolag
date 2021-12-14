import { Buffer } from '../'

const fixture = `
1/*
2foo
3 */

5while (true) {
6  if (this[something]) {
7    return \`
8foo
9bar
0\`
1  }
2}
3123`

let b: Buffer

function before(text?: string) {
  b = new Buffer()
  b.setText(text || fixture)
}
describe('Buffer', () => {
  it('setText', () => {
    before()
    expect(fixture).toEqual(b.raw)
  })

  it('toString', () => {
    before()
    expect(fixture).toEqual(b.toString())
  })

  it('loc', () => {
    before()
    expect(13).toEqual(b.loc())

    before('one\n')
    expect(1).toEqual(b.loc())
  })

  it('getLineOffset', () => {
    before('012\n45\n78\n')
    expect(0).toEqual(b.getLineOffset(0))
    expect(4).toEqual(b.getLineOffset(1))
    expect(7).toEqual(b.getLineOffset(2))
    expect(10).toEqual(b.getLineOffset(3))
    // expect(10).toEqual(b.getLineOffset(4));
  })

  it('getLineRangeOffsets', () => {
    before('012\n45\n78\n1')
    expect([0, 4]).toEqual(b.getLineRangeOffsets([0, 0]))
    expect([0, 7]).toEqual(b.getLineRangeOffsets([0, 1]))
    expect([4, 7]).toEqual(b.getLineRangeOffsets([1, 1]))
    expect([4, 10]).toEqual(b.getLineRangeOffsets([1, 2]))
    expect([7, 10]).toEqual(b.getLineRangeOffsets([2, 2]))
    expect([7, 11]).toEqual(b.getLineRangeOffsets([2, 3]))
    expect([10, 11]).toEqual(b.getLineRangeOffsets([3, 3]))
    expect([0, 10]).toEqual(b.getLineRangeOffsets([0, 2]))
    expect([0, 11]).toEqual(b.getLineRangeOffsets([0, 3]))
    expect([10, 11]).toEqual(b.getLineRangeOffsets([3, 4]))
  })

  it('getLine', () => {
    before('012\n45\n78\n1')
    expect([0, 4]).toEqual(b.getLine(0).offsetRange)
    expect(0).toEqual(b.getLine(0).offset)
    expect(3).toEqual(b.getLine(0).length)
    expect({ x: 0, y: 0 }).toEqual(b.getLine(0).point)
    expect([4, 7]).toEqual(b.getLine(1).offsetRange)
    expect(4).toEqual(b.getLine(1).offset)
    expect(2).toEqual(b.getLine(1).length)
    expect({ x: 0, y: 1 }).toEqual(b.getLine(1).point)
    expect([10, 11]).toEqual(b.getLine(3).offsetRange)
    expect(10).toEqual(b.getLine(3).offset)
    expect(1).toEqual(b.getLine(3).length)
    expect({ x: 0, y: 3 }).toEqual(b.getLine(3).point)
  })

  it('getLineRangeText', () => {
    before()
    expect('\n').toEqual(b.getLineRangeText([0, 0]))
    expect('1/*\n').toEqual(b.getLineRangeText([1, 1]))
    expect('2foo\n').toEqual(b.getLineRangeText([2, 2]))
    expect('2foo\n3 */\n').toEqual(b.getLineRangeText([2, 3]))
    expect('\n1/*\n').toEqual(b.getLineRangeText([0, 1]))
    expect('3123').toEqual(b.getLineRangeText([13, 13]))
    expect('2}\n3123').toEqual(b.getLineRangeText([12, 13]))
  })

  it('getOffsetPoint', () => {
    // before('\n234\n67\n9012');
    // expect({ x:0, y:0 }).toEqual(b.getOffsetPoint(0));
    // expect({ x:0, y:1 }).toEqual(b.getOffsetPoint(1));
    // expect({ x:1, y:1 }).toEqual(b.getOffsetPoint(2));
    // expect({ x:2, y:1 }).toEqual(b.getOffsetPoint(3));
    // expect({ x:0, y:2 }).toEqual(b.getOffsetPoint(4));

    before('01\n345\n78\n012')
    expect({ x: 0, y: 0 }).toEqual(b.getOffsetPoint(0))
    expect({ x: 1, y: 0 }).toEqual(b.getOffsetPoint(1))
    expect({ x: 2, y: 0 }).toEqual(b.getOffsetPoint(2))
    expect({ x: 0, y: 1 }).toEqual(b.getOffsetPoint(3))
    expect({ x: 1, y: 1 }).toEqual(b.getOffsetPoint(4))
    expect({ x: 2, y: 1 }).toEqual(b.getOffsetPoint(5))
    expect({ x: 3, y: 1 }).toEqual(b.getOffsetPoint(6))
    expect({ x: 0, y: 2 }).toEqual(b.getOffsetPoint(7))
  })

  it('failing #1', () => {
    before('\n\n\n/*\ntwo\n*/\n')
    expect([3, 10]).toEqual(b.tokens.tokens.segments.toArray())
    b.removeCharAtPoint({ x: 0, y: 1 } as any)
    expect('\n\n/*\ntwo\n*/\n').toEqual(b.text.toString())
    expect([2, 9]).toEqual(b.tokens.tokens.segments.toArray())
  })

  /*
t('insert', function() {
  before('012\n45\n78\n1');
  expect(4).toEqual(b.getLineOffset(1));
  expect(7).toEqual(b.getLineOffset(2));
  expect(3).toEqual(b.insert({x:0,y:0},'foo'));
  expect('foo012\n45\n78\n1').toEqual(b.toString());
  expect(7).toEqual(b.getLineOffset(1));
  expect(10).toEqual(b.getLineOffset(2));

  before('012\n45\n78\n1');
  expect(4).toEqual(b.getLineOffset(1));
  expect(7).toEqual(b.getLineOffset(2));
  expect(3).toEqual(b.insert({x:0,y:1},'foo'));
  expect('012\nfoo45\n78\n1').toEqual(b.toString());
  expect(4).toEqual(b.getLineOffset(1));
  expect(10).toEqual(b.getLineOffset(2));

  before('012\n45\n78\n1');
  expect(4).toEqual(b.getLineOffset(1));
  expect(7).toEqual(b.getLineOffset(2));
  expect(3).toEqual(b.insert({x:3,y:0},'foo'));
  expect('012foo\n45\n78\n1').toEqual(b.toString());
  expect(7).toEqual(b.getLineOffset(1));
  expect(10).toEqual(b.getLineOffset(2));
  expect(1).toEqual(b.insert({x:3,y:0},'a'));
  expect(8).toEqual(b.getLineOffset(1));

  before('012\n45\n78\n');
  expect(1).toEqual(b.insert({x:0,y:3},'a'));
  expect('012\n45\n78\na').toEqual(b.toString());
  expect(1).toEqual(b.insert({x:1,y:3},'b'));
  expect('012\n45\n78\nab').toEqual(b.toString());
})

t('charAt', function() {
  before('012\n45\n78\n1');
  expect('0').toEqual(b.charAt(0));
  expect('1').toEqual(b.charAt(1));
  expect('2').toEqual(b.charAt(2));
  expect('\n').toEqual(b.charAt(3));
  expect('1').toEqual(b.charAt(10));
})

t('removeOffsetRange', function() {
  before('012\n45\n78\n1');
  b.remove([0,4]);
  expect('45\n78\n1').toEqual(b.toString());
  b.remove([2,3]);
  expect('4578\n1').toEqual(b.toString());
})

t('removeCharAtPoint', function() {
  before('012\n45\n78\n1');
  b.removeCharAtPoint({x:0,y:0});
  expect('12\n45\n78\n1').toEqual(b.toString());
  b.removeCharAtPoint({x:0,y:1});
  expect('12\n5\n78\n1').toEqual(b.toString());
  b.removeCharAtPoint({x:0,y:2});
  expect('12\n5\n8\n1').toEqual(b.toString());
  b.removeCharAtPoint({x:0,y:3});
  expect('12\n5\n8\n').toEqual(b.toString());
  b.removeCharAtPoint({x:0,y:0});
  expect('2\n5\n8\n').toEqual(b.toString());
  b.removeCharAtPoint({x:0,y:0});
  expect('\n5\n8\n').toEqual(b.toString());
  b.removeCharAtPoint({x:0,y:0});
  expect('5\n8\n').toEqual(b.toString());

  before('\n123\n\n123\n\n');
  b.removeCharAtPoint({x:0,y:2});
  expect('\n123\n123\n\n').toEqual(b.toString());
  b.removeCharAtPoint({x:0,y:2});
  expect('\n123\n23\n\n').toEqual(b.toString());
  b.removeCharAtPoint({x:0,y:2});
  expect('\n123\n3\n\n').toEqual(b.toString());
  b.removeCharAtPoint({x:0,y:2});
  expect('\n123\n\n\n').toEqual(b.toString());
  b.removeCharAtPoint({x:0,y:2});
  expect('\n123\n\n').toEqual(b.toString());
  b.removeCharAtPoint({x:0,y:2});
  expect('\n123\n').toEqual(b.toString());
  b.removeCharAtPoint({x:0,y:0});
  expect('123\n').toEqual(b.toString());
  b.removeCharAtPoint({x:0,y:0});
  expect('23\n').toEqual(b.toString());
  b.removeCharAtPoint({x:0,y:0});
  expect('3\n').toEqual(b.toString());
  b.removeCharAtPoint({x:0,y:0});
  expect('\n').toEqual(b.toString());
  b.removeCharAtPoint({x:0,y:0});
  expect('').toEqual(b.toString());
})
/**/
})
