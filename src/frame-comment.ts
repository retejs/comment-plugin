import { NodeEditor, NodeId } from 'rete'
import { BaseAreaPlugin } from 'rete-area-plugin'

import { Comment } from './comment'
import { ExpectedSchemes } from './types'
import { containsRect, intersectRect, nodesBBox, Rect } from './utils'

export class FrameComment extends Comment {
  width = 100
  height = 100
  links: string[] = []

  constructor(
    text: string,
    area: BaseAreaPlugin<ExpectedSchemes, any>,
    private editor: NodeEditor<ExpectedSchemes>,
    events?: {
      contextMenu?: (comment: FrameComment) => void
      pick?: (comment: FrameComment) => void
      translate?: (comment: FrameComment, dx: number, dy: number, sources?: NodeId[]) => Promise<void>
    }
  ) {
    super(text, area, {
      contextMenu: () => {
        events?.contextMenu?.(this)
      },
      pick: () => {
        events?.pick?.(this)
      },
      translate: async (dx, dy, sources) => {
        if (events?.translate) await events.translate(this, dx, dy, sources)
      },
      drag: () => 1
    })

    this.nested.className = 'frame-comment'
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
    void this.resize()
  }

  public async resize() {
    const bbox = nodesBBox(this.editor, this.area, this.links, { top: 50, left: 20, right: 20, bottom: 20 })

    if (bbox) {
      this.width = bbox.width
      this.height = bbox.height
      await this.translate(bbox.left - this.x, bbox.top - this.y, this.links)
    } else {
      this.width = 100
      this.height = 100
      await this.translate(0, 0, this.links)
    }
  }

  public update() {
    super.update()

    this.nested.style.width = `${this.width}px`
    this.nested.style.height = `${this.height}px`
  }
}
