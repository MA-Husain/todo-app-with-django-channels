import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import ActivatePage from '../../pages/ActivatePage'
import { toast } from 'react-toastify'
import * as authSlice from '../../features/auth/authSlice'

// 👇 Top-level navigate mock
const navigate = vi.fn()

// 👇 Top-level mock for useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigate,
  }
})

// 👇 Mock toast
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  }
}))

const mockStore = configureStore([])

const renderWithProviders = (ui, { store, route = '/activate/123/abc' } = {}) => {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/activate/:uid/:token" element={ui} />
        </Routes>
      </MemoryRouter>
    </Provider>
  )
}

describe('ActivatePage', () => {
  let store
  let activateSpy
  let resetSpy

  beforeEach(() => {
    store = mockStore({
      auth: {
        isLoading: false,
        isError: false,
        isSuccess: false,
        message: ''
      }
    })

    activateSpy = vi.spyOn(authSlice, 'activate').mockReturnValue({ type: 'auth/activate' })
    resetSpy = vi.spyOn(authSlice, 'reset').mockReturnValue({ type: 'auth/reset' })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders the ActivatePage correctly', () => {
    renderWithProviders(<ActivatePage />, { store })
    expect(screen.getByRole('heading', { name: /Activate Account/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Activate Account/i })).toBeInTheDocument()

  })

  it('dispatches activate and shows success toast on button click', () => {
    renderWithProviders(<ActivatePage />, { store })

    const button = screen.getByRole('button', { name: /Activate Account/i })
    fireEvent.click(button)

    expect(activateSpy).toHaveBeenCalledWith({ uid: '123', token: 'abc' })
    expect(toast.success).toHaveBeenCalledWith("Your account has been activated! You can now login.")
  })

  it('shows loading spinner when isLoading is true', () => {
    store = mockStore({
      auth: {
        isLoading: true,
        isError: false,
        isSuccess: false,
        message: ''
      }
    })

    renderWithProviders(<ActivatePage />, { store })
    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })

  it('shows error toast when isError is true', () => {
    store = mockStore({
      auth: {
        isLoading: false,
        isError: true,
        isSuccess: false,
        message: 'Invalid activation link'
      }
    })

    renderWithProviders(<ActivatePage />, { store })

    expect(toast.error).toHaveBeenCalledWith('Invalid activation link')
    expect(resetSpy).toHaveBeenCalled()
  })

  it('navigates to login on success', () => {
    store = mockStore({
      auth: {
        isLoading: false,
        isError: false,
        isSuccess: true,
        message: ''
      }
    })

    renderWithProviders(<ActivatePage />, { store })

    expect(navigate).toHaveBeenCalledWith('/login')
    expect(resetSpy).toHaveBeenCalled()
  })
})
