import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HomePage from '../../pages/Homepage'

describe('Homepage', () => {
  it('renders the main heading and description', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', { name: /My ToDo Application/i })
    ).toBeInTheDocument()

    expect(
      screen.getByText(/Organize your thoughts/i)
    ).toBeInTheDocument()
  })

  it('renders login and sign up buttons with correct links', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )

    const loginBtn = screen.getByRole('link', { name: /login/i })
    const signUpBtn = screen.getByRole('link', { name: /sign up/i })

    expect(loginBtn).toBeInTheDocument()
    expect(loginBtn).toHaveAttribute('href', '/login')

    expect(signUpBtn).toBeInTheDocument()
    expect(signUpBtn).toHaveAttribute('href', '/register')
  })
})
