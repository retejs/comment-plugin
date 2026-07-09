import { getUID, NodeId } from 'rete'
import { BaseAreaPlugin, Drag } from 'rete-area-plugin'

import { ExpectedSchemes, Position } from './types'

export class Comment {
  id: string
  dragHandler!: Drag
  x = 0
  y = 0
  width = 0
  height = 0
  links: string[] = []
  element!: HTMLElement
  nested!: HTMLElement
  prevPosition: null | Position = null
  private dragOrigin: null | Position = null

  constructor(
    public text: string,
    public area: BaseAreaPlugin<ExpectedSchemes, any>,
    private events?: {
      contextMenu?: null | (() => void)
      pick?: null | (() => void)
      translate?: null | ((dx: number, dy: number, sources?: NodeId[]) => Promise<void>)
      drag?: null | (() => void)
      dragged?: null | ((previous: Position, prevLinks: string[], nextLinks: string[]) => Promise<void>)
    },
    options?: { id?: string }
  ) {
    this.id = options?.id ?? getUID()
    this.element = document.createElement('div')
    this.nested = document.createElement('div')
    this.element.appendChild(this.nested)
    this.element.addEventListener('contextmenu', this.onContextMenu.bind(this))

    this.dragHandler = new Drag()

    this.dragHandler.initialize(
      this.nested,
      {
        getCurrentPosition: () => ({ x: this.x, y: this.y }),
        getZoom: () => 1
      },
      {
        start: () => {
          this.dragOrigin = { x: this.x, y: this.y }
          this.prevPosition = { ...area.area.pointer }

          if (this.events?.pick) {
            this.events.pick()
          }
        },
        translate: () => {
          if (this.prevPosition) {
            const pointer = { ...area.area.pointer }
            const dx = pointer.x - this.prevPosition.x
            const dy = pointer.y - this.prevPosition.y

            void this.translate(dx, dy)
            this.prevPosition = pointer
          }
        },
        drag: () => {
          void this.finishDrag()
        }
      }
    )
    this.update()
  }

  linkTo(ids: NodeId[]) {
    this.links = ids
  }

  linkedTo(nodeId: NodeId) {
    return this.links.includes(nodeId)
  }

  onContextMenu(e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (this.events?.contextMenu) {
      this.events.contextMenu()
    }
  }

  async translate(dx: number, dy: number, sources?: NodeId[]) {
    this.x += dx
    this.y += dy

    if (this.events?.translate) {
      await this.events.translate(dx, dy, sources)
    }
    this.update()
  }

  select() {
    this.nested.classList.add('selected')
  }

  unselect() {
    this.nested.classList.remove('selected')
  }

  update() {
    this.nested.innerText = this.text
    this.nested.style.transform = `translate(${this.x}px, ${this.y}px)`
  }

  destroy() {
    this.dragHandler.destroy()
  }

  private async finishDrag() {
    this.prevPosition = null

    const origin = this.dragOrigin

    this.dragOrigin = null

    if (!origin) {
      this.events?.drag?.()
      return
    }

    const prevLinks = [...this.links]

    if (this.events?.drag) {
      this.events.drag()
    }

    await this.events?.dragged?.(origin, prevLinks, [...this.links])
  }
}
