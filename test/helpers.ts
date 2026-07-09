jest.mock('../src/style.sass', () => ({}), { virtual: true })

import './stubs/dom'

import { NodeEditor } from 'rete'

import { CommentPlugin, FrameComment } from '../src/index'
import type { ExpectedSchemes } from '../src/types'
import { StubArea } from './stubs/area'
import { flushPromises } from './test-utils'

type TestNode = ExpectedSchemes['Node']

export async function createCommentPluginTestContext(nodes: TestNode[]) {
  const editor = new NodeEditor<ExpectedSchemes>()
  const area = new StubArea()
  const comment = new CommentPlugin<ExpectedSchemes>()

  editor.use(area)
  area.use(comment as never)

  for (const node of nodes) {
    await editor.addNode(node)
  }

  const dispatch = (context: Record<string, unknown>) => area.emit(context as never)

  const setNodePosition = async (id: string, x: number, y: number) => {
    await area.nodeViews.get(id)?.translate(x, y)
  }

  const addFrame = async (links: string[]) => {
    const frame = comment.addFrame('frame', links)

    await flushPromises()

    return frame
  }

  const getFrame = () => {
    const frame = Array.from(comment.comments.values()).find(item => item instanceof FrameComment)

    if (!(frame instanceof FrameComment)) {
      throw new Error('frame comment not found')
    }

    return frame
  }

  const removeNode = async (id: string) => {
    await editor.removeNode(id)
  }

  return {
    comment,
    dispatch,
    setNodePosition,
    addFrame,
    getFrame,
    removeNode
  }
}
