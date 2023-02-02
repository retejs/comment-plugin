import { getUID, NodeId } from 'rete'
import { Drag } from 'rete-area-plugin'

export class Comment {
    id: string
    dragHandler!: Drag
    x = 0
    y = 0
    links: string[] = []
    element!: HTMLElement
    prevPosition?: { x: number, y: number }

    constructor(
        public text: string,
        private getZoom: () => number,
        private contextMenu?: null | (() => void),
        private translate?: null | ((dx: number, dy: number) => void),
        private drag?: null | (() => void)
    ) {
        this.id = getUID()
        this.element = document.createElement('div')
        this.element.addEventListener('contextmenu', this.onContextMenu.bind(this))

        this.dragHandler = new Drag(
            this.element,
            () => ({ x: this.x, y: this.y }),
            () => this.getZoom(),
            () => this.prevPosition = { x: this.x, y: this.y },
            (x, y) => this.onTranslate(x, y),
            () => this.drag && this.drag()
        )
        this.update()
    }

    linkTo(ids: NodeId[]) {
        this.links = ids || []
    }

    linkedTo(nodeId: NodeId) {
        return this.links.includes(nodeId)
    }

    onContextMenu(e: MouseEvent) {
        e.preventDefault()
        e.stopPropagation()

        this.contextMenu && this.contextMenu()
    }

    onTranslate(x: number, y: number) {
        this.x = x
        this.y = y

        if (this.prevPosition && this.translate) {
            this.translate(x - this.prevPosition.x, y - this.prevPosition.y)
        }
        this.prevPosition = { x, y }

        this.update()
    }

    update() {
        this.element.innerText = this.text
        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`
    }

    destroy() {
        this.dragHandler.destroy()
    }
}
