import { Parts } from '../src/parts'

let p

describe('Parts', () => {
  it('append', () => {
    p = new Parts(2)

    p.append([1, 2, 3])
    expect(3).toEqual(p.length)
    expect(1).toEqual(p.parts.length)
    expect(0).toEqual(p.parts[0].startIndex)
    expect(0).toEqual(p.parts[0].startOffset)
    expect([1, 2, 3]).toEqual(p.parts[0].slice())

    p.append([5, 6])
    expect(5).toEqual(p.length)
    expect(2).toEqual(p.parts.length)
    expect(3).toEqual(p.parts[1].startIndex)
    expect(5).toEqual(p.parts[1].startOffset)
    expect([0, 1]).toEqual(p.parts[1].slice())

    p.append([10, 11])
    expect(7).toEqual(p.length)
    expect(3).toEqual(p.parts.length)
    expect(5).toEqual(p.parts[2].startIndex)
    expect(10).toEqual(p.parts[2].startOffset)
    expect([0, 1]).toEqual(p.parts[2].slice())

    p = new Parts(10)

    p.append([1, 2, 3])
    expect(3).toEqual(p.length)
    expect(1).toEqual(p.parts.length)
    expect(0).toEqual(p.parts[0].startIndex)
    expect(0).toEqual(p.parts[0].startOffset)
    expect([1, 2, 3]).toEqual(p.parts[0].slice())

    p.append([5, 6])
    expect(5).toEqual(p.length)
    expect(1).toEqual(p.parts.length)
    expect(0).toEqual(p.parts[0].startIndex)
    expect(0).toEqual(p.parts[0].startOffset)
    expect([1, 2, 3, 5, 6]).toEqual(p.parts[0].slice())

    p.append([10, 11])
    expect(7).toEqual(p.length)
    expect(1).toEqual(p.parts.length)
    expect(0).toEqual(p.parts[0].startIndex)
    expect(0).toEqual(p.parts[0].startOffset)
    expect([1, 2, 3, 5, 6, 10, 11]).toEqual(p.parts[0].slice())
  })

  it('findPartByIndex', () => {
    p = new Parts(2)

    p.append([1, 2, 3])
    p.append([5, 6])
    p.append([10, 11])

    expect(p.parts[0]).toEqual(p.findPartByIndex(0).item)
    expect(p.parts[0]).toEqual(p.findPartByIndex(1).item)
    expect(p.parts[0]).toEqual(p.findPartByIndex(2).item)
    expect(p.parts[1]).toEqual(p.findPartByIndex(3).item)
    expect(p.parts[1]).toEqual(p.findPartByIndex(4).item)
    expect(p.parts[2]).toEqual(p.findPartByIndex(5).item)
    expect(p.parts[2]).toEqual(p.findPartByIndex(6).item)

    p = new Parts(10)

    p.append([1, 2, 3])
    p.append([5, 6])
    p.append([10, 11])

    expect(p.parts[0]).toEqual(p.findPartByIndex(0).item)
    expect(p.parts[0]).toEqual(p.findPartByIndex(1).item)
    expect(p.parts[0]).toEqual(p.findPartByIndex(2).item)
    expect(p.parts[0]).toEqual(p.findPartByIndex(3).item)
    expect(p.parts[0]).toEqual(p.findPartByIndex(4).item)
    expect(p.parts[0]).toEqual(p.findPartByIndex(5).item)
    expect(p.parts[0]).toEqual(p.findPartByIndex(6).item)
  })

  it('get', () => {
    p = new Parts(2)

    p.append([1, 2, 3])
    p.append([5, 6])
    p.append([10, 11])

    expect(1).toEqual(p.get(0))
    expect(2).toEqual(p.get(1))
    expect(3).toEqual(p.get(2))
    expect(5).toEqual(p.get(3))
    expect(6).toEqual(p.get(4))
    expect(10).toEqual(p.get(5))
    expect(11).toEqual(p.get(6))

    p = new Parts(10)

    p.append([1, 2, 3])
    p.append([5, 6])
    p.append([10, 11])

    expect(1).toEqual(p.get(0))
    expect(2).toEqual(p.get(1))
    expect(3).toEqual(p.get(2))
    expect(5).toEqual(p.get(3))
    expect(6).toEqual(p.get(4))
    expect(10).toEqual(p.get(5))
    expect(11).toEqual(p.get(6))
  })

  it('findPartByOffset', () => {
    p = new Parts(2)

    p.append([1, 2, 3])
    p.append([5, 6])
    p.append([10, 11])

    expect(p.parts[0]).toEqual(p.findPartByOffset(0).item)
    expect(p.parts[0]).toEqual(p.findPartByOffset(1).item)
    expect(p.parts[0]).toEqual(p.findPartByOffset(2).item)
    expect(p.parts[0]).toEqual(p.findPartByOffset(3).item)
    expect(p.parts[0]).toEqual(p.findPartByOffset(4).item)
    expect(p.parts[1]).toEqual(p.findPartByOffset(5).item)
    expect(p.parts[1]).toEqual(p.findPartByOffset(6).item)
    expect(p.parts[1]).toEqual(p.findPartByOffset(7).item)
    expect(p.parts[2]).toEqual(p.findPartByOffset(10).item)
    expect(p.parts[2]).toEqual(p.findPartByOffset(11).item)
    expect(p.parts[2]).toEqual(p.findPartByOffset(12).item)

    p = new Parts(10)

    p.append([1, 2, 3])
    p.append([5, 6])
    p.append([10, 11])

    expect(p.parts[0]).toEqual(p.findPartByOffset(0).item)
    expect(p.parts[0]).toEqual(p.findPartByOffset(1).item)
    expect(p.parts[0]).toEqual(p.findPartByOffset(2).item)
    expect(p.parts[0]).toEqual(p.findPartByOffset(3).item)
    expect(p.parts[0]).toEqual(p.findPartByOffset(4).item)
    expect(p.parts[0]).toEqual(p.findPartByOffset(5).item)
    expect(p.parts[0]).toEqual(p.findPartByOffset(6).item)
    expect(p.parts[0]).toEqual(p.findPartByOffset(7).item)
    expect(p.parts[0]).toEqual(p.findPartByOffset(10).item)
    expect(p.parts[0]).toEqual(p.findPartByOffset(11).item)
    expect(p.parts[0]).toEqual(p.findPartByOffset(12).item)
  })

  it('find', () => {
    p = new Parts(2)

    p.append([1, 2, 3])
    p.append([5, 6])
    p.append([10, 11])

    expect({
      offset: 1,
      index: 0,
      local: 0,
      part: p.parts[0],
      partIndex: 0,
    }).toEqual(p.find(0))

    expect({
      offset: 1,
      index: 0,
      local: 0,
      part: p.parts[0],
      partIndex: 0,
    }).toEqual(p.find(1))

    expect({
      offset: 2,
      index: 1,
      local: 1,
      part: p.parts[0],
      partIndex: 0,
    }).toEqual(p.find(2))

    expect({
      offset: 5,
      index: 3,
      local: 0,
      part: p.parts[1],
      partIndex: 1,
    }).toEqual(p.find(5))

    expect({
      offset: 6,
      index: 4,
      local: 1,
      part: p.parts[1],
      partIndex: 1,
    }).toEqual(p.find(6))

    expect({
      offset: 6,
      index: 4,
      local: 1,
      part: p.parts[1],
      partIndex: 1,
    }).toEqual(p.find(7))

    expect({
      offset: 10,
      index: 5,
      local: 0,
      part: p.parts[2],
      partIndex: 2,
    }).toEqual(p.find(10))

    expect({
      offset: 11,
      index: 6,
      local: 1,
      part: p.parts[2],
      partIndex: 2,
    }).toEqual(p.find(11))

    expect({
      offset: 11,
      index: 6,
      local: 1,
      part: p.parts[2],
      partIndex: 2,
    }).toEqual(p.find(12))
  })

  it('removeBelowOffset', () => {
    p = new Parts(2)

    p.append([1, 2, 3])
    p.append([5, 6])
    p.append([10, 11])

    let item

    item = p.find(3)!
    expect(7).toEqual(p.length)
    p.removeBelowOffset(3, item.part)
    expect(5).toEqual(p.length)
    expect([3]).toEqual(p.parts[0].slice())

    item = p.find(11)!
    p.removeBelowOffset(11, item.part)
    expect([1]).toEqual(p.parts[2].slice())
  })

  it('removeRange', () => {
    p = new Parts(2)
    p.append([1, 2, 3])
    p.append([5, 6])
    p.append([10, 11])
    expect(7).toEqual(p.length)
    expect(3).toEqual(p.parts[1].startIndex)
    expect(5).toEqual(p.parts[2].startIndex)
    p.removeRange([2, 3])
    expect(6).toEqual(p.length)
    expect([1, 3]).toEqual(p.parts[0].slice())
    expect(2).toEqual(p.parts[1].startIndex)
    expect(4).toEqual(p.parts[2].startIndex)

    p = new Parts(2)
    p.append([1, 2, 3])
    p.append([5, 6])
    p.append([10, 11])
    p.removeRange([2, 4])
    expect(5).toEqual(p.length)
    expect([1]).toEqual(p.parts[0].slice())
    expect(1).toEqual(p.parts[1].startIndex)
    expect(3).toEqual(p.parts[2].startIndex)

    p = new Parts(2)
    p.append([1, 2, 3])
    p.append([5, 6])
    p.append([10, 11])
    p.removeRange([3, 4])
    expect(6).toEqual(p.length)
    expect([1, 2]).toEqual(p.parts[0].slice())
    expect([0, 1]).toEqual(p.parts[1].slice())
    expect(0).toEqual(p.parts[0].startIndex)
    expect(2).toEqual(p.parts[1].startIndex)
    expect(4).toEqual(p.parts[2].startIndex)

    p = new Parts(2)
    p.append([1, 2, 3])
    p.append([5, 6])
    p.append([10, 11])
    p.removeRange([3, 6])
    expect(5).toEqual(p.length)
    expect([1, 2]).toEqual(p.parts[0].slice())
    expect([1]).toEqual(p.parts[1].slice())
    expect(0).toEqual(p.parts[0].startIndex)
    expect(2).toEqual(p.parts[1].startIndex)
    expect(3).toEqual(p.parts[2].startIndex)

    p = new Parts(2)
    p.append([1, 2, 3])
    p.append([5, 6])
    p.append([10, 11])
    p.removeRange([3, 9])
    expect([1, 2]).toEqual(p.parts[0].slice())
    expect([0, 1]).toEqual(p.parts[1].slice())
    expect(0).toEqual(p.parts[0].startIndex)
    expect(2).toEqual(p.parts[1].startIndex)

    p = new Parts(2)
    p.append([1, 2, 3])
    p.append([5, 6])
    p.append([10, 11])
    p.append([15, 16])
    expect(7).toEqual(p.parts[3].startIndex)
    p.removeRange([3, 11])
    expect(5).toEqual(p.length)
    expect([1, 2]).toEqual(p.parts[0].slice())
    expect([1]).toEqual(p.parts[1].slice())
    expect(0).toEqual(p.parts[0].startIndex)
    expect(2).toEqual(p.parts[1].startIndex)
    expect(3).toEqual(p.parts[2].startIndex)

    p = new Parts(2)
    p.append([1, 2, 3])
    p.append([5, 6])
    p.append([10, 11])
    p.append([15, 16])
    p.removeRange([0, 17])
    expect(0).toEqual(p.length)
    expect(0).toEqual(p.parts.length)

    p = new Parts(2)
    p.append([1, 2, 3])
    p.append([5, 6])
    p.append([10, 11])
    p.append([15, 16])
    p.removeRange([0, 18])
    expect(0).toEqual(p.parts.length)
  })

  it('shiftOffset', () => {
    p = new Parts(2)
    p.append([1, 2, 3])
    p.append([5, 6])
    p.append([10, 11])
    expect(3).toEqual(p.parts[0].length)
    expect(3).toEqual(p.parts[1].startIndex)
    expect(5).toEqual(p.parts[2].startIndex)
    expect(5).toEqual(p.parts[1].startOffset)
    expect(10).toEqual(p.parts[2].startOffset)
    p.shiftOffset(2, -1)
    expect(6).toEqual(p.length)
    expect(2).toEqual(p.parts[0].length)
    expect(2).toEqual(p.parts[1].startIndex)
    expect(4).toEqual(p.parts[2].startIndex)
    expect(4).toEqual(p.parts[1].startOffset)
    expect(9).toEqual(p.parts[2].startOffset)

    p = new Parts(2)
    p.append([1, 2, 3])
    p.append([5, 6])
    p.append([10, 11])
    expect(3).toEqual(p.parts[0].length)
    expect(3).toEqual(p.parts[1].startIndex)
    expect(5).toEqual(p.parts[2].startIndex)
    expect(5).toEqual(p.parts[1].startOffset)
    expect(10).toEqual(p.parts[2].startOffset)
    p.shiftOffset(2, -2)
    expect(5).toEqual(p.length)
    expect(1).toEqual(p.parts[0].length)
    expect(1).toEqual(p.parts[1].startIndex)
    expect(3).toEqual(p.parts[2].startIndex)
    expect(3).toEqual(p.parts[1].startOffset)
    expect(8).toEqual(p.parts[2].startOffset)

    p = new Parts(2)
    p.append([1, 2, 3])
    p.append([5, 6])
    p.append([10, 11])
    expect(3).toEqual(p.parts[0].length)
    expect(3).toEqual(p.parts[1].startIndex)
    expect(5).toEqual(p.parts[2].startIndex)
    expect(5).toEqual(p.parts[1].startOffset)
    expect(10).toEqual(p.parts[2].startOffset)
    p.shiftOffset(2, 2)
    expect(7).toEqual(p.length)
    expect(3).toEqual(p.parts[0].length)
    expect(1).toEqual(p.parts[0][0])
    expect(4).toEqual(p.parts[0][1])
    expect(5).toEqual(p.parts[0][2])
    expect(3).toEqual(p.parts[1].startIndex)
    expect(5).toEqual(p.parts[2].startIndex)
    expect(7).toEqual(p.parts[1].startOffset)
    expect(12).toEqual(p.parts[2].startOffset)

    p = new Parts(2)
    p.append([1, 2, 3])
    p.append([5, 6])
    p.append([10, 11])
    p.shiftOffset(2, -100)
    expect(1).toEqual(p.length)

    p = new Parts(2)
    p.append([1, 2, 3])
    p.append([5, 6])
    p.append([10, 11])
    p.shiftOffset(2, -9)
    expect(2).toEqual(p.length)
    expect(1).toEqual(p.get(0))
    expect(2).toEqual(p.get(1))
  })

  it('insert', () => {
    p = new Parts(2)
    p.append([1, 2, 3])
    p.append([5, 6])
    p.append([10, 11])
    expect(7).toEqual(p.length)
    expect(3).toEqual(p.parts[1].startIndex)
    expect(5).toEqual(p.parts[2].startIndex)
    p.insert(7, [7, 8, 9])
    expect(10).toEqual(p.length)
    expect([0, 1, 2, 3, 4]).toEqual(p.parts[1].slice())
    expect(8).toEqual(p.parts[2].startIndex)

    p = new Parts(2)
    p.append([3, 4])
    p.append([5, 6])
    p.append([10, 11])
    expect(6).toEqual(p.length)
    expect(2).toEqual(p.parts[1].startIndex)
    expect(4).toEqual(p.parts[2].startIndex)
    p.insert(0, [1, 2])
    expect(8).toEqual(p.length)
    expect([1, 2, 3, 4]).toEqual(p.parts[0].slice())
    expect(4).toEqual(p.parts[1].startIndex)
  })
})
