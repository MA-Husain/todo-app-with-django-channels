import { useEffect } from 'react'
import { BiUserCheck } from 'react-icons/bi'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { activate, reset } from '../features/auth/authSlice'
import { toast } from 'react-toastify'
import Spinner from '../components/Spinner'

const ActivatePage = () => {
  const { uid, token } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { isLoading, isError, isSuccess, message } = useSelector(state => state.auth)

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(activate({ uid, token }))
    toast.success("Your account has been activated! You can now login.")
  }

  useEffect(() => {
    if (isError) {
      toast.error(message)
    }

    if (isSuccess) {
      navigate("/login")
    }

    dispatch(reset())
  }, [isError, isSuccess, navigate, dispatch])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card w-full max-w-md shadow-xl p-6 bg-base-100 text-center">
        <h2 className="text-2xl font-bold flex items-center gap-2 justify-center mb-6">
          Activate Account <BiUserCheck />
        </h2>

        {isLoading && <Spinner />}

        <button
          className="btn btn-accent w-full"
          type="button"
          onClick={handleSubmit}
        >
          Activate Account
        </button>
      </div>
    </div>
  )
}

export default ActivatePage
