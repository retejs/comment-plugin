import { AreaPlugin } from 'rete-area-plugin'

import { Comment } from './comment'
import { ExpectedSchemes } from './types'
import { intersectRect } from './utils'

export class InlineComment extends Comment {
    constructor(
        text: string,
        private area: AreaPlugin<ExpectedSchemes, any>,
        contextMenu?: (comment: InlineComment) => void
    ) {
        super(text, () => area.area.transform.k, () => contextMenu && contextMenu(this), () => this.link())

        this.element.className = 'inline-comment'
    }

    link() {
        const intersection = this.getIntersectNode()

        this.linkTo(intersection ? [intersection.id] : [])
    }

    getIntersectNode() {
        const commRect = this.element.getBoundingClientRect()

        return Array.from(this.area.nodeViews)
            .map(([id, view]) => {
                return { id, rect: view.element.getBoundingClientRect() }
            })
            .find(({ rect }) => {
                return intersectRect(commRect, rect)
            })
    }

    offset(dx: number, dy: number) {
        this.x += dx
        this.y += dy
        this.update()
    }
}
