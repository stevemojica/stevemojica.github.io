import '@testing-library/jest-dom'

// Note: JSDOM does not implement CSS.supports, which react-activity-calendar
// (used by react-github-calendar) relies on. We must mock it.
if (typeof CSS === 'undefined') {
    global.CSS = {}
}
if (typeof CSS.supports !== 'function') {
    CSS.supports = () => false
}

// JSDOM does not implement IntersectionObserver, needed by Navbar scroll tracking.
if (typeof IntersectionObserver === 'undefined') {
    global.IntersectionObserver = class {
        constructor() {}
        observe() {}
        unobserve() {}
        disconnect() {}
    }
}

// JSDOM does not implement window.matchMedia, needed by ThemeContext.
if (typeof window.matchMedia !== 'function') {
    window.matchMedia = (query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
    })
}
