import '@testing-library/jest-dom'

// jsdom lacks these browser APIs that OptimizedImage relies on.
class IntersectionObserverStub {
  constructor(callback) {
    this.callback = callback
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}
global.IntersectionObserver = IntersectionObserverStub

// Canvas isn't implemented in jsdom; stub the format probe used for image loading.
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.toDataURL = () => ''
}
