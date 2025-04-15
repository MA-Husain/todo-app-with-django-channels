import { configureStore } from "@reduxjs/toolkit"
import reducer, {
  register,
  login,
  logout,
  activate,
  resetPassword,
  resetPasswordConfirm,
  getUserInfo,
  reset,
} from "../../../features/auth/authSlice"
import authService from "../../../features/auth/authService"
import { vi } from "vitest"
import thunk from "redux-thunk"

// Mock the authService
vi.mock("../../../features/auth/authService")

describe("authSlice", () => {
  const initialState = {
    user: null,
    userInfo: {},
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: "",
  }

  let store

  beforeEach(() => {
    store = configureStore({
      reducer: { auth: reducer },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          thunk: true,
          serializableCheck: false,
        }),
      preloadedState: { auth: initialState },
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it("should handle reset reducer", () => {
    const previousState = {
      ...initialState,
      isLoading: true,
      isError: true,
      isSuccess: true,
      message: "Something went wrong",
    }

    const newState = reducer(previousState, reset())
    expect(newState).toEqual(initialState)
  })

  it("should handle register fulfilled", async () => {
    const userData = { email: "test@example.com", password: "123456" }
    const response = { id: 1, email: "test@example.com" }
    authService.register.mockResolvedValueOnce(response)

    await store.dispatch(register(userData))

    const actions = store.getState().auth
    expect(authService.register).toHaveBeenCalledWith(userData)
    expect(actions.isSuccess).toBe(true)
  })

  it("should handle register rejected", async () => {
    authService.register.mockRejectedValueOnce({
      response: { data: { detail: "Register error" } },
    })

    await store.dispatch(register({}))
    const state = store.getState().auth

    expect(state.isError).toBe(true)
    expect(state.message).toBe("detail: Register error")
  })

  it("should handle login fulfilled and update user in state", async () => {
    const mockUser = { access: "token123", refresh: "refresh123" }
    authService.login.mockResolvedValueOnce(mockUser)

    await store.dispatch(login({ email: "test@example.com", password: "pass" }))
    const state = store.getState().auth

    expect(state.user).toEqual(mockUser)
  })

  it("should handle logout and clear user", async () => {
    store = configureStore({
      reducer: { auth: reducer },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          thunk: true,
          serializableCheck: false,
        }),
      preloadedState: {
        auth: {
          ...initialState,
          user: { access: "abc" },
        },
      },
    })

    await store.dispatch(logout())
    const state = store.getState().auth

    expect(state.user).toBeNull()
    expect(state.userInfo).toEqual({})
  })

  it("should handle activate fulfilled", async () => {
    const mockActivation = { uid: "abc", token: "xyz" }
    authService.activate.mockResolvedValueOnce({ detail: "Activated" })

    await store.dispatch(activate(mockActivation))
    const state = store.getState().auth

    expect(state.isSuccess).toBe(true)
  })

  it("should handle resetPassword fulfilled", async () => {
    authService.resetPassword.mockResolvedValueOnce({ detail: "Reset email sent" })

    await store.dispatch(resetPassword({ email: "test@example.com" }))
    const state = store.getState().auth

    expect(state.isSuccess).toBe(true)
  })

  it("should handle resetPasswordConfirm fulfilled", async () => {
    const data = { uid: "abc", token: "xyz", new_password: "newPass123" }
    authService.resetPasswordConfirm.mockResolvedValueOnce({ detail: "Password set" })

    await store.dispatch(resetPasswordConfirm(data))
    const state = store.getState().auth

    expect(state.isSuccess).toBe(true)
  })

  it("should handle getUserInfo fulfilled and set userInfo", async () => {
    const mockUser = { access: "token123" }
    const mockInfo = { id: 1, name: "John Doe" }
  
    // Set initial user state so getUserInfo can access token
    store = configureStore({
      reducer: { auth: reducer },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          thunk: true,
          serializableCheck: false,
        }),
      preloadedState: {
        auth: { ...initialState, user: mockUser },
      },
    })
  
    authService.getUserInfo.mockResolvedValueOnce(mockInfo)
  
    await store.dispatch(getUserInfo())
  
    const state = store.getState().auth
    expect(state.userInfo).toEqual(mockInfo)
  })  
})
