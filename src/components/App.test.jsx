import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import App from '../App'

// Mock the ContribGraph component because `react-activity-calendar` uses CSS properties
// and validation logic that fails in the headless JSDOM test environment.
vi.mock('../components/ContribGraph', () => ({
  default: () => <div data-testid="mock-contrib-graph">Mocked Graph</div>
}))

describe('App', () => {
  it('renders the profile page with key sections', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('Steve Mojica')).toBeInTheDocument()
    expect(screen.getByText('IT Professional')).toBeInTheDocument()
    expect(screen.getByText("GitHub Portfolio")).toBeInTheDocument()
    expect(screen.getByText('Documenting the Journey')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getAllByText('Open Source').length).toBeGreaterThanOrEqual(1)
  })
})
