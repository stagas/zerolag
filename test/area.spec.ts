// @env browser
import { Area } from '../src/area'

describe('Area', () => {
  it('join', () => {
    const a = new Area({
      begin: { x: 5, y: 6 },
      end: { x: 2, y: 10 },
    })

    const b = new Area({
      begin: { x: 5, y: 16 },
      end: { x: 2, y: 20 },
    })

    const area = Area.join([a, b])
    expect(area).toMatchSnapshot()
  })
})
