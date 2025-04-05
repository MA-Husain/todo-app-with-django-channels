import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { BiLogInCircle } from "react-icons/bi"
import { useDispatch, useSelector } from 'react-redux'
import { login, reset, getUserInfo } from '../features/auth/authSlice'
import { toast } from 'react-toastify'
import Spinner from "../components/Spinner"
import FormField from "./FormField"

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const { email, password } = formData

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { user, isLoading, isError, isSuccess, message } = useSelector(state => state.auth)

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = e => {
    e.preventDefault()
    dispatch(login({ email, password }))
  }

  useEffect(() => {
    if (isError) toast.error(message)
    if (isSuccess || user) navigate("/dashboard")

    dispatch(reset())
    dispatch(getUserInfo())
  }, [isError, isSuccess, user, navigate, dispatch])

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="card w-full max-w-md shadow-xl p-8 bg-base-100 space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
        Login <BiLogInCircle />
        </h2>

        {isLoading && <Spinner />}

        <form onSubmit={handleSubmit} className="flex flex-col gap-y-6">
        {/* Email & Password Fields */}
        <div className="flex flex-col gap-y-4">
            <FormField
            type="email"
            placeholder="Email"
            name="email"
            value={email}
            onChange={handleChange}
            />
            <FormField
            type="password"
            placeholder="Password"
            name="password"
            value={password}
            onChange={handleChange}
            />
        </div>

        {/* Links */}
        <div className="flex justify-between text-sm text-primary mt-2">
            <Link to="/reset-password" className="hover:underline">Forgot Password?</Link>
            <Link to="/register" className="hover:underline">New user? Sign up</Link>
        </div>

        {/* Submit Button */}
        <div className="mt-4">
            <button className="btn btn-primary w-full">Login</button>
        </div>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
