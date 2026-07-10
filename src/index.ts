import './style.sass'

import { NodeEditor, NodeId, Scope } from 'rete'
import { BaseArea, BaseAreaPlugin } from 'rete-area-plugin'

import { Comment } from './comment'
import { createCommentNodeSync } from './comment-node-sync'
import { FrameComment } from './frame-comment'
import type { FrameBounds, FrameMembership } from './frame-membership'
import { createFrameHandlers, createInlineHandlers } from './handlers'
import { InlineComment } from './inline-comment'
import type { CommentRestoreData, ExpectedSchemes, Position } from './types'

export { Comment, FrameComment, InlineComment }
export type { ExpectedSchemes }
export * as CommentExtensions from './extensions'
export type { FrameBounds, FrameMembership } from './frame-membership'
export type { CommentRestoreData } from './types'

/**
 * A union of all possible signals that can be emitted by the comment plugin
 * @priority 9
 */
export type Produces =
  | { type: 'commentcreated', data: Comment }
  | { type: 'commentremoved', data: Comment }
  | { type: 'editcomment', data: Comment }
  | { type: 'commentedited', data: { comment: Comment, previousText: string } }
  | { type: 'commentselected', data: Comment }
  | { type: 'commentunselected', data: Comment }
  | { type: 'commenttranslated', data: { id: Comment['id'], dx: number, dy: number, sources?: NodeId[] } }
  | {
    type: 'commentdragged'
    data: { id: Comment['id'], previous: Position, prevLinks: string[] }
  }
  | {
    type: 'commentmembershipchanged'
    data: { node?: { id: NodeId, previous: Position, current: Position }, frames: FrameMembership[] }
  }
  | { type: 'commentlinktranslate', data: { id: Comment['id'], link: string } }

/**
 * Comment plugin properties
 */
export type Props = {
  /** Edit comment callback */
  edit?: (comment: Comment) => Promise<string>
}

/**
 * A plugin that provides comments for nodes
 * @priority 8
 */
