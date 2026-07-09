export function stubElement() {
  return {
    style: {} as CSSStyleDeclaration,
    className: '',
    innerText: '',
    appendChild() {
      return this
    },
    addEventListener() {
      /* noop */
    },
    removeEventListener() {
      /* noop */
    },
    querySelector: () => null
  } as unknown as HTMLElement
}

if (typeof document === 'undefined') {
  Object.defineProperty(globalThis, 'document', {
    value: {
      createElement: stubElement,
      body: stubElement()
    }
  })

  Object.defineProperty(globalThis, 'window', {
    value: {
      addEventListener: () => {
        /* noop */
      },
      removeEventListener: () => {
        /* noop */
      }
    }
  })
}
