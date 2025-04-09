import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { useSelector } from 'react-redux';
import TodoForm from '../components/TodoForm';
import Table from '../components/Table';
import toast from 'react-hot-toast'; // Make sure you're using react-hot-toast
import ShareListModal from "../components/ShareListModal";
import { useLocation } from 'react-router-dom';

const TodoListPage = () => {
  const { id } = useParams();
  const { user } = useSelector(state => state.auth);
  const location = useLocation();
  const [permission, setPermission] = useState('edit'); // default is edit (owner)
  const [isOwner, setIsOwner] = useState(false);
  const [listTitle, setListTitle] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [todos, setTodos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShare, setShowShare] = useState(false); // for future modal
  

  useEffect(() => {
    if (!user) return;
  
    const config = {
      headers: { Authorization: `Bearer ${user.access}` },
    };
  
    const fetchListAndTodos = async () => {
      try {
        const [listRes, todosRes, permRes] = await Promise.all([
          axiosInstance.get(`lists/${id}/`, config),
          axiosInstance.get(`items/?todo_list=${id}`, config),
          axiosInstance.get(`lists/${id}/permission/`, config)
        ]);
  
        setListTitle(listRes.data.title);
        setOriginalTitle(listRes.data.title);
        setTodos(todosRes.data);
        setPermission(permRes.data.permission || 'edit');
        setIsOwner(permRes.data.is_owner || false);
        setIsLoading(false);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        if (err.response?.status === 404) {
          setError('This list was not found.');
        } else {
          setError('Something went wrong while loading the list.');
        }
        setIsLoading(false);
      }
    };
  
    fetchListAndTodos();
  }, [id, user]);

  const handleTitleUpdate = async () => {
    if (!listTitle.trim() || listTitle === originalTitle) return;

    try {
      const config = {
        headers: { Authorization: `Bearer ${user.access}` },
      };
      await axiosInstance.patch(`lists/${id}/`, { title: listTitle }, config);
      setOriginalTitle(listTitle);
      toast.success('Title updated');
    } catch (err) {
      console.error('Failed to update title:', err);
      toast.error('Failed to update title');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur(); // triggers onBlur
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Title + Share Button */}
      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          value={listTitle}
          onChange={(e) => setListTitle(e.target.value)}
          onBlur={handleTitleUpdate}
          onKeyDown={handleKeyDown}
          disabled={isLoading || permission === 'view'}
          className="input input-bordered text-2xl font-bold w-full mr-4"
          placeholder="Untitled List"
        />
        {isOwner && (
          <button className="btn btn-outline" onClick={() => setShowShare(true)}>
            Share
          </button>
        )}
        {permission === 'view' && (
          <div className="mb-4 text-sm text-gray-500 italic text-right">
            View-only access
          </div>
        )}
      </div>

      {/* Placeholder Share Modal */}
      {/* Real Share Modal */}
      {isOwner && (
        <ShareListModal
          listId={id}
          isOpen={showShare}
          onClose={() => setShowShare(false)}
        />
      )}

      {/* Todo Creation Form */}
      {permission !== 'view' && (
        <TodoForm listId={id} setTodos={setTodos} />
      )}

      {/* Todos Display */}
      {error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : isLoading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : todos.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          No todos yet. Add one using the form above.
        </div>
      ) : (
        <Table todos={todos} setTodos={setTodos} permission={permission} />
      )}
    </div>
  );
};

export default TodoListPage;
