import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureStore from 'redux-mock-store'
import Nav from '../../../components/navigation/Nav'
import { vi } from 'vitest'
import { waitFor } from '@testing-library/react'
import { toast } from 'react-toastify' 

// ✅ Mock navigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// ✅ Mock toast
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
  }
}))

const mockStore = configureStore([])

const renderWithStore = (store) =>
  render(
    <Provider store={store}>
      <MemoryRouter>
        <Nav />
      </MemoryRouter>
    </Provider>
  )

describe('Nav Component', () => {
  it('shows "MyToDo" when user is not logged in', () => {
    const store = mockStore({ auth: { user: null, userInfo: null } })
    renderWithStore(store)
    expect(screen.getByText('MyToDo')).toBeInTheDocument()
  })

  it('shows user first name and logout button when logged in', () => {
    const store = mockStore({
      auth: {
        user: { email: 'test@example.com' },
        userInfo: { first_name: 'Atif' },
      },
    })
    renderWithStore(store)

    expect(screen.getByText('Hi, Atif')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
  })

  it('calls logout and navigates when logout is clicked', async () => {
    const store = mockStore({
      auth: {
        user: { email: 'test@example.com' },
        userInfo: { first_name: 'Atif' },
      },
    })
  
    store.dispatch = vi.fn()
  
    renderWithStore(store)
  
    const logoutButton = screen.getByRole('button', { name: /logout/i })
    fireEvent.click(logoutButton)
  
    // ✅ Check logout dispatch
    expect(store.dispatch).toHaveBeenCalledWith(expect.any(Function))
  
    // ✅ Wait for navigate call
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  
    // ✅ Check toast success
    expect(toast.success).toHaveBeenCalledWith('Logged out successfully')
  })
})
