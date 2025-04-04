import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Table from '../components/Table';
import TodoForm from '../components/TodoForm';

const Dashboard = () => {
    const { userInfo } = useSelector((state) => state.auth);
    
    const [todos, setTodos] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/todo');
            setTodos(response.data);
            setIsLoading(false);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <div className='px-4 sm:px-8'>
                <h1 className="text-3xl md:text-5xl text-center pb-8">To Do List of {userInfo.first_name}</h1>
                
                <TodoForm setTodos={setTodos} fetchData={fetchData} />
                <Table todos={todos} isLoading={isLoading} setTodos={setTodos} />
            </div>
        </div>
    );
};

export default Dashboard;
