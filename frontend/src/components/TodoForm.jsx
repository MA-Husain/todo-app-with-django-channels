// frontend/src/components/TodoForm.jsx
import { useState } from "react";
import axios from '../axiosConfig';
import { useSelector } from "react-redux";

const TodoForm = ({ listId, setTodos }) => {
  const { user } = useSelector((state) => state.auth);
  const [body, setBody] = useState("");

  const handleSubmit = async () => {
    if (!body.trim()) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.access}`,
          "Content-Type": "application/json",
        },
      };

      const response = await axios.post(
        "http://localhost:8000/api/items/",
        { body, todo_list: listId }, // ✅ important: todo_list key
        config
      );

      setTodos((prev) => [...prev, response.data]); // ✅ update UI instantly
      setBody(""); // clear input
    } catch (err) {
      console.error("Failed to add todo:", err.response?.data || err);
    }
  };

  return (
    <div className="flex justify-center mb-6">
      <input
        type="text"
        placeholder="Add a new task"
        value={body}
        className="input input-bordered w-full max-w-md mr-4"
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
        }}
      />
      <button onClick={handleSubmit} className="btn btn-primary">
        Add
      </button>
    </div>
  );
};

export default TodoForm;
