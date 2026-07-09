import { containsRect, intersectRect, trackDragging } from '../src/utils'

describe('intersectRect', () => {
  const outer = { left: 0, top: 0, right: 100, bottom: 100 }

  it('detects overlapping rectangles', () => {
    expect(intersectRect(outer, { left: 50, top: 50, right: 150, bottom: 150 })).toBe(true)
  })

  it('detects separated rectangles', () => {
    expect(intersectRect(outer, { left: 200, top: 200, right: 300, bottom: 300 })).toBe(false)
  })
})

describe('containsRect', () => {
  const outer = { left: 0, top: 0, right: 200, bottom: 200 }

  it('detects a rectangle inside another', () => {
    expect(containsRect(outer, { left: 10, top: 10, right: 50, bottom: 50 })).toBe(true)
  })

  it('detects a rectangle outside another', () => {
    expect(containsRect(outer, { left: 150, top: 150, right: 250, bottom: 250 })).toBe(false)
  })
})

describe('trackDragging', () => {
  it('tracks a node while it is being dragged', () => {
    const dragging = trackDragging()

    expect(dragging.isDragging('n1')).toBe(false)

    dragging.start('n1')

    expect(dragging.isDragging('n1')).toBe(true)
    expect(dragging.isDragging('n2')).toBe(false)
  })

  it('clears drag tracking when drag stops', () => {
    const dragging = trackDragging()

    dragging.start('n1')
    dragging.stop('n1')

    expect(dragging.isDragging('n1')).toBe(false)
  })

  it('tracks multiple dragged nodes independently', () => {
    const dragging = trackDragging()

    dragging.start('n1')
    dragging.start('n2')

    expect(dragging.isDragging('n1')).toBe(true)
    expect(dragging.isDragging('n2')).toBe(true)

    dragging.stop('n1')

    expect(dragging.isDragging('n1')).toBe(false)
    expect(dragging.isDragging('n2')).toBe(true)
  })
})
