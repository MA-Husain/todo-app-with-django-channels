// frontend/src/components/routes/GuestOnlyRoute.jsx
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const GuestOnlyRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth)

  if (user) {
    return <Navigate to="/dashboard" />
  }

  return children
}

export default GuestOnlyRoute
