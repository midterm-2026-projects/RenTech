import '@testing-library/jest-dom'

// jsdom doesn't implement real page navigation, so form submissions log a
// "Not implemented: navigation to another Document" warning. Stub it out.
if (window.navigation) {
  window.navigation = undefined;
}
window.HTMLFormElement.prototype.submit = vi.fn();

// The axios response interceptors in inventoryApiClient / analyticsApiClient
// navigate via window.location.href on 401/403. jsdom cannot perform that
// navigation and emits a noisy "Not implemented: navigation to another
// Document" warning. Replace location with a no-op mock so those assignments
// don't attempt navigation. (Tests that assert on the redirect delete and
// reassign window.location themselves, so keep this configurable.)
Object.defineProperty(window, 'location', {
  configurable: true,
  value: {
    href: 'http://localhost/',
    origin: 'http://localhost',
    protocol: 'http:',
    host: 'localhost',
    hostname: 'localhost',
    port: '',
    pathname: '/',
    search: '',
    hash: '',
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
    toString: () => 'http://localhost/',
  },
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});