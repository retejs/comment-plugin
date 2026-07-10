import { NodeId } from 'rete'

import { FrameComment } from './frame-comment'

export type FrameBounds = { x: number, y: number, width: number, height: number }

export type FrameMembership = {
  id: FrameComment['id']
  links: { prev: string[], next: string[] }
  previous: FrameBounds
  current: FrameBounds
}

export function frameBounds(comment: FrameComment): FrameBounds {
  return {
    x: comment.x,
    y: comment.y,
    width: comment.width,
    height: comment.height
  }
}

function sameLinkSet(prev: string[], next: string[]) {
  return prev.length === next.length && prev.every(linkId => next.includes(linkId))
}

function nextLinks(frame: FrameComment, nodeId: NodeId) {
  const links = frame.links.filter(id => id !== nodeId)

  return frame.intersects(nodeId)
    ? [...links, nodeId]
    : links
}

export async function syncFrameOnNodeDrop(frame: FrameComment, nodeId: NodeId) {
  const prevLinks = [...frame.links]
  const next = nextLinks(frame, nodeId)

  if (sameLinkSet(prevLinks, next)) {
    if (frame.linkedTo(nodeId)) await frame.resize()
    return null
  }

  const previous = frameBounds(frame)

  frame.linkTo(next)
  await frame.resize()

  return {
    id: frame.id,
    links: { prev: prevLinks, next: [...frame.links] },
    previous,
    current: frameBounds(frame)
  }
}

export async function detachNodeFromFrame(frame: FrameComment, nodeId: NodeId) {
  if (!frame.linkedTo(nodeId)) return null

  const prevLinks = [...frame.links]
  const previous = frameBounds(frame)

  frame.linkTo(frame.links.filter(id => id !== nodeId))
  await frame.resize()

  return {
    id: frame.id,
    links: { prev: prevLinks, next: [...frame.links] },
    previous,
    current: frameBounds(frame)
  }
}
