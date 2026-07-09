export const flushPromises = () => new Promise<void>(resolve => {
  setImmediate(resolve)
})

export function createNode(id: string) {
  return { id, width: 180, height: 120 }
}
