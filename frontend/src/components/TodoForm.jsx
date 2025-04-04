import React, { useEffect, useState } from 'react'
import axios from 'axios'


const TodoForm = ({ setTodos, fetchData }) => {

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
        try {
            await axios.post(`http://127.0.0.1:8000/api/todo/`, newTodo)
            setNewTodo({ 'body': '' })
            setTodos(prevTodos => [...prevTodos, newTodo])
            fetchData()
        } catch (error) {
            console.log(error);
        }
    }

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