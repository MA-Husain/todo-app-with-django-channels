import axios from '../axiosConfig';
import React, { useState } from 'react';
import {
  MdOutlineDeleteOutline,
  MdEditNote,
  MdOutlineCheckBox,
  MdOutlineCheckBoxOutlineBlank,
} from 'react-icons/md';
import { useSelector } from 'react-redux';

const Table = ({ todos, isLoading, setTodos, permission = 'edit', socket }) => {
  const { user } = useSelector((state) => state.auth);
  const config = {
    headers: {
      Authorization: `Bearer ${user.access}`,
    },
  };

  const [editText, setEditText] = useState({ id: null, body: '' });

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/items/${id}/`, config);
      const newList = todos.filter((todo) => todo.id !== id);
      setTodos(newList);

      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "todo_deleted",
            todo_id: id,
          })
        );
      }
    } catch (error) {}
  };

  const handleEdit = async (id, value) => {
    try {
      const response = await axios.patch(
        `http://localhost:8000/api/items/${id}/`,
        value,
        config
      );

      const newTodos = todos.map((todo) =>
        todo.id === id ? response.data : todo
      );
      setTodos(newTodos);

      // 🔁 Send WebSocket message
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "todo_updated",
            todo: response.data,
          })
        );
      }
    } catch (error) {}
  };

  const handleChange = (e) => {
    setEditText((prev) => ({
      ...prev,
      body: e.target.value,
    }));
  };

  const handleClick = () => {
    handleEdit(editText.id, { body: editText.body });
    setEditText({ id: null, body: '' });
  };

  const handleCheckbox = (id, currentStatus) => {
    handleEdit(id, { completed: !currentStatus });
  };

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
                  <button
                    data-testid={`checkbox-button-${todo.id}`}
                    onClick={() => permission !== 'view' && handleCheckbox(todo.id, todo.completed)}
                    className={permission === 'view' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                    disabled={permission === 'view'}
                  >
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
                      disabled={permission === 'view'}
                    />
                  ) : (
                    <span className={todo.completed ? 'line-through' : ''}>
                      {todo.body}
                    </span>
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
                  {permission !== 'view' && editText.id === todo.id ? (
                    <button
                      onClick={handleClick}
                      className='btn btn-sm btn-primary cursor-pointer'
                    >
                      Save
                    </button>
                  ) : permission !== 'view' ? (
                    <button
                      data-testid={`edit-button-${todo.id}`}
                      onClick={() => setEditText({ id: todo.id, body: todo.body })}
                      className='text-blue-500 cursor-pointer'
                    >
                      <MdEditNote size={24} />
                    </button>
                  ) : null}

                  {permission !== 'view' && (
                    <button
                      data-testid={`delete-button-${todo.id}`}
                      onClick={() => handleDelete(todo.id)}
                      className='text-red-500 cursor-pointer'
                    >
                      <MdOutlineDeleteOutline size={24} />
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
