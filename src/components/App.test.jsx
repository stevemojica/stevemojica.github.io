import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import App from '../App'

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
