
import authService from "../../../features/auth/authService"
import axios from '../../../axiosConfig'
import { vi } from 'vitest'

vi.mock('../../../axiosConfig')


describe('authService', () => {
  const mockUserData = { email: 'test@example.com', password: 'password123' }
  const mockToken = 'mock-access-token'

  afterEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  // REGISTER
  it('registers a user', async () => {
    axios.post.mockResolvedValue({ data: { id: 1, email: 'test@example.com' } })

    const response = await authService.register(mockUserData)

    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/users/'),
      mockUserData,
      expect.objectContaining({
        headers: { 'Content-type': 'application/json' },
      })
    )
    expect(response).toEqual({ id: 1, email: 'test@example.com' })
  })

  // LOGIN
  it('logs in a user and stores token in localStorage', async () => {
    const mockResponse = { access: 'abc123', refresh: 'xyz456' }
    axios.post.mockResolvedValue({ data: mockResponse })

    const response = await authService.login(mockUserData)

    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/jwt/create/'),
      mockUserData,
      expect.objectContaining({
        headers: { 'Content-type': 'application/json' },
      })
    )
    expect(localStorage.getItem('user')).toEqual(JSON.stringify(mockResponse))
    expect(response).toEqual(mockResponse)
  })

  // LOGOUT
  it('logs out a user by removing user from localStorage', () => {
    localStorage.setItem('user', JSON.stringify({ access: 'abc' }))
    authService.logout()
    expect(localStorage.getItem('user')).toBeNull()
  })

  // ACTIVATE
  it('activates a user', async () => {
    const mockActivationData = { uid: 'abc', token: 'def' }
    axios.post.mockResolvedValue({ data: { detail: 'Activated' } })

    const response = await authService.activate(mockActivationData)

    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/activation/'),
      mockActivationData,
      expect.any(Object)
    )
    expect(response).toEqual({ detail: 'Activated' })
  })

  // RESET PASSWORD
  it('sends password reset email', async () => {
    const emailData = { email: 'test@example.com' }
    axios.post.mockResolvedValue({ data: { detail: 'Reset email sent' } })

    const response = await authService.resetPassword(emailData)

    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/reset_password/'),
      emailData,
      expect.any(Object)
    )
    expect(response).toEqual({ detail: 'Reset email sent' })
  })

  // RESET PASSWORD CONFIRM
  it('resets the password with token and uid', async () => {
    const resetData = {
      uid: 'abc',
      token: 'def',
      new_password: 'newpassword123',
    }
    axios.post.mockResolvedValue({ data: { detail: 'Password set' } })

    const response = await authService.resetPasswordConfirm(resetData)

    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/reset_password_confirm/'),
      resetData,
      expect.any(Object)
    )
    expect(response).toEqual({ detail: 'Password set' })
  })

  // GET USER INFO
  it('gets user info using access token', async () => {
    axios.get.mockResolvedValue({ data: { id: 1, name: 'John' } })

    const response = await authService.getUserInfo(mockToken)

    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/users/me/'),
      expect.objectContaining({
        headers: {
          Authorization: `Bearer ${mockToken}`,
        },
      })
    )
    expect(response).toEqual({ id: 1, name: 'John' })
  })
})
