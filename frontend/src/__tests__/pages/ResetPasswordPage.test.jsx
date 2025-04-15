import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import ResetPasswordPage from '../../pages/ResetPasswordPage'
import { toast } from 'react-toastify'
import * as authSlice from '../../features/auth/authSlice'


vi.mock('../../axiosConfig');

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock toast
vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn()
  }
}))

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
          case 'auth/resetPassword/pending':
            return { ...state, isLoading: true }
          default:
            return state
        }
      }
    }
  })

describe('ResetPasswordPage', () => {
  let store

  const renderPage = (preloadedState = {}) => {
    store = createTestStore({
      auth: {
        isLoading: false,
        isError: false,
        isSuccess: false,
        message: '',
        ...preloadedState.auth
      }
    })
  
    // Mock the dispatch method so we can inspect it later
    vi.spyOn(store, 'dispatch')
  
    vi.spyOn(authSlice, 'resetPassword').mockReturnValue(() => ({ type: 'test-action' }))
  
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <ResetPasswordPage />
        </MemoryRouter>
      </Provider>
    )
  }

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders reset password heading and form elements', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /reset password/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument()
  })

  it('updates email on change and submits form', () => {
    renderPage()

    const input = screen.getByPlaceholderText(/email/i)
    fireEvent.change(input, { target: { name: 'email', value: 'user@example.com' } })
    expect(input.value).toBe('user@example.com')

    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }))
    expect(authSlice.resetPassword).toHaveBeenCalledWith({ email: 'user@example.com' })

    const dispatchedAction = store.dispatch.mock.calls[0][0]
    expect(typeof dispatchedAction).toBe('function')

  })

  it('shows spinner when isLoading is true', () => {
    renderPage({ auth: { isLoading: true } })
    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })

  it('shows success toast and navigates on successful reset', () => {
    renderPage({ auth: { isSuccess: true, message: '' } })
    expect(toast.success).toHaveBeenCalledWith('A reset password email has been sent to your email.')
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('shows error toast when isError is true', () => {
    renderPage({ auth: { isError: true, message: 'User not found' } })
    expect(toast.error).toHaveBeenCalledWith('User not found')
  })
})
