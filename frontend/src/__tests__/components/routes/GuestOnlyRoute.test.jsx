// GuestOnlyRoute.test.jsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import GuestOnlyRoute from '../../../components/routes/GuestOnlyRoute'

const mockStore = configureStore([])

const renderWithStore = (store, ui) =>
  render(
    <Provider store={store}>
      <MemoryRouter>{ui}</MemoryRouter>
    </Provider>
  )

describe('GuestOnlyRoute', () => {
  it('renders children when user is not logged in', () => {
    const store = mockStore({ auth: { user: null } })

    renderWithStore(store, (
      <GuestOnlyRoute>
        <div>Public Page</div>
      </GuestOnlyRoute>
    ))

    expect(screen.getByText('Public Page')).toBeInTheDocument()
  })

  it('redirects to /dashboard when user is logged in', () => {
    const store = mockStore({ auth: { user: { email: 'test@example.com' } } })

    renderWithStore(store, (
      <GuestOnlyRoute>
        <div>Public Page</div>
      </GuestOnlyRoute>
    ))

    expect(screen.queryByText('Public Page')).not.toBeInTheDocument()
  })
})
