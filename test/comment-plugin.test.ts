import { createCommentPluginTestContext } from './helpers'
import { createNode, flushPromises } from './test-utils'

describe('CommentPlugin frame links', () => {
  it('keeps frame bounds unchanged while a linked node is dragged', async () => {
    const n1 = createNode('n1')
    const n2 = createNode('n2')
    const { dispatch, getFrame, addFrame, setNodePosition } = await createCommentPluginTestContext([n1, n2])

    await setNodePosition('n1', 100, 100)
    await setNodePosition('n2', 100, 300)
    await addFrame(['n1', 'n2'])

    const frame = getFrame()
    const bounds = { x: frame.x, y: frame.y, width: frame.width, height: frame.height }

    await dispatch({ type: 'nodepicked', data: { id: 'n1' } })
    await setNodePosition('n1', 800, 800)
    await dispatch({
      type: 'nodetranslated',
      data: {
        id: 'n1',
        position: { x: 800, y: 800 },
        previous: { x: 100, y: 100 }
      }
    })
    await flushPromises()

    expect(frame.x).toBe(bounds.x)
    expect(frame.y).toBe(bounds.y)
    expect(frame.width).toBe(bounds.width)
    expect(frame.height).toBe(bounds.height)
    expect(frame.links).toEqual(['n1', 'n2'])
  })

  it('unassigns a linked node when it is dropped outside the frame', async () => {
    const n1 = createNode('n1')
    const n2 = createNode('n2')
    const { dispatch, getFrame, addFrame, setNodePosition } = await createCommentPluginTestContext([n1, n2])

    await setNodePosition('n1', 100, 100)
    await setNodePosition('n2', 100, 300)
    await addFrame(['n1', 'n2'])

    const frame = getFrame()

    await dispatch({ type: 'nodepicked', data: { id: 'n1' } })
    await setNodePosition('n1', 800, 800)
    await dispatch({
      type: 'nodetranslated',
      data: {
        id: 'n1',
        position: { x: 800, y: 800 },
        previous: { x: 100, y: 100 }
      }
    })
    await dispatch({ type: 'nodedragged', data: { id: 'n1' } })
    await flushPromises()

    expect(frame.links).toEqual(['n2'])
    expect(frame.intersects('n1')).toBe(false)
  })

  it('assigns a node to the frame when it is dropped inside', async () => {
    const n2 = createNode('n2')
    const n3 = createNode('n3')
    const { dispatch, getFrame, addFrame, setNodePosition } = await createCommentPluginTestContext([n2, n3])

    await setNodePosition('n2', 100, 300)
    await setNodePosition('n3', 700, 700)
    await addFrame(['n2'])

    const frame = getFrame()

    await dispatch({ type: 'nodepicked', data: { id: 'n3' } })
    await setNodePosition('n3', 150, 150)
    await dispatch({
      type: 'nodetranslated',
      data: {
        id: 'n3',
        position: { x: 150, y: 150 },
        previous: { x: 700, y: 700 }
      }
    })
    await dispatch({ type: 'nodedragged', data: { id: 'n3' } })
    await flushPromises()

    expect(frame.links).toEqual(['n2', 'n3'])
  })

  it('resizes the frame when a linked node is dropped inside at a new position', async () => {
    const n1 = createNode('n1')
    const n2 = createNode('n2')
    const { dispatch, getFrame, addFrame, setNodePosition } = await createCommentPluginTestContext([n1, n2])

    await setNodePosition('n1', 100, 100)
    await setNodePosition('n2', 100, 300)
    await addFrame(['n1', 'n2'])

    const frame = getFrame()
    const bounds = { x: frame.x, y: frame.y, width: frame.width, height: frame.height }

    await dispatch({ type: 'nodepicked', data: { id: 'n1' } })
    await setNodePosition('n1', 130, 110)
    await dispatch({
      type: 'nodetranslated',
      data: {
        id: 'n1',
        position: { x: 130, y: 110 },
        previous: { x: 100, y: 100 }
      }
    })
    await dispatch({ type: 'nodedragged', data: { id: 'n1' } })
    await flushPromises()

    expect(frame.links).toEqual(['n1', 'n2'])
    const resized = frame.x !== bounds.x
      || frame.y !== bounds.y
      || frame.width !== bounds.width
      || frame.height !== bounds.height

    expect(resized).toBe(true)
    expect(frame.intersects('n1')).toBe(true)
  })

  it('resizes the frame when a linked node is translated without drag', async () => {
    const n1 = createNode('n1')
    const n2 = createNode('n2')
    const { dispatch, getFrame, addFrame, setNodePosition } = await createCommentPluginTestContext([n1, n2])

    await setNodePosition('n1', 100, 100)
    await setNodePosition('n2', 100, 300)
    await addFrame(['n1', 'n2'])

    const frame = getFrame()
    const bounds = { x: frame.x, y: frame.y, width: frame.width, height: frame.height }

    await setNodePosition('n1', 500, 100)
    await dispatch({
      type: 'nodetranslated',
      data: {
        id: 'n1',
        position: { x: 500, y: 100 },
        previous: { x: 100, y: 100 }
      }
    })
    await flushPromises()

    expect(frame.links).toEqual(['n1', 'n2'])
    const resized = frame.x !== bounds.x
      || frame.y !== bounds.y
      || frame.width !== bounds.width
      || frame.height !== bounds.height

    expect(resized).toBe(true)
    expect(frame.intersects('n1')).toBe(true)
  })

  it('emits commentmembershipchanged when a node is dropped outside the frame', async () => {
    const n1 = createNode('n1')
    const n2 = createNode('n2')
    const { comment, dispatch, getFrame, addFrame, setNodePosition } = await createCommentPluginTestContext([n1, n2])
    const events: { type: string, data: unknown }[] = []

    comment.addPipe(context => {
      if (context && typeof context === 'object' && 'type' in context) {
        events.push(context as { type: string, data: unknown })
      }
      return context
    })

    await setNodePosition('n1', 100, 100)
    await setNodePosition('n2', 100, 300)
    await addFrame(['n1', 'n2'])

    const frame = getFrame()
    const previousBounds = { x: frame.x, y: frame.y, width: frame.width, height: frame.height }

    await dispatch({ type: 'nodepicked', data: { id: 'n1' } })
    await setNodePosition('n1', 800, 800)
    await dispatch({
      type: 'nodetranslated',
      data: {
        id: 'n1',
        position: { x: 800, y: 800 },
        previous: { x: 100, y: 100 }
      }
    })
    await dispatch({ type: 'nodedragged', data: { id: 'n1' } })
    await flushPromises()

    expect(frame.links).toEqual(['n2'])
    expect(events).toContainEqual({
      type: 'commentmembershipchanged',
      data: {
        node: { id: 'n1', previous: { x: 100, y: 100 }, current: { x: 800, y: 800 } },
        frames: [{
          id: frame.id,
          links: { prev: ['n1', 'n2'], next: ['n2'] },
          previous: previousBounds,
          current: expect.objectContaining({
            x: expect.any(Number),
            y: expect.any(Number),
            width: expect.any(Number),
            height: expect.any(Number)
          })
        }]
      }
    })
  })

  it('emits commentmembershipchanged when a node is dropped inside the frame', async () => {
    const n2 = createNode('n2')
    const n3 = createNode('n3')
    const { comment, dispatch, getFrame, addFrame, setNodePosition } = await createCommentPluginTestContext([n2, n3])
    const events: { type: string, data: unknown }[] = []

    comment.addPipe(context => {
      if (context && typeof context === 'object' && 'type' in context) {
        events.push(context as { type: string, data: unknown })
      }
      return context
    })

    await setNodePosition('n2', 100, 300)
    await setNodePosition('n3', 700, 700)
    await addFrame(['n2'])

    const frame = getFrame()

    await dispatch({ type: 'nodepicked', data: { id: 'n3' } })
    await setNodePosition('n3', 150, 150)
    await dispatch({
      type: 'nodetranslated',
      data: {
        id: 'n3',
        position: { x: 150, y: 150 },
        previous: { x: 700, y: 700 }
      }
    })
    await dispatch({ type: 'nodedragged', data: { id: 'n3' } })
    await flushPromises()

    expect(frame.links).toEqual(['n2', 'n3'])
    expect(events).toContainEqual({
      type: 'commentmembershipchanged',
      data: {
        node: { id: 'n3', previous: { x: 700, y: 700 }, current: { x: 150, y: 150 } },
        frames: [expect.objectContaining({
          id: frame.id,
          links: { prev: ['n2'], next: ['n2', 'n3'] }
        })]
      }
    })
  })

  it('clears drag tracking when a node is removed during drag', async () => {
    const n1 = createNode('n1')
    const n2 = createNode('n2')
    const { dispatch, getFrame, addFrame, removeNode, setNodePosition } = await createCommentPluginTestContext([n1, n2])

    await setNodePosition('n1', 100, 100)
    await setNodePosition('n2', 100, 300)
    await addFrame(['n1', 'n2'])

    const frame = getFrame()

    await dispatch({ type: 'nodepicked', data: { id: 'n1' } })
    await removeNode('n1')
    await flushPromises()

    expect(frame.links).toEqual(['n2'])

    await setNodePosition('n2', 500, 300)
    await dispatch({
      type: 'nodetranslated',
      data: {
        id: 'n2',
        position: { x: 500, y: 300 },
        previous: { x: 100, y: 300 }
      }
    })
    await flushPromises()

    expect(frame.intersects('n2')).toBe(true)
  })

  it('restoreNodeFrameMembership restores links and bounds without auto-resize', async () => {
    const n1 = createNode('n1')
    const n2 = createNode('n2')
    const { comment, dispatch, getFrame, addFrame, setNodePosition } = await createCommentPluginTestContext([n1, n2])

    await setNodePosition('n1', 100, 100)
    await setNodePosition('n2', 100, 300)
    await addFrame(['n1', 'n2'])

    const frame = getFrame()
    const previous = { x: frame.x, y: frame.y, width: frame.width, height: frame.height, links: [...frame.links] }

    await dispatch({ type: 'nodepicked', data: { id: 'n1' } })
    await setNodePosition('n1', 800, 800)
    await dispatch({
      type: 'nodetranslated',
      data: {
        id: 'n1',
        position: { x: 800, y: 800 },
        previous: { x: 100, y: 100 }
      }
    })
    await dispatch({ type: 'nodedragged', data: { id: 'n1' } })
    await flushPromises()

    expect(frame.links).toEqual(['n2'])

    await comment.restoreNodeFrameMembership({
      frames: [{ id: frame.id, state: previous }],
      node: { id: 'n1', position: { x: 100, y: 100 } }
    })

    expect(frame.links).toEqual(['n1', 'n2'])
    expect(frame.x).toBe(previous.x)
    expect(frame.y).toBe(previous.y)
    expect(frame.width).toBe(previous.width)
    expect(frame.height).toBe(previous.height)
  })
})
