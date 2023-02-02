import './style.sass'

import { NodeEditor, Root, Scope } from 'rete'
import { Area2D, Area2DInherited, AreaPlugin } from 'rete-area-plugin'

import { Comment } from './comment'
import { FrameComment } from './frame-comment'
import { InlineComment } from './inline-comment'
import type { ExpectedSchemes } from './types'

export type { ExpectedSchemes }

type Produces =
    | { type: 'commentcreated', data: Comment }
    | { type: 'commentremoved', data: Comment }
    | { type: 'editcomment', data: Comment }
    | { type: 'commentselected', data: Comment }

type Props = { edit?: (comment: Comment) => Promise<string> }

export class CommentPlugin<Schemes extends ExpectedSchemes, K> extends Scope<Produces, Area2DInherited<Schemes, K>> {
    comments = new Map<Comment['id'], Comment>()
    area!: AreaPlugin<Schemes>
    editor!: NodeEditor<Schemes>

    constructor(private props?: Props) {
        super('comment')
    }

    setParent(scope: Scope<Area2D<Schemes> | K, [Root<Schemes>]>): void {
        super.setParent(scope)

        this.area = this.parentScope<AreaPlugin<Schemes>>(AreaPlugin)
        this.editor = this.area.parentScope<NodeEditor<Schemes>>(NodeEditor)

        // eslint-disable-next-line max-statements
        this.area.addPipe(context => {
            if (!('type' in context)) return context

            if (context.type === 'nodetranslated') {
                const { id, position, previous } = context.data
                const dx = position.x - previous.x
                const dy = position.y - previous.y
                const comments = Array.from(this.comments.values())

                comments
                    .filter((comment): comment is InlineComment => comment instanceof InlineComment)
                    .filter(comment => comment.linkedTo(id))
                    .map(comment => comment.offset(dx, dy))
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
            }
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
        }
    }

    public addInline(text: string, [x, y]: [number, number], link?: string) {
        const comment = new InlineComment(text, this.area, ({ id }) => this.editComment(id))

        comment.x = x
        comment.y = y
        if (link) comment.linkTo([link])

        this.add(comment)
    }

    public addFrame(text: string, links: string[] = []) {
        const comment = new FrameComment(text, this.area, this.editor, ({ id }) => this.editComment(id))

        comment.linkTo(links)

        this.add(comment)
    }

    private add(comment: Comment) {
        comment.update()
        this.comments.set(comment.id, comment)

        this.area.area.appendChild(comment.element)
        this.emit({ type: 'commentcreated', data: comment })
    }

    public delete(id: Comment['id']) {
        const comment = this.comments.get(id)

        if (!comment) return

        this.area.area.appendChild(comment.element)
        this.comments.delete(comment.id)
        comment.destroy()

        this.emit({ type: 'commentremoved', data: comment })
    }

    public clear() {
        Array.from(this.comments.keys()).map(id => this.delete(id))
    }
}
