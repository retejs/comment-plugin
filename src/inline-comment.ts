import { AreaPlugin } from 'rete-area-plugin'

import { Comment } from './comment'
import { ExpectedSchemes } from './types'
import { intersectRect } from './utils'

export class InlineComment extends Comment {
    constructor(
        text: string,
        private area: AreaPlugin<ExpectedSchemes, any>,
        events?: {
            contextMenu?: (comment: InlineComment) => void
            pick?: (comment: InlineComment) => void,
            translate?: (comment: InlineComment, dx: number, dy: number) => void
        }
    ) {
        super(text, () => area.area.transform.k, {
            contextMenu: () => events?.contextMenu && events.contextMenu(this),
            pick: () => events?.pick && events.pick(this),
            translate: (dx, dy) => events?.translate && events.translate(this, dx, dy),
            drag: () => this.link()
        })

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
