import { BaseAreaPlugin } from 'rete-area-plugin'

import type { ExpectedSchemes } from '../../src/types'
import { stubElement } from './dom'

type NodeView = {
  position: { x: number, y: number }
  element: HTMLElement
  translate: (x: number, y: number) => Promise<boolean>
  resize: (width: number, height: number) => Promise<boolean>
}

export class StubArea extends BaseAreaPlugin<ExpectedSchemes, never> {
  nodeViews = new Map<string, NodeView>()
  connectionViews = new Map()

  area = {
    pointer: { x: 0, y: 0 },
    content: {
      holder: stubElement(),
      add: jest.fn(),
      remove: jest.fn(),
      reorder: jest.fn(() => Promise.resolve())
    }
  }

  constructor() {
    super('stub-area')

    this.addPipe(context => {
      if (context && typeof context === 'object' && 'type' in context && context.type === 'nodecreated') {
        this.addNodeView(context.data)
      }

      return context
    })
  }

  addNodeView(node: ExpectedSchemes['Node']) {
    const view: NodeView = {
      position: { x: 0, y: 0 },
      element: stubElement(),
      translate: (x, y) => {
        view.position = { x, y }
        return Promise.resolve(true)
      },
      resize: () => Promise.resolve(true)
    }

    this.nodeViews.set(node.id, view)

    return view
  }

  removeNodeView() {
    /* noop */
  }

  addConnectionView() {
    return { element: stubElement() }
  }

  removeConnectionView() {
    /* noop */
  }

  update() {
    return Promise.resolve()
  }

  resize() {
    return Promise.resolve()
  }

  translate() {
    return Promise.resolve()
  }

  destroy() {
    /* noop */
  }
}
