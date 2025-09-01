import { AreaExtensions } from 'rete-area-plugin'

import { CommentPlugin, ExpectedSchemes } from '..'

type Selector = ReturnType<typeof AreaExtensions.selector>

/**
 * Enables synchronization between comments and the selector
 * @param plugin Comment plugin instance
 * @param selector Selector instance
 * @param accumulating Accumulating state
 */
export function selectable<S extends ExpectedSchemes, K>(
  plugin: CommentPlugin<S, K>,
  selector: Selector,
  accumulating: { active(): boolean }
) {
  // eslint-disable-next-line max-statements, complexity
  plugin.addPipe(async context => {
    if (!context || typeof context !== 'object' || !('type' in context)) return context

    if (context.type === 'commentlinktranslate') {
      const { link } = context.data

      if (selector.isSelected({ id: link, label: 'node' })) return
    }
    if (context.type === 'commentselected') {
      const comment = context.data
      const { id } = comment

      if (!accumulating.active()) await selector.unselectAll()
      await selector.add({
        id,
        label: 'comment',
        async translate(dx, dy) {
          await plugin.translate(id, dx, dy)
        },
        unselect() {
          plugin.unselect(id)
        }
      }, accumulating.active())
      comment.select()
      selector.pick({ id, label: 'comment' })
    }
    if (context.type === 'commentunselected') {
      const { id } = context.data

      await selector.remove({ id, label: 'comment' })
    }
    if (context.type === 'commenttranslated') {
      const { id, dx, dy } = context.data

      if (selector.isPicked({ id, label: 'comment' })) await selector.translate(dx, dy)
    }

    return context
  })
}
