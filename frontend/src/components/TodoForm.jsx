import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useSelector } from 'react-redux';


const TodoForm = ({ setTodos, fetchData }) => {
    const { user } = useSelector((state) => state.auth);

    const [newTodo, setNewTodo] = useState({
        'body': ''
    })

    const handleChange = (e) => {
        setNewTodo(prev => ({
            ...prev,
            'body': e.target.value
        }))
    }

    const postTodo = async () => {
        if (!newTodo.body.trim()) return;
    
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.access}`,
                    "Content-Type": "application/json"
                }
            };
    
            const response = await axios.post(
                'http://127.0.0.1:8000/api/todo/',
                newTodo,
                config
            );
    
            setNewTodo({ body: '' });
            fetchData(); // fetch updated todos
        } catch (error) {
            console.error("Failed to post todo:", error.response?.data || error);
        }
    };
    

    // const handleKeyDown = (e) => {
    //     if (e.key === 'Enter') {
    //         postTodo();
    //     }
    // }



    return (
        <div className="flex justify-center w-full mt-10">
            <div className="flex items-center gap-4">
                <input
                    type="text"
                    placeholder="Add Todo"
                    value={newTodo.body}
                    className="input input-bordered input-info w-full sm:w-72"
                    onChange={handleChange}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            postTodo();
                        }
                    }}
                />
                <button
                    onClick={postTodo}
                    className="btn btn-primary"
                >
                    Add todo
                </button>
            </div>
        </div>
    )
}

export default TodoForm