export class CommentPlugin<Schemes extends ExpectedSchemes, K = BaseArea<Schemes>>
  extends Scope<Produces, [BaseArea<Schemes> | K]> {
  public comments = new Map<Comment['id'], Comment>()
  private area!: BaseAreaPlugin<Schemes, K>
  private editor!: NodeEditor<Schemes>
  private membershipState = { restoring: false }

  /**
   * @constructor
   * @param props Optional comment plugin properties
   */
  constructor(private props?: Props) {
    super('comment')
  }

  setParent(scope: Scope<BaseArea<Schemes> | K>): void {
    super.setParent(scope)

    this.area = this.parentScope<BaseAreaPlugin<Schemes, K>>(BaseAreaPlugin)
    this.editor = this.area.parentScope<NodeEditor<Schemes>>(NodeEditor)

    const sync = createCommentNodeSync({
      area: this.area,
      comments: this.comments,
      membershipState: this.membershipState,
      emit: signal => this.emit(signal)
    })

    this.addPipe(async context => {
      if (!context || typeof context !== 'object' || !('type' in context)) return context

      if (context.type === 'nodepicked') sync.beginNodeDrag(context.data.id)
      if (context.type === 'reordered') sync.reorderLinkedComments(context.data.element)
      if (context.type === 'nodetranslated') await sync.onNodeTranslated(context.data)
      if (context.type === 'commenttranslated') await sync.onCommentTranslated(context.data)
      if (context.type === 'nodedragged') await sync.finalizeNodeDrag(context.data.id)

      return context
    })
    this.editor.addPipe(async context => {
      if (context.type === 'noderemoved') await sync.cleanupOnNodeRemoved(context.data.id)

      return context
    })
  }

  /**
   * Trigger edit form for a comment
   * @param id Comment id
   */
  async editComment(id: Comment['id']) {
    const comment = this.comments.get(id)

    if (!comment) throw new Error('comment not found')
    const previousText = comment.text
    const newText = this.props?.edit
      ? await this.props.edit(comment)
      : prompt('Edit comment', comment.text)

    if (newText !== null) {
      if (newText !== previousText) {
        comment.text = newText
        comment.update()
        void this.emit({ type: 'editcomment', data: comment })
        void this.emit({ type: 'commentedited', data: { comment, previousText } })
      }
      if (comment instanceof FrameComment) {
        void comment.resize()
      } else {
        comment.update()
      }
    }
  }

  private handlerDeps() {
    return {
      area: this.area,
      emit: (signal: Produces) => this.emit(signal),
      editComment: (id: string) => this.editComment(id)
    }
  }

  /**
   * Restores a comment from serialized state (e.g. undo after delete)
   */
  // eslint-disable-next-line max-statements
  public restoreComment(data: CommentRestoreData): Comment {
    if (data.kind === 'inline') {
      const comment = new InlineComment(data.text, this.area, createInlineHandlers(this.handlerDeps()), { id: data.id })

      comment.x = data.x
      comment.y = data.y
      comment.width = data.width
      comment.height = data.height
      comment.linkTo([...data.links])
      this.add(comment)

      return comment
    }

    const comment = new FrameComment(
      data.text,
      this.area,
      this.editor,
      createFrameHandlers(this.handlerDeps()),
      { id: data.id }
    )

    comment.x = data.x
    comment.y = data.y
    comment.width = data.width
    comment.height = data.height
    comment.linkTo([...data.links])
    this.add(comment)
    this.area.area.content.reorder(comment.element, this.area.area.content.holder.firstChild)

    return comment
  }

  /**
   * Adds an inline comment which is represented by a block with text at certain position, which is attached to the node.
   * When user translates a node, the comment will be translated as well.
   * When user drops a comment on a node, the comment will be linked to the node.
   * @param text Comment text
   * @param position Comment position
   * @param link Node ID the comment is linked with
   * @returns comment that was created
   */
  public addInline(text: string, [x, y]: [number, number], link?: string) {
    const comment = new InlineComment(text, this.area, createInlineHandlers(this.handlerDeps()))

    comment.x = x
    comment.y = y
    if (link) comment.linkTo([link])

    this.add(comment)
    return comment
  }

  /**
   * Adds a frame comment. Represents a rectangle with a text and nodes linked to it.
   * When user translates a comment, all linked nodes will be translated as well.
   * When user drops a node on a comment, the node will be linked to the comment.
   * @param text Comment text
   * @param links List of node IDs the comment is linked with
   * @returns comment that was created
   */
  public addFrame(text: string, links: string[] = []) {
    const comment = new FrameComment(text, this.area, this.editor, createFrameHandlers(this.handlerDeps()))

    comment.linkTo(links)

    this.add(comment)
    this.area.area.content.reorder(comment.element, this.area.area.content.holder.firstChild)
    return comment
  }

  public add(comment: Comment) {
    comment.update()
    this.comments.set(comment.id, comment)

    this.area.area.content.add(comment.element)
    void this.emit({ type: 'commentcreated', data: comment })
  }

  /**
   * Removes a comment
   * @param id Comment id
   */
  public delete(id: Comment['id']) {
    const comment = this.comments.get(id)

    if (!comment) return

    this.unselect(id)
    this.area.area.content.remove(comment.element)
    this.comments.delete(comment.id)
    comment.destroy()

    void this.emit({ type: 'commentremoved', data: comment })
  }

  /**
   * Updates comment links and resizes frame comments when needed
   */
  public async setCommentLinks(id: Comment['id'], links: string[]) {
    const comment = this.comments.get(id)

    if (!comment) return

    comment.linkTo([...links])

    if (comment instanceof FrameComment) {
      await comment.resize()
    }
  }

  /**
   * Restores frame bounds and links without recalculating from linked nodes.
   * Assigns `links` directly instead of `linkTo` to avoid an automatic resize.
   */
  public setFrameState(id: Comment['id'], state: FrameBounds & { links: string[] }) {
    const comment = this.comments.get(id)

    if (!(comment instanceof FrameComment)) return

    comment.links = [...state.links]
    comment.x = state.x
    comment.y = state.y
    comment.width = state.width
    comment.height = state.height
    comment.update()
  }

  /**
   * Restores frame membership and node position without triggering auto-resize side effects
   */
  public async restoreNodeFrameMembership(data: {
    frames: { id: Comment['id'], state: FrameBounds & { links: string[] } }[]
    node?: { id: NodeId, position: Position }
  }) {
    this.membershipState.restoring = true

    try {
      for (const frame of data.frames) {
        this.setFrameState(frame.id, frame.state)
      }

      if (data.node) {
        const view = this.area.nodeViews.get(data.node.id)

        if (view) await view.translate(data.node.position.x, data.node.position.y)
      }
    } finally {
      this.membershipState.restoring = false
    }
  }

  /**
   * Translates a comment
   * @param id Comment id
   * @param dx Delta x
   * @param dy Delta y
   */
  public translate(id: Comment['id'], dx: number, dy: number) {
    const comment = this.comments.get(id)

    if (!comment) return Promise.resolve()

    return comment.translate(dx, dy)
  }

  /**
   * Selects a comment
   * @param id Comment id
   */
  public select(id: Comment['id']) {
    const comment = this.comments.get(id)

    if (!comment) return

    comment.select()
    void this.emit({ type: 'commentselected', data: comment })
  }

  /**
   * Unselects a comment
   * @param id Comment id
   */
  public unselect(id: Comment['id']) {
    const comment = this.comments.get(id)

    if (!comment) return

    comment.unselect()
    void this.emit({ type: 'commentunselected', data: comment })
  }

  /**
   * Removes all comments
   */
  public clear() {
    Array.from(this.comments.keys()).map(id => {
      this.delete(id)
    })
  }
}
