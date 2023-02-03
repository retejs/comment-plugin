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
        contextMenu?: (comment: FrameComment) => void
    ) {
        super(text, () => area.area.transform.k, () => contextMenu && contextMenu(this), (dx, dy) => this.translated(dx, dy))

        this.element.className = 'frame-comment'
    }

    private translated(dx: number, dy: number) {
        this.links
            .map(id => this.area.nodeViews.get(id))
            .forEach(view => {
                view?.translate(view.position.x + dx, view.position.y + dy)
            })
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
