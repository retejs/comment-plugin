import { NodeId } from 'rete'
import { BaseAreaPlugin } from 'rete-area-plugin'

import { FrameComment } from './frame-comment'
import type { Produces } from './index'
import { InlineComment } from './inline-comment'
import type { ExpectedSchemes, Position } from './types'

export type CommentHandlerDeps = {
  area: BaseAreaPlugin<ExpectedSchemes, unknown>
  emit: (signal: Produces) => Promise<unknown>
  editComment: (id: string) => Promise<void>
}

export function createInlineHandlers(deps: CommentHandlerDeps) {
  const { area, emit, editComment } = deps

  return {
    contextMenu: ({ id }: InlineComment) => void editComment(id),
    pick: (item: InlineComment) => {
      area.area.content.reorder(item.element, null)
      void emit({ type: 'commentselected', data: item })
    },
    translate: async ({ id }: InlineComment, dx: number, dy: number, sources?: NodeId[]) => {
      await emit({ type: 'commenttranslated', data: { id, dx, dy, sources } })
    },
    dragged: async (item: InlineComment, previous: Position, prevLinks: string[]) => {
      await emit({
        type: 'commentdragged',
        data: { id: item.id, previous, prevLinks }
      })
    }
  }
}

export function createFrameHandlers(deps: CommentHandlerDeps) {
  const { area, emit, editComment } = deps

  return {
    contextMenu: ({ id }: FrameComment) => void editComment(id),
    pick: (item: FrameComment) => {
      area.area.content.reorder(item.element, area.area.content.holder.firstChild)
      void emit({ type: 'commentselected', data: item })
    },
    translate: async ({ id }: FrameComment, dx: number, dy: number, sources?: NodeId[]) => {
      await emit({ type: 'commenttranslated', data: { id, dx, dy, sources } })
    },
    dragged: async (item: FrameComment, previous: Position, prevLinks: string[]) => {
      await emit({
        type: 'commentdragged',
        data: { id: item.id, previous, prevLinks }
      })
    }
  }
}
