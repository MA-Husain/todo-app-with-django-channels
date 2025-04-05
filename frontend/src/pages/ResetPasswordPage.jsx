import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { BiLockOpen } from "react-icons/bi"
import Spinner from "../components/Spinner"
import { resetPassword } from "../features/auth/authSlice"
import FormField from "./FormField"

const ResetPasswordPage = () => {
  const [formData, setFormData] = useState({ email: "" })
  const { email } = formData

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { isLoading, isError, isSuccess, message } = useSelector((state) => state.auth)

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(resetPassword({ email }))
  }

  useEffect(() => {
    if (isError) toast.error(message)
    if (isSuccess) {
      toast.success("A reset password email has been sent to your email.")
      navigate("/")
    }
  }, [isError, isSuccess, message, navigate, dispatch])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card w-full max-w-md shadow-xl p-6 bg-base-100">
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
          Reset Password <BiLockOpen />
        </h2>

        {isLoading && <Spinner />}

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <FormField
            type="email"
            placeholder="Email"
            name="email"
            value={email}
            onChange={handleChange}
        />

        {/* Add extra space above the button */}
        <div className="mt-4">
            <button className="btn btn-primary w-full" type="submit">
            Send Reset Link
            </button>
        </div>
        </form>
      </div>
    </div>
  )
}

export default ResetPasswordPage
