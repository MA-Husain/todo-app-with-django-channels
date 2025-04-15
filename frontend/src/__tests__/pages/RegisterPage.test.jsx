import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import RegisterPage from '../../pages/RegisterPage'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

// Mock useNavigate
// Declare a mock at the top-level scope
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate, // override here
  }
})



// Mock toast
vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn()
  }
}))
vi.mock('../../axiosConfig');
// Mock Spinner
vi.mock('../../components/Spinner', () => ({
  default: () => <div data-testid="spinner">Loading...</div>
}))

// Mock FormField
vi.mock('../../pages/FormField', () => ({
  __esModule: true,
  default: ({ type, name, placeholder, value, onChange }) => (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      data-testid={`input-${name}`}
    />
  )
}))

// Dummy reducer with controlled state
const createTestStore = (preloadedState) =>
  configureStore({
    reducer: {
      auth: (state = preloadedState.auth, action) => {
        switch (action.type) {
          case 'auth/register/pending':
            return { ...state, isLoading: true }
          default:
            return state
        }
      }
    }
  })

describe('RegisterPage', () => {
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
          <RegisterPage />
        </MemoryRouter>
      </Provider>
    )
  }

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders the register form heading and fields', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/first name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/last name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/^retype password$/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument()
  })

  it('renders login link', () => {
    renderPage()
    expect(screen.getByText(/already have an account\?/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /login/i })).toHaveAttribute('href', '/login')
  })

  it('shows toast error if passwords do not match', () => {
    
    renderPage()

    fireEvent.change(screen.getByPlaceholderText(/^password$/i), {
        target: { name: 'password', value: 'pass1234' }
    })
    fireEvent.change(screen.getByPlaceholderText(/^retype password$/i), {
        target: { name: 're_password', value: 'differentpass' }
    })
      

    fireEvent.click(screen.getByRole('button', { name: /register/i }))

    expect(toast.error).toHaveBeenCalledWith('Passwords do not match')
  })

  it('dispatches register action if passwords match', () => {
    renderPage()

    fireEvent.change(screen.getByPlaceholderText(/first name/i), {
      target: { name: 'first_name', value: 'John' }
    })
    fireEvent.change(screen.getByPlaceholderText(/last name/i), {
      target: { name: 'last_name', value: 'Doe' }
    })
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { name: 'email', value: 'john@example.com' }
    })
    fireEvent.change(screen.getByPlaceholderText(/^password$/i), {
      target: { name: 'password', value: 'pass1234' }
    })
    fireEvent.change(screen.getByPlaceholderText(/retype password/i), {
      target: { name: 're_password', value: 'pass1234' }
    })

    fireEvent.click(screen.getByRole('button', { name: /register/i }))

    expect(store.dispatch).toHaveBeenCalled()
    const dispatchedAction = store.dispatch.mock.calls[0][0]
    expect(dispatchedAction).toHaveProperty('type')
  })

  it('shows spinner when isLoading is true', () => {
    renderPage({ auth: { isLoading: true } })
    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })

  it('shows success toast and navigates on successful registration', () => {
    renderPage({ auth: { isSuccess: true, message: '' } })

    expect(toast.success).toHaveBeenCalledWith(
        'An activation email has been sent to your email. Please check your inbox.'
    )
    expect(mockNavigate).toHaveBeenCalledWith('/login')
    })
    
  it('shows error toast when isError is true', () => {
    renderPage({ auth: { isError: true, message: 'Email already in use' } })
    expect(toast.error).toHaveBeenCalledWith('Email already in use')
  })

  it('does not dispatch register if required fields are missing', () => {
    renderPage()
  
    fireEvent.click(screen.getByRole('button', { name: /register/i }))
  
    const dispatchedTypes = store.dispatch.mock.calls.map(call => call[0]?.type)
    expect(dispatchedTypes).not.toContain('auth/register/pending')

  })
  
})
