import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Table from '../components/Table';
import TodoForm from '../components/TodoForm';
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [todos, setTodos] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Prevent running fetch until we have a user
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.access}`
        }
      };
      const response = await axios.get('http://127.0.0.1:8000/api/todo/', config);
      setTodos(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  // 🛡️ While checking auth, don't render anything
  if (!user) {
    return <div className="text-center py-8 text-xl">Redirecting...</div>; // or a loading spinner
  }

  return (
    <div className='px-4 sm:px-8'>
      <h1 className="text-3xl md:text-5xl text-center pb-8">To Do List</h1>
      <TodoForm setTodos={setTodos} fetchData={fetchData} />
      <Table todos={todos} isLoading={isLoading} setTodos={setTodos} />
    </div>
  );
};

export default Dashboard;
