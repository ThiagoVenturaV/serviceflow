// ─── Test Environment Setup ────────────────────────────────────────────────
// This file runs before every test suite.
// It extends the default matchers with DOM-specific ones (e.g. toBeInTheDocument)
// and sets up global mocks for browser APIs that jsdom doesn't provide.

import '@testing-library/jest-dom';

// ── Mock: import.meta.env (Vite env variables) ──────────────────────────────
// Vitest already handles import.meta.env, but we ensure defaults here.

// ── Mock: window.matchMedia (used by responsive/dark-mode code) ─────────────
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

// ── Mock: scrollIntoView (not implemented in jsdom) ─────────────────────────
Element.prototype.scrollIntoView = vi.fn();

// ── Mock: GSAP (animations are not testable in jsdom) ───────────────────────
vi.mock('gsap', () => {
  const gsapMock = {
    registerPlugin: vi.fn(),
    fromTo: vi.fn(),
    timeline: vi.fn(() => ({
      fromTo: vi.fn().mockReturnThis(),
      to: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
    })),
    context: vi.fn((fn) => {
      // Execute the callback to capture the setup, but with safe mocks
      try { fn(); } catch { /* GSAP selectors won't find DOM elements in tests */ }
      return { revert: vi.fn() };
    }),
    set: vi.fn(),
    to: vi.fn(),
    from: vi.fn(),
  };
  return { default: gsapMock, ...gsapMock };
});

vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {
    create: vi.fn(),
    refresh: vi.fn(),
    getAll: vi.fn(() => []),
    kill: vi.fn(),
  },
}));

// ── Mock: @vercel/speed-insights ────────────────────────────────────────────
vi.mock('@vercel/speed-insights/react', () => ({
  SpeedInsights: () => null,
}));

// ── Mock: Web Speech API (SpeechRecognition) ────────────────────────────────
// Must be a proper class so it can be called with `new`.
class MockSpeechRecognition {
  constructor() {
    this.lang = '';
    this.continuous = false;
    this.interimResults = false;
    this.onresult = null;
    this.onend = null;
    this.onerror = null;
    MockSpeechRecognition._lastInstance = this;
  }
  start = vi.fn();
  stop = vi.fn();
  abort = vi.fn();
}

MockSpeechRecognition._lastInstance = null;

Object.defineProperty(window, 'SpeechRecognition', {
  writable: true,
  value: MockSpeechRecognition,
});

Object.defineProperty(window, 'webkitSpeechRecognition', {
  writable: true,
  value: MockSpeechRecognition,
});

// Expose for assertions in tests
globalThis.MockSpeechRecognition = MockSpeechRecognition;
