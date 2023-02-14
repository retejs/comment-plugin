import { getUID, NodeId } from 'rete'
import { Drag } from 'rete-area-plugin'

export class Comment {
  id: string
  dragHandler!: Drag
  x = 0
  y = 0
  links: string[] = []
  element!: HTMLElement
  prevPosition: null | { x: number, y: number } = null

  constructor(
        public text: string,
        private getZoom: () => number,
        private events?: {
            contextMenu?: null | (() => void),
            pick?: null | (() => void),
            translate?: null | ((dx: number, dy: number) => void),
            drag?: null | (() => void)
        }
  ) {
    this.id = getUID()
    this.element = document.createElement('div')
    this.element.addEventListener('contextmenu', this.onContextMenu.bind(this))

    this.dragHandler = new Drag(
      this.element,
      () => ({ x: this.x, y: this.y }),
      () => this.getZoom(),
      () => {
        this.prevPosition = { x: this.x, y: this.y }
        this.events?.pick && this.events?.pick()
      },
      (x, y) => this.onTranslate(x, y),
      () => {
        this.prevPosition = null
        this.events?.drag && this.events?.drag()
      }
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

    this.events?.contextMenu && this.events?.contextMenu()
  }

  onTranslate(x: number, y: number) {
    if (!this.prevPosition) return

    const dx = x - this.prevPosition.x
    const dy = y - this.prevPosition.y

    this.translate(dx, dy)
    this.prevPosition = { x, y }
  }

  translate(dx: number, dy: number) {
    this.x += dx
    this.y += dy

    if (this.events?.translate) {
      this.events?.translate(dx, dy)
    }
    this.update()
  }

  select() {
    this.element.classList.add('selected')
  }

  unselect() {
    this.element.classList.remove('selected')
  }

  update() {
    this.element.innerText = this.text
    this.element.style.transform = `translate(${this.x}px, ${this.y}px)`
  }

  destroy() {
    this.dragHandler.destroy()
  }
}
