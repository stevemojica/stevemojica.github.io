import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import { ThemeProvider } from '../ThemeContext'
import App from '../App'

// Mock the ContribGraph component because `react-activity-calendar` uses CSS properties
// and validation logic that fails in the headless JSDOM test environment.
vi.mock('../components/ContribGraph', () => ({
  default: () => <div data-testid="mock-contrib-graph">Mocked Graph</div>
}))

describe('App', () => {
  it('renders the home page with the editorial design sections', () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </MemoryRouter>
    )
    expect(screen.getAllByText('K-12 IT Director').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/small IT shops with good taste/i)).toBeInTheDocument()
    expect(screen.getByText(/where i'm at/i)).toBeInTheDocument()
    expect(screen.getAllByText(/real news,/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/real numbers/i)).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </MemoryRouter>
    )
    // Side rail exposes Home / Now / About plus external links
    expect(screen.getAllByText('Home').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Now').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('About').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('GitHub').length).toBeGreaterThanOrEqual(1)
  })
})
