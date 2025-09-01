import './style.sass'

import { NodeEditor, NodeId, Scope } from 'rete'
import { BaseArea, BaseAreaPlugin } from 'rete-area-plugin'

import { Comment } from './comment'
import { FrameComment } from './frame-comment'
import { InlineComment } from './inline-comment'
import type { ExpectedSchemes } from './types'
import { trackedTranslate, trackedTranslateComment } from './utils'

export { Comment, FrameComment, InlineComment }
export type { ExpectedSchemes }
export * as CommentExtensions from './extensions'

/**
 * A union of all possible signals that can be emitted by the comment plugin
 * @priority 9
 */
export type Produces =
  | { type: 'commentcreated', data: Comment }
  | { type: 'commentremoved', data: Comment }
  | { type: 'editcomment', data: Comment }
  | { type: 'commentselected', data: Comment }
  | { type: 'commentunselected', data: Comment }
  | { type: 'commenttranslated', data: { id: Comment['id'], dx: number, dy: number, sources?: NodeId[] } }
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

    const { translate, isTranslating } = trackedTranslate({ area: this.area })
    const commentTracker = trackedTranslateComment(this.comments)

    // eslint-disable-next-line max-statements, complexity
    this.addPipe(async context => {
      if (!context || typeof context !== 'object' || !('type' in context)) return context

      if (context.type === 'reordered') {
        const views = Array.from(this.area.nodeViews.entries())
        const matchedView = views.find(([, view]) => view.element === context.data.element)

        if (matchedView) {
          const comments = Array.from(this.comments.entries())
          const linkedComments = comments.filter(([, comment]) => comment.linkedTo(matchedView[0]))

          for (const [, comment] of linkedComments) {
            if (comment instanceof InlineComment) {
              this.area.area.content.reorder(comment.element, matchedView[1].element.nextElementSibling)
            }
            if (comment instanceof FrameComment) {
              this.area.area.content.reorder(comment.element, this.area.area.content.holder.firstChild)
            }
          }
        }
      }
      if (context.type === 'nodetranslated') {
        const { id, position, previous } = context.data
        const dx = position.x - previous.x
        const dy = position.y - previous.y
        const comments = Array.from(this.comments.values())

        await Promise.all(comments
          .filter(comment => comment.linkedTo(id))
          .map(async comment => {
            if (comment instanceof InlineComment && !commentTracker.isTranslating(comment.id)) {
              await commentTracker.translate(comment.id, dx, dy, [id])
            }
            if (comment instanceof FrameComment && !commentTracker.isResizing(comment.id)) {
              await commentTracker.resize(comment.id)
            }
          }))
      }
      if (context.type === 'commenttranslated') {
        const { id, dx, dy, sources } = context.data
        const comment = this.comments.get(id)

        if (!(comment instanceof FrameComment)) return context

        await Promise.all(comment.links
          .filter(linkId => !sources?.includes(linkId))
          .map(linkId => ({ linkId, view: this.area.nodeViews.get(linkId) }))
          .map(async ({ linkId, view }) => {
            if (!view) return
            // prevent an infinite loop if a node is selected and translated along with the selected comment
            if (!await this.emit({ type: 'commentlinktranslate', data: { id, link: linkId } })) return

            if (!isTranslating(linkId)) await translate(linkId, view.position.x + dx, view.position.y + dy)
          }))
      }
      if (context.type === 'nodedragged') {
        const { id } = context.data
        const comments = Array.from(this.comments.values())

        comments
          .filter((comment): comment is FrameComment => comment instanceof FrameComment)
          .forEach(comment => {
            const contains = comment.intersects(id)
            const links = comment.links.filter(nodeId => nodeId !== id)

            comment.linkTo(contains
              ? [...links, id]
              : links)
          })
      }
      return context
    })
    this.editor.addPipe(context => {
      if (context.type === 'noderemoved') {
        const { id } = context.data

        Array.from(this.comments.values()).forEach(comment => {
          if (comment instanceof InlineComment && comment.linkedTo(id)) {
            comment.linkTo([])
          }
          if (comment instanceof FrameComment && comment.linkedTo(id)) {
            comment.linkTo(comment.links.filter(linkId => linkId !== id))
          }
        })
      }
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
    const newText = this.props?.edit
      ? await this.props.edit(comment)
      : prompt('Edit comment', comment.text)

    if (newText !== null) {
      comment.text = newText
      comment.update()
      await comment.translate(0, 0)
    }
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
    const comment = new InlineComment(text, this.area, {
      contextMenu: ({ id }) => void this.editComment(id),
      pick: data => {
        this.area.area.content.reorder(comment.element, null)
        void this.emit({ type: 'commentselected', data })
      },
      translate: async ({ id }, dx, dy, sources) => {
        await this.emit({ type: 'commenttranslated', data: { id, dx, dy, sources } })
      }
    })

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
    const comment = new FrameComment(text, this.area, this.editor, {
      contextMenu: ({ id }) => void this.editComment(id),
      pick: data => {
        this.area.area.content.reorder(comment.element, this.area.area.content.holder.firstChild)
        void this.emit({ type: 'commentselected', data })
      },
      translate: async ({ id }, dx, dy, sources) => {
        await this.emit({ type: 'commenttranslated', data: { id, dx, dy, sources } })
      }
    })

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
   * Translates a comment
   * @param id Comment id
   * @param dx Delta x
   * @param dy Delta y
   */
  public translate(id: Comment['id'], dx: number, dy: number) {
    const comment = this.comments.get(id)

    if (!comment) return

    void comment.translate(dx, dy)
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
