import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useSelector, useDispatch } from "react-redux"
import { resetPasswordConfirm } from '../features/auth/authSlice'
import { AiFillLock } from 'react-icons/ai'
import Spinner from '../components/Spinner'
import FormField from "./FormField"

const ResetPasswordConfirmPage = () => {
  const { uid, token } = useParams()
  const [formData, setFormData] = useState({
    new_password: '',
    re_new_password: ''
  })

  const { new_password, re_new_password } = formData

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { isLoading, isError, isSuccess, message } = useSelector((state) => state.auth)

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(resetPasswordConfirm({
      uid,
      token,
      new_password,
      re_new_password
    }))
  }

  useEffect(() => {
    if (isError) toast.error(message)
    if (isSuccess) {
      toast.success("Your password was reset successfully.")
      navigate("/login")
    }
  }, [isError, isSuccess, message, navigate, dispatch])

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
        <div className="card w-full max-w-md shadow-xl p-8 bg-base-100 space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
            Reset Password <AiFillLock />
            </h2>

            {isLoading && <Spinner />}

            <form onSubmit={handleSubmit} className="flex flex-col gap-y-6">
            {/* Form Fields with spacing */}
            <div className="flex flex-col gap-y-4">
                <FormField
                type="password"
                placeholder="New Password"
                name="new_password"
                value={new_password}
                onChange={handleChange}
                />
                <FormField
                type="password"
                placeholder="Confirm New Password"
                name="re_new_password"
                value={re_new_password}
                onChange={handleChange}
                />
            </div>

            {/* Submit Button */}
            <div className="mt-4">
                <button className="btn btn-primary w-full" type="submit">
                Reset Password
                </button>
            </div>
            </form>

        </div>
    </div>
  )
}

export default ResetPasswordConfirmPage
