import './stubs/dom'

import type { NodeEditor } from 'rete'
import type { BaseAreaPlugin } from 'rete-area-plugin'

import { FrameComment } from '../src/frame-comment'
import type { ExpectedSchemes } from '../src/types'
import { createNode, flushPromises } from './test-utils'

async function createFrame(links: string[], positions: Record<string, [number, number]>) {
  const nodeViews = new Map<string, {
    position: { x: number, y: number }
    translate: (x: number, y: number) => Promise<boolean>
  }>()

  for (const [id, [x, y]] of Object.entries(positions)) {
    const view = {
      position: { x, y },
      translate: (nx: number, ny: number) => {
        view.position = { x: nx, y: ny }
        return Promise.resolve(true)
      }
    }

    nodeViews.set(id, view)
  }

  const editor = {
    getNode: (id: string) => createNode(id)
  } as unknown as NodeEditor<ExpectedSchemes>

  const area = {
    nodeViews,
    area: {
      pointer: { x: 0, y: 0 },
      content: {
        add: () => {
          /* noop */
        },
        remove: () => {
          /* noop */
        },
        reorder: () => Promise.resolve()
      }
    }
  } as unknown as BaseAreaPlugin<ExpectedSchemes, never>

  const frame = new FrameComment('frame', area, editor)

  frame.linkTo(links)
  await flushPromises()

  return { frame, nodeViews }
}

describe('FrameComment', () => {
  it('detects intersection with a node inside the frame', async () => {
    const { frame } = await createFrame(['n1', 'n2'], {
      n1: [100, 100],
      n2: [100, 300]
    })

    expect(frame.intersects('n1')).toBe(true)
    expect(frame.intersects('n2')).toBe(true)
    expect(frame.intersects('n3')).toBe(false)
  })

  it('detects when a node is outside the frame bounds', async () => {
    const { frame, nodeViews } = await createFrame(['n1'], { n1: [100, 100] })

    await nodeViews.get('n1')?.translate(800, 800)

    expect(frame.intersects('n1')).toBe(false)
  })
})
