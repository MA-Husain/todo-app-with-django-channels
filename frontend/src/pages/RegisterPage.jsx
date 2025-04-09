import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { BiUser } from 'react-icons/bi'
import { useDispatch, useSelector } from 'react-redux'
import { register, reset } from '../features/auth/authSlice'
import { useNavigate, Link } from 'react-router-dom'
import Spinner from '../components/Spinner'
import FormField from './FormField'

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    re_password: "",
  })

  const { first_name, last_name, email, password, re_password } = formData

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, isLoading, isError, isSuccess, message } = useSelector(state => state.auth)

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (password !== re_password) {
      toast.error("Passwords do not match")
    } else {
      const userData = { first_name, last_name, email, password, re_password }
      dispatch(register(userData))
    }
  }

  useEffect(() => {
    if (isError) toast.error(message)
  
    if (isSuccess) {
      toast.success("An activation email has been sent to your email. Please check your inbox.")
      navigate("/login")
    }
  
    dispatch(reset())
  }, [isError, isSuccess, message, navigate, dispatch])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card w-full max-w-md shadow-xl p-6 bg-base-100">
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
          Register <BiUser />
        </h2>

        {isLoading && <Spinner />}

        <form onSubmit={handleSubmit} className="flex flex-col gap-y-6">
          <div className="flex flex-col gap-y-4">
            <FormField
              type="text"
              placeholder="First Name"
              name="first_name"
              value={first_name}
              onChange={handleChange}
            />
            <FormField
              type="text"
              placeholder="Last Name"
              name="last_name"
              value={last_name}
              onChange={handleChange}
            />
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
            <FormField
              type="password"
              placeholder="Retype Password"
              name="re_password"
              value={re_password}
              onChange={handleChange}
            />
          </div>

          <div className="text-sm text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">Login</Link>
          </div>

          <div className="mt-2">
            <button className="btn btn-primary w-full" type="submit">Register</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegisterPage
