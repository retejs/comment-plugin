import { NodeId } from 'rete'
import { BaseAreaPlugin } from 'rete-area-plugin'

import { Comment } from './comment'
import { ExpectedSchemes } from './types'
import { intersectRect } from './utils'

export class InlineComment extends Comment {
  width = 80
  height = 54

  constructor(
    text: string,
    area: BaseAreaPlugin<ExpectedSchemes, any>,
    events?: {
      contextMenu?: (comment: InlineComment) => void
      pick?: (comment: InlineComment) => void
      translate?: (comment: InlineComment, dx: number, dy: number, sources?: NodeId[]) => Promise<void>
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
      drag: () => {
        this.link()
      }
    })

    this.nested.className = 'inline-comment'
  }

  link() {
    const intersection = this.getIntersectNode()

    this.linkTo(intersection
      ? [intersection.id]
      : [])
  }

  getIntersectNode() {
    const commRect = this.nested.getBoundingClientRect()

    return Array.from(this.area.nodeViews)
      .map(([id, view]) => {
        return { id, rect: view.element.getBoundingClientRect() }
      })
      .find(({ rect }) => {
        return intersectRect(commRect, rect)
      })
  }

  update(): void {
    super.update()

    this.width = Math.max(80, this.nested.clientWidth)
  }
}
