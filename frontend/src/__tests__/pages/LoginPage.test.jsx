import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import LoginPage from '../../pages/LoginPage'

// Mock toast
vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn()
  }
}))

// Mock Spinner component
vi.mock('../../components/Spinner', () => ({
  default: () => <div data-testid="spinner">Loading...</div>
}))

// Dummy reducer with controlled state
const createTestStore = (preloadedState) =>
  configureStore({
    reducer: {
      auth: (state = preloadedState.auth, action) => {
        switch (action.type) {
          case 'auth/login/pending':
            return { ...state, isLoading: true }
          default:
            return state
        }
      }
    }
  })

describe('LoginPage', () => {
  let store

  const renderPage = (preloadedState = {}) => {
    store = createTestStore({
      auth: {
        user: null,
        isLoading: false,
        isError: false,
        isSuccess: false,
        message: '',
        ...preloadedState.auth
      }
    })

    vi.spyOn(store, 'dispatch')

    return render(
      <Provider store={store}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </Provider>
    )
  }

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders login heading and form inputs', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('renders forgot password and register links', () => {
    renderPage()

    expect(screen.getByText(/forgot password/i)).toHaveAttribute('href', '/reset-password')
    expect(screen.getByText(/new user\? sign up/i)).toHaveAttribute('href', '/register')
  })

  it('dispatches login action on form submit', () => {
    renderPage()

    const emailInput = screen.getByPlaceholderText(/email/i)
    const passwordInput = screen.getByPlaceholderText(/password/i)
    const submitButton = screen.getByRole('button', { name: /login/i })

    fireEvent.change(emailInput, { target: { name: 'email', value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'password123' } })

    fireEvent.click(submitButton)

    expect(store.dispatch).toHaveBeenCalled()
    const dispatchedAction = store.dispatch.mock.calls[0][0]
    expect(dispatchedAction).toHaveProperty('type') // thunk dispatch type
  })

  it('shows spinner when isLoading is true', () => {
    renderPage({
      auth: {
        isLoading: true
      }
    })

    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })
})
