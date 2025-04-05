import axios from 'axios'
import React, { useState } from 'react'
import {
  MdOutlineDeleteOutline,
  MdEditNote,
  MdOutlineCheckBox,
  MdOutlineCheckBoxOutlineBlank,
} from 'react-icons/md'

import { useSelector } from 'react-redux';

const Table = ({ todos, isLoading, setTodos }) => {
  const { user } = useSelector((state) => state.auth);
  const config = {
    headers: {
      Authorization: `Bearer ${user.access}`
    }
  };
  const [editText, setEditText] = useState({ id: null, body: '' })

  const handleDelete = async (id) => {
    try {
      
      await axios.delete(`http://127.0.0.1:8000/api/todo/${id}/`, config)
      const newList = todos.filter((todo) => todo.id !== id)
      setTodos(newList)
    } catch (error) {
      console.log(error)
    }
  }

  const handleEdit = async (id, value) => {
    try {
      const response = await axios.patch(
        `http://127.0.0.1:8000/api/todo/${id}/`,
        value,
        config
      )
      const newTodos = todos.map((todo) =>
        todo.id === id ? response.data : todo
      )
      setTodos(newTodos)
    } catch (error) {
      console.log(error)
    }
  }

  const handleChange = (e) => {
    setEditText((prev) => ({
      ...prev,
      body: e.target.value,
    }))
  }

  const handleClick = () => {
    handleEdit(editText.id, { body: editText.body })
    setEditText({ id: null, body: '' })
  }

  const handleCheckbox = (id, currentStatus) => {
    handleEdit(id, {
      completed: !currentStatus,
    })
  }

  return (
    <div className='flex justify-center mt-10 overflow-x-auto'>
      <table className='w-11/12 max-w-4xl table-auto'>
        <thead className='border-b-2 border-black'>
          <tr>
            <th className='p-3 text-sm font-semibold tracking-wide text-left'>Checkbox</th>
            <th className='p-3 text-sm font-semibold tracking-wide text-left'>To Do</th>
            <th className='p-3 text-sm font-semibold tracking-wide text-left'>Status</th>
            <th className='p-3 text-sm font-semibold tracking-wide text-left'>Date Created</th>
            <th className='p-3 text-sm font-semibold tracking-wide text-left'>Actions</th>
          </tr>
        </thead>

        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan="5" className='text-center p-4'>Loading...</td>
            </tr>
          ) : todos.length === 0 ? (
            <tr>
              <td colSpan="5" className='text-center p-4'>No Todos Found</td>
            </tr>
          ) : (
            todos.map((todo) => (
              <tr key={todo.id} className='border-b'>
                <td className='p-3'>
                  <button onClick={() => handleCheckbox(todo.id, todo.completed)} className="cursor-pointer">
                    {todo.completed ? (
                      <MdOutlineCheckBox className='text-green-600' size={24} />
                    ) : (
                      <MdOutlineCheckBoxOutlineBlank size={24} />
                    )}
                  </button>
                </td>
                <td className='p-3'>
                  {editText.id === todo.id ? (
                    <input
                      type='text'
                      value={editText.body}
                      onChange={handleChange}
                      className='p-1 border rounded w-full'
                    />
                  ) : (
                    <span className={todo.completed ? 'line-through' : ''}>{todo.body}</span>
                  )}
                </td>
                <td className='p-3'>
                <span className={todo.completed ? 'text-green-600 font-semibold' : 'text-yellow-500 font-semibold'}>
                  {todo.completed ? 'Completed' : 'Pending'}
                </span>
                </td>
                <td className='p-3'>
                  {new Date(todo.created).toLocaleString()}
                </td>
                <td className='p-3 flex gap-3'>
                  {editText.id === todo.id ? (
                    <button
                      onClick={handleClick}
                      className='btn btn-sm btn-primary cursor-pointer'
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditText({ id: todo.id, body: todo.body })}
                      className='text-blue-500 cursor-pointer'
                    >
                      <MdEditNote size={24} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(todo.id)}
                    className='text-red-500 cursor-pointer'
                  >
                    <MdOutlineDeleteOutline size={24} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Table
