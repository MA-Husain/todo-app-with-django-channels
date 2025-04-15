// PrivateRoute.test.jsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import PrivateRoute from '../../../components/routes/PrivateRoute'

const mockStore = configureStore([])

const renderWithStore = (store, ui) =>
  render(
    <Provider store={store}>
      <MemoryRouter>{ui}</MemoryRouter>
    </Provider>
  )

describe('PrivateRoute', () => {
  it('renders children when user is logged in', () => {
    const store = mockStore({ auth: { user: { email: 'user@example.com' } } })

    renderWithStore(store, (
      <PrivateRoute>
        <div>Private Page</div>
      </PrivateRoute>
    ))

    expect(screen.getByText('Private Page')).toBeInTheDocument()
  })

  it('redirects to /login when user is not logged in', () => {
    const store = mockStore({ auth: { user: null } })

    renderWithStore(store, (
      <PrivateRoute>
        <div>Private Page</div>
      </PrivateRoute>
    ))

    expect(screen.queryByText('Private Page')).not.toBeInTheDocument()
  })
})
