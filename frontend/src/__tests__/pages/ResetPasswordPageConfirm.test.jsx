// src/__tests__/pages/ResetPasswordPageConfirm.test.jsx
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import ResetPasswordConfirmPage from '../../pages/ResetPasswordPageConfirm'
import { toast } from 'react-toastify'
import * as authSlice from '../../features/auth/authSlice'

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

// Mock toast
vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn()
  }
}))

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Create mock Redux store
const createTestStore = (preloadedState) =>
  configureStore({
    reducer: {
      auth: (state = preloadedState.auth, action) => {
        switch (action.type) {
          case 'auth/resetPasswordConfirm/pending':
            return { ...state, isLoading: true }
          default:
            return state
        }
      }
    }
  })

describe('ResetPasswordConfirmPage', () => {
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

    vi.spyOn(store, 'dispatch')
    vi.spyOn(authSlice, 'resetPasswordConfirm').mockReturnValue(() => ({ type: 'test-action' }))

    return render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/reset-password-confirm/uid123/token123']}>
          <Routes>
            <Route path="/reset-password-confirm/:uid/:token" element={<ResetPasswordConfirmPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    )
  }

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders reset password confirm form with fields and button', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: /reset password/i })).toBeInTheDocument()
    expect(screen.getByTestId('input-new_password')).toBeInTheDocument()
    expect(screen.getByTestId('input-re_new_password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument()
  })

  it('submits form with correct data', () => {
    renderPage()

    fireEvent.change(screen.getByTestId('input-new_password'), {
      target: { name: 'new_password', value: 'NewPass123' }
    })

    fireEvent.change(screen.getByTestId('input-re_new_password'), {
      target: { name: 're_new_password', value: 'NewPass123' }
    })

    fireEvent.click(screen.getByRole('button', { name: /reset password/i }))

    expect(authSlice.resetPasswordConfirm).toHaveBeenCalledWith({
      uid: 'uid123',
      token: 'token123',
      new_password: 'NewPass123',
      re_new_password: 'NewPass123',
    })

    const dispatchedAction = store.dispatch.mock.calls[0][0]
    expect(typeof dispatchedAction).toBe('function')
  })

  it('shows spinner when isLoading is true', () => {
    renderPage({ auth: { isLoading: true } })
    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })

  it('shows success toast and navigates on success', () => {
    renderPage({ auth: { isSuccess: true, message: '' } })
    expect(toast.success).toHaveBeenCalledWith('Your password was reset successfully.')
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  it('shows error toast on failure', () => {
    renderPage({ auth: { isError: true, message: 'Invalid token' } })
    expect(toast.error).toHaveBeenCalledWith('Invalid token')
  })
})
