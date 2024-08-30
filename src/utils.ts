import { NodeEditor, NodeId } from 'rete'
import { BaseAreaPlugin } from 'rete-area-plugin'

import { ExpectedSchemes } from './types'

export type Rect = { left: number, top: number, right: number, bottom: number }

export function intersectRect(r1: Rect, r2: Rect) {
  return !(
    r2.left > r1.right
    || r2.right < r1.left
    || r2.top > r1.bottom
    || r2.bottom < r1.top
  )
}

export function containsRect(r1: Rect, r2: Rect) {
  return (
    r2.left > r1.left
    && r2.right < r1.right
    && r2.top > r1.top
    && r2.bottom < r1.bottom
  )
}

export function nodesBBox<S extends ExpectedSchemes>(editor: NodeEditor<S>, area: BaseAreaPlugin<S, any>, ids: NodeId[], margin: number | Rect) {
  const marginRect: Rect = typeof margin === 'number'
    ? { left: margin, top: margin, right: margin, bottom: margin }
    : margin
  const rects = ids.map(id => {
    const view = area.nodeViews.get(id)

    if (!view) return null

    const { width, height } = editor.getNode(id)

    return { id, position: view.position, width: width, height: height }
  }).filter((item): item is Exclude<typeof item, null> => Boolean(item))

  if (rects.length === 0) return null

  const left = Math.min(...rects.map(p => p.position.x)) - marginRect.left
  const top = Math.min(...rects.map(p => p.position.y)) - marginRect.top
  const right = Math.max(...rects.map(rect => rect.position.x + rect.width)) + marginRect.right
  const bottom = Math.max(...rects.map(rect => rect.position.y + rect.height)) + marginRect.bottom

  return {
    left,
    right,
    top,
    bottom,
    width: Math.abs(left - right),
    height: Math.abs(top - bottom),
    getCenter: () => {
      return [
        (left + right) / 2,
        (top + bottom) / 2
      ]
    }
  }
}

export function trackedTranslate<S extends ExpectedSchemes, T>(props: { area: BaseAreaPlugin<S, T> }): {
  translate: (id: string, x: number, y: number) => Promise<void>
  isTranslating: (id: NodeId) => boolean
} {
  const active = new Map<NodeId, number>()
  const increment = (id: NodeId) => active.set(id, (active.get(id) ?? 0) + 1)
  const decrement = (id: NodeId) => active.set(id, (active.get(id) ?? 0) - 1)

  return {
    async translate(id, x, y) {
      const view = props.area.nodeViews.get(id)

      if (!view) throw new Error('cannot find parent node view')

      const previous = view.position

      if (previous.x !== x || previous.y !== y) {
        increment(id)
        await view.translate(x, y)
        decrement(id)
      }
    },
    isTranslating(id) {
      return (active.get(id) ?? 0) > 0
    }
  }
}
