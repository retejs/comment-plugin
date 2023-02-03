import { NodeEditor, NodeId } from 'rete'
import { AreaPlugin } from 'rete-area-plugin'

import { Comment } from './comment'
import { ExpectedSchemes } from './types'
import { containsRect, intersectRect, nodesBBox, Rect } from './utils'

export class FrameComment extends Comment {
    width = 100
    height = 100
    links: string[] = []

    constructor(
        text: string,
        private area: AreaPlugin<ExpectedSchemes, never>,
        private editor: NodeEditor<ExpectedSchemes>,
        events?: {
            contextMenu?: (comment: FrameComment) => void,
            pick?: (comment: FrameComment) => void,
            translate?: (comment: FrameComment, dx: number, dy: number) => void,
        }
    ) {
        super(text, () => area.area.transform.k, {
            contextMenu: () => events?.contextMenu && events.contextMenu(this),
            pick: () => events?.pick && events.pick(this),
            translate: (dx, dy) => events?.translate && events.translate(this, dx, dy),
            drag: () => 1
        })

        this.element.className = 'frame-comment'
    }

    private getRect(): Rect {
        return {
            left: this.x,
            top: this.y,
            right: this.x + this.width,
            bottom: this.y + this.height
        }
    }

    public contains(nodeId: NodeId) {
        const view = this.area.nodeViews.get(nodeId)
        const node = this.editor.getNode(nodeId)

        if (!view) return false
        return containsRect(this.getRect(), {
            left: view.position.x,
            top: view.position.y,
            right: view.position.x + node.width,
            bottom: view.position.y + node.height
        })
    }

    public intersects(nodeId: NodeId) {
        const view = this.area.nodeViews.get(nodeId)
        const node = this.editor.getNode(nodeId)

        if (!view) return false
        return intersectRect(this.getRect(), {
            left: view.position.x,
            top: view.position.y,
            right: view.position.x + node.width,
            bottom: view.position.y + node.height
        })
    }

    public linkTo(ids: string[]): void {
        super.linkTo(ids)
        const { k } = this.area.area.transform
        const bbox = nodesBBox(this.area, ids, { top: 50, left: 20, right: 20, bottom: 20 }, k)

        if (bbox) {
            this.x = bbox.left
            this.y = bbox.top
            this.width = bbox.width
            this.height = bbox.height
        } else {
            this.width = 100
            this.height = 100
        }
        this.update()
    }

    public update() {
        super.update()

        this.element.style.width = this.width+'px'
        this.element.style.height = this.height+'px'
    }

}
