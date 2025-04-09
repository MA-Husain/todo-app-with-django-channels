import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getUserInfo, logout, reset } from '../../features/auth/authSlice'
import { NavLink, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const Nav = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { user, userInfo } = useSelector((state) => state.auth)

  // ✅ Fetch userInfo once if user exists but userInfo is empty
  useEffect(() => {
    if (user && !userInfo?.first_name) {
      dispatch(getUserInfo())
    }
  }, [user, userInfo?.first_name, dispatch])

  const handleLogout = async () => {
    await dispatch(logout())
    dispatch(reset())
    toast.success("Logged out successfully")
    navigate("/")
  }

  return (
    <div className="navbar bg-base-100 shadow-md px-4">
      <div className="flex-1">
        <NavLink to="/" className="text-xl font-bold text-primary">ToDoApp</NavLink>
      </div>

      <div className="flex-none">
        <ul className="menu menu-horizontal px-1 space-x-2">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="font-medium">
                Hi, {userInfo?.first_name || "User"}
              </span>
              <button onClick={handleLogout} className="btn btn-sm btn-error text-white">
                Logout
              </button>
            </div>
          ) : (
            <NavLink to={user ? '/dashboard' : '/login'} className="btn btn-primary btn-sm text-white">
              MyToDo
            </NavLink>
          )}
        </ul>
      </div>
    </div>
  )
}

export default Nav
