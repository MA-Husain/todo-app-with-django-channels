import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Nav from "./components/navigation/Nav";
import HomePage from "./pages/HomePage";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ResetPasswordPageConfirm from "./pages/ResetPasswordPageConfirm";
import ActivatePage from "./pages/ActivatePage";
import NotFoundPage from "./pages/NotFoundPage";
import GuestOnlyRoute from "./components/routes/GuestOnlyRoute";
import PrivateRoute from "./components/routes/PrivateRoute"; // ✅ New import
import TodoListPage from "./pages/TodoListPage";
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { logout, getUserInfo } from './features/auth/authSlice';

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const checkToken = async () => {
      if (user?.access) {
        try {
          await dispatch(getUserInfo()).unwrap(); // try fetching user info
        } catch (err) {
          dispatch(logout()); // if failed (e.g., token invalid), log out
        }
      }
    };

    checkToken();
  }, [dispatch, user?.access]);
  return (
    <>
      <Router>
        <Nav />
        <Routes>
          {/* Guest Only */}
          <Route path="/" element={<GuestOnlyRoute><HomePage /></GuestOnlyRoute>} />
          <Route path="/login" element={<GuestOnlyRoute><LoginPage /></GuestOnlyRoute>} />
          <Route path="/register" element={<GuestOnlyRoute><RegisterPage /></GuestOnlyRoute>} />
          <Route path="/reset-password" element={<GuestOnlyRoute><ResetPasswordPage /></GuestOnlyRoute>} />
          <Route path="/password/reset/confirm/:uid/:token" element={<GuestOnlyRoute><ResetPasswordPageConfirm /></GuestOnlyRoute>} />

          {/* Public (only activation link) */}
          <Route path="/activate/:uid/:token" element={<ActivatePage />} />

          {/* Authenticated Only */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/lists/:id" element={<PrivateRoute><TodoListPage /></PrivateRoute>} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
      <ToastContainer />
    </>
  );
}

export default App;
