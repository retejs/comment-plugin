import './style.sass'

import { NodeEditor, NodeId, Scope } from 'rete'
import { BaseArea, BaseAreaPlugin } from 'rete-area-plugin'

import { Comment } from './comment'
import { FrameComment } from './frame-comment'
import { InlineComment } from './inline-comment'
import type { ExpectedSchemes } from './types'
import { trackedTranslate } from './utils'

export { Comment, FrameComment, InlineComment }
export type { ExpectedSchemes }
export * as CommentExtensions from './extensions'

type Produces =
  | { type: 'commentcreated', data: Comment }
  | { type: 'commentremoved', data: Comment }
  | { type: 'editcomment', data: Comment }
  | { type: 'commentselected', data: Comment }
  | { type: 'commentunselected', data: Comment }
  | { type: 'commenttranslated', data: { id: Comment['id'], dx: number, dy: number, sources?: NodeId[] } }
  | { type: 'commentlinktranslate', data: { id: Comment['id'], link: string } }

type Props = {
  edit?: (comment: Comment) => Promise<string>
}

export class CommentPlugin<Schemes extends ExpectedSchemes, K = BaseArea<Schemes>> extends Scope<Produces, [BaseArea<Schemes> | K]> {
  public comments = new Map<Comment['id'], Comment>()
  private area!: BaseAreaPlugin<Schemes, K>
  private editor!: NodeEditor<Schemes>

  constructor(private props?: Props) {
    super('comment')
  }

  setParent(scope: Scope<BaseArea<Schemes> | K>): void {
    super.setParent(scope)

    this.area = this.parentScope<BaseAreaPlugin<Schemes, K>>(BaseAreaPlugin)
    this.editor = this.area.parentScope<NodeEditor<Schemes>>(NodeEditor)

    let picked: string[] = []

    const { translate, isTranslating } = trackedTranslate({ area: this.area })

    // eslint-disable-next-line max-statements, complexity
    this.addPipe(context => {
      if (!('type' in context)) return context

      if (context.type === 'nodepicked') {
        picked.push(context.data.id)
      }
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

        comments
          .filter(comment => comment.linkedTo(id))
          .map(comment => {
            if (comment instanceof InlineComment) comment.translate(dx, dy, [id])
            if (comment instanceof FrameComment && !picked.includes(id)) comment.resize()
          })
      }
      if (context.type === 'commenttranslated') {
        const { id, dx, dy, sources } = context.data
        const comment = this.comments.get(id)

        if (!(comment instanceof FrameComment && comment)) return context

        comment.links
          .filter(linkId => !sources?.includes(linkId))
          .map(linkId => ({ linkId, view: this.area.nodeViews.get(linkId) }))
          .forEach(async ({ linkId, view }) => {
            if (!view) return
            // prevent an infinite loop if a node is selected and translated along with the selected comment
            if (!await this.emit({ type: 'commentlinktranslate', data: { id, link: linkId } })) return

            if (!isTranslating(linkId)) translate(linkId, view.position.x + dx, view.position.y + dy)
          })
      }
      if (context.type === 'nodedragged') {
        const { id } = context.data
        const comments = Array.from(this.comments.values())

        comments
          .filter((comment): comment is FrameComment => comment instanceof FrameComment)
          .filter(comment => {
            const contains = comment.intersects(id)
            const links = comment.links.filter(nodeId => nodeId !== id)

            comment.linkTo(contains ? [...links, id] : links)
          })

        picked = picked.filter(p => p !== id)
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

  async editComment(id: Comment['id']) {
    const comment = this.comments.get(id)

    if (!comment) throw new Error('comment not found')
    const newText = this.props?.edit ? await this.props.edit(comment) : prompt('Edit comment', comment.text)

    if (newText !== null) {
      comment.text = newText
      comment.update()
      comment.translate(0, 0)
    }
  }

  public addInline(text: string, [x, y]: [number, number], link?: string) {
    const comment = new InlineComment(text, this.area, {
      contextMenu: ({ id }) => this.editComment(id),
      pick: (data) => {
        this.area.area.content.reorder(comment.element, null)
        this.emit({ type: 'commentselected', data })
      },
      translate: ({ id }, dx, dy, sources) => this.emit({ type: 'commenttranslated', data: { id, dx, dy, sources } })
    })

    comment.x = x
    comment.y = y
    if (link) comment.linkTo([link])

    this.add(comment)
  }

  public addFrame(text: string, links: string[] = []) {
    const comment = new FrameComment(text, this.area, this.editor, {
      contextMenu: ({ id }) => this.editComment(id),
      pick: (data) => {
        this.area.area.content.reorder(comment.element, this.area.area.content.holder.firstChild)
        this.emit({ type: 'commentselected', data })
      },
      translate: ({ id }, dx, dy, sources) => this.emit({ type: 'commenttranslated', data: { id, dx, dy, sources } })
    })

    comment.linkTo(links)

    this.add(comment)
    this.area.area.content.reorder(comment.element, this.area.area.content.holder.firstChild)
  }

  public add(comment: Comment) {
    comment.update()
    this.comments.set(comment.id, comment)

    this.area.area.content.add(comment.element)
    this.emit({ type: 'commentcreated', data: comment })
  }

  public delete(id: Comment['id']) {
    const comment = this.comments.get(id)

    if (!comment) return

    this.unselect(id)
    this.area.area.content.remove(comment.element)
    this.comments.delete(comment.id)
    comment.destroy()

    this.emit({ type: 'commentremoved', data: comment })
  }

  public translate(id: Comment['id'], dx: number, dy: number) {
    const comment = this.comments.get(id)

    if (!comment) return

    comment.translate(dx, dy)
  }

  public select(id: Comment['id']) {
    const comment = this.comments.get(id)

    if (!comment) return

    comment.select()
    this.emit({ type: 'commentselected', data: comment })
  }

  public unselect(id: Comment['id']) {
    const comment = this.comments.get(id)

    if (!comment) return

    comment.unselect()
    this.emit({ type: 'commentunselected', data: comment })
  }

  public clear() {
    Array.from(this.comments.keys()).map(id => this.delete(id))
  }
}
