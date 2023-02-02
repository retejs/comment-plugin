import { BaseSchemes, NodeId } from 'rete'
import { AreaPlugin } from 'rete-area-plugin'

const min = (arr: number[]) => arr.length === 0 ? 0 : Math.min(...arr)
const max = (arr: number[]) => arr.length === 0 ? 0 : Math.max(...arr)

export type Rect = { left: number, top: number, right: number, bottom: number }

export function intersectRect(r1: Rect, r2: Rect) {
    return !(
        r2.left > r1.right ||
        r2.right < r1.left ||
        r2.top > r1.bottom ||
        r2.bottom < r1.top
    )
}

export function containsRect(r1: Rect, r2: Rect) {
    return (
        r2.left > r1.left &&
        r2.right < r1.right &&
        r2.top > r1.top &&
        r2.bottom < r1.bottom
    )
}

export function nodesBBox<S extends BaseSchemes>(area: AreaPlugin<S, never>, ids: NodeId[], margin: number | Rect, k: number) {
    const rects = ids.map(id => {
        const view = area.nodeViews.get(id)

        if (!view) return null

        const { width, height } = view.element.getBoundingClientRect()

        return { id, position: view.position, width: width / k, height: height / k }
    }).filter((item): item is Exclude<typeof item, null> => Boolean(item))
    const marginRect: Rect = typeof margin === 'number'
        ? { left: margin, top: margin, right: margin, bottom: margin }
        : margin
    const left = min(rects.map(p => p.position.x)) - marginRect.left
    const top = min(rects.map(p => p.position.y)) - marginRect.top
    const right = max(rects.map(({ position, width }) => position.x + width)) + marginRect.right
    const bottom = max(rects.map(({ position, height }) => position.y + height)) + marginRect.bottom

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
