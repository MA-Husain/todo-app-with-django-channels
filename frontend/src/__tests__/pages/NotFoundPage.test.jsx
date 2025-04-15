import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NotFoundPage from '../../pages/NotFoundPage'

describe('NotFoundPage', () => {
  const renderPage = () =>
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    )

  it('renders the 404 heading and icon', () => {
    renderPage()

    const heading = screen.getByRole('heading', { name: /404/i })
    expect(heading).toBeInTheDocument()
  })

  it('renders the error message', () => {
    renderPage()

    expect(
      screen.getByText(/oops! the page you're looking for doesn't exist/i)
    ).toBeInTheDocument()
  })

  it('renders the "Go Back Home" button with correct link', () => {
    renderPage()

    const button = screen.getByRole('link', { name: /go back home/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('href', '/')
  })
})
