import { NodeId } from 'rete'
import { BaseAreaPlugin } from 'rete-area-plugin'

import { Comment } from './comment'
import { FrameComment } from './frame-comment'
import { detachNodeFromFrame, FrameMembership, syncFrameOnNodeDrop } from './frame-membership'
import type { Produces } from './index'
import { InlineComment } from './inline-comment'
import type { ExpectedSchemes, MembershipState, Position } from './types'
import { trackDragging, trackedTranslate, trackedTranslateComment } from './utils'

export type CommentNodeSyncDeps<Schemes extends ExpectedSchemes, K> = {
  area: BaseAreaPlugin<Schemes, K>
  comments: Map<Comment['id'], Comment>
  membershipState: MembershipState
  emit: (signal: Produces) => Promise<unknown>
}

export function createCommentNodeSync<Schemes extends ExpectedSchemes, K>(deps: CommentNodeSyncDeps<Schemes, K>) {
  const { area, comments, membershipState, emit } = deps
  const { translate, isTranslating } = trackedTranslate({ area })
  const commentTracker = trackedTranslateComment(comments)
  const dragging = trackDragging()
  const nodeDragPrevious = new Map<NodeId, Position>()

  const collectFrameMembership = async (nodeId: NodeId) => {
    const frames: FrameMembership[] = []

    for (const comment of Array.from(comments.values())) {
      if (comment instanceof FrameComment) {
        const entry = await syncFrameOnNodeDrop(comment, nodeId)

        if (entry) frames.push(entry)
      }
    }

    return frames
  }

  const emitMembership = async (
    frames: FrameMembership[],
    node?: { id: NodeId, previous: Position, current: Position }
  ) => {
    if (!frames.length) return

    await emit({
      type: 'commentmembershipchanged',
      data: node
        ? { node, frames }
        : { frames }
    })
  }

  return {
    beginNodeDrag(nodeId: NodeId) {
      dragging.start(nodeId)
      const view = area.nodeViews.get(nodeId)

      if (view) nodeDragPrevious.set(nodeId, { ...view.position })
    },

    reorderLinkedComments(element: HTMLElement) {
      const views = Array.from(area.nodeViews.entries())
      const matchedView = views.find(([, view]) => view.element === element)

      if (!matchedView) return

      const linkedComments = Array.from(comments.entries())
        .filter(([, comment]) => comment.linkedTo(matchedView[0]))

      for (const [, comment] of linkedComments) {
        if (comment instanceof InlineComment) {
          area.area.content.reorder(comment.element, matchedView[1].element.nextElementSibling)
        }
        if (comment instanceof FrameComment) {
          area.area.content.reorder(comment.element, area.area.content.holder.firstChild)
        }
      }
    },

    async onNodeTranslated(data: { id: NodeId, position: Position, previous: Position }) {
      if (membershipState.restoring) return

      const { id, position, previous } = data
      const dx = position.x - previous.x
      const dy = position.y - previous.y

      await Promise.all(Array.from(comments.values())
        .filter(comment => comment.linkedTo(id))
        .map(async comment => {
          if (comment instanceof InlineComment && !commentTracker.isTranslating(comment.id)) {
            await commentTracker.translate(comment.id, dx, dy, [id])
          }
          if (comment instanceof FrameComment
            && !dragging.isDragging(id)
            && !commentTracker.isResizing(comment.id)) {
            await commentTracker.resize(comment.id)
          }
        }))
    },

    async onCommentTranslated(data: { id: Comment['id'], dx: number, dy: number, sources?: NodeId[] }) {
      const { id, dx, dy, sources } = data
      const comment = comments.get(id)

      if (!(comment instanceof FrameComment)) return

      await Promise.all(comment.links
        .filter(linkId => !sources?.includes(linkId))
        .map(linkId => ({ linkId, view: area.nodeViews.get(linkId) }))
        .map(async ({ linkId, view }) => {
          if (!view) return
          // prevent an infinite loop if a node is selected and translated along with the selected comment
          if (!await emit({ type: 'commentlinktranslate', data: { id, link: linkId } })) return

          if (!isTranslating(linkId)) await translate(linkId, view.position.x + dx, view.position.y + dy)
        }))
    },

    async finalizeNodeDrag(nodeId: NodeId) {
      if (membershipState.restoring) return

      const nodePrevious = nodeDragPrevious.get(nodeId)
      const nodeView = area.nodeViews.get(nodeId)
      const frames = await collectFrameMembership(nodeId)

      if (frames.length && nodePrevious && nodeView) {
        await emitMembership(frames, {
          id: nodeId,
          previous: nodePrevious,
          current: { ...nodeView.position }
        })
      }

      nodeDragPrevious.delete(nodeId)
      dragging.stop(nodeId)
    },

    async cleanupOnNodeRemoved(nodeId: NodeId) {
      dragging.stop(nodeId)
      nodeDragPrevious.delete(nodeId)

      const frames: FrameMembership[] = []

      for (const comment of Array.from(comments.values())) {
        if (comment instanceof InlineComment && comment.linkedTo(nodeId)) {
          comment.linkTo([])
        }
        if (comment instanceof FrameComment) {
          const entry = await detachNodeFromFrame(comment, nodeId)

          if (entry) frames.push(entry)
        }
      }

      await emitMembership(frames)
    }
  }
}
