import '@testing-library/jest-dom'

// Note: JSDOM does not implement CSS.supports, which react-activity-calendar
// (used by react-github-calendar) relies on. We must mock it.
if (typeof CSS === 'undefined') {
    global.CSS = {}
}
if (typeof CSS.supports !== 'function') {
    CSS.supports = () => false
}
