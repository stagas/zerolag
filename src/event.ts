/* eslint-disable @typescript-eslint/no-explicit-any */
interface EventHandler {
  (a?: any, b?: any, c?: any, d?: any): void
}

export class Event {
  _handlers: Record<string, EventHandler[]> = {}
  silent?: boolean

  _getHandlers(name: string) {
    return (this._handlers[name] = this._handlers[name] || [])
  }
  emit(name: string, a?: any, b?: any, c?: any, d?: any) {
    if (this.silent) return
    const handlers = this._getHandlers(name)
    for (let i = 0; i < handlers.length; i++) {
      handlers[i](a, b, c, d)
    }
  }
  on(name: string, ...newHandlers: EventHandler[]) {
    this._getHandlers(name).push(...newHandlers)
  }
  off(name: string, handler: EventHandler) {
    const handlers = this._getHandlers(name)
    const index = handlers.indexOf(handler)
    if (~index) handlers.splice(index, 1)
  }
  once(name: string, fn: EventHandler) {
    const handlers = this._getHandlers(name)
    const handler = function (a?: any, b?: any, c?: any, d?: any) {
      fn(a, b, c, d)
      handlers.splice(handlers.indexOf(handler), 1)
    }
    handlers.push(handler)
  }
}
