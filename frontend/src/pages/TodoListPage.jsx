import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { useSelector } from 'react-redux';
import TodoForm from '../components/TodoForm';
import Table from '../components/Table';
import toast from 'react-hot-toast';
import ShareListModal from '../components/ShareListModal';
import SharedWithSection from '../components/SharedWithSection';

const TodoListPage = () => {
  const { id } = useParams();
  const { user } = useSelector(state => state.auth);
  const location = useLocation();
  const [permission, setPermission] = useState('edit');
  const [isOwner, setIsOwner] = useState(false);
  const [listTitle, setListTitle] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [todos, setTodos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShare, setShowShare] = useState(false);
  const [shareRefreshTrigger, setShareRefreshTrigger] = useState(0);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user || !id) return;
  
    const config = {
      headers: { Authorization: `Bearer ${user.access}` },
    };
  
    const fetchListAndSetupWebSocket = async () => {
      try {
        const [listRes, todosRes, permRes] = await Promise.all([
          axiosInstance.get(`lists/${id}/`, config),
          axiosInstance.get(`items/?todo_list=${id}`, config),
          axiosInstance.get(`lists/${id}/permission/`, config),
        ]);
  
        setListTitle(listRes.data.title);
        setOriginalTitle(listRes.data.title);
        setTodos(todosRes.data);
        setPermission(permRes.data.permission || 'edit');
        setIsOwner(permRes.data.is_owner || false);
        setError(null);
        setIsLoading(false);
  
        // ✅ Setup WebSocket *after* permission is known
        const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const backendHost = import.meta.env.VITE_BACKEND_WS_URL || 'localhost:8000';
        const socketUrl = `${wsProtocol}://${backendHost}/ws/todo/${id}/?token=${user.access}`;
        const socketInstance = new WebSocket(socketUrl);
  
        socketInstance.onopen = () => {
          console.log('WebSocket connected ✅');
        };
  
        socketInstance.onmessage = (e) => {
          const data = JSON.parse(e.data);
          
          switch (data.type) {
            case 'todo_created':
              setTodos((prev) => {
                const exists = prev.some(todo => todo.id === data.todo.id);
                return exists ? prev : [...prev, data.todo];
              });
              break;

            case 'todo_updated':
              setTodos((prev) =>
                prev.map((todo) => (todo.id === data.todo.id ? data.todo : todo))
              );
              break;
            case 'todo_deleted':
              setTodos((prev) => prev.filter((todo) => todo.id !== data.todo_id));
              break;
            default:
              console.warn('Unknown message type:');
          }
        };
  
        socketInstance.onerror = (e) => {
          console.error('WebSocket error:');
        };
  
        socketInstance.onclose = (e) => {
          console.log('WebSocket closed:');
        };
  
        setSocket(socketInstance);
  
        return () => {
          socketInstance.close();
        };
  
      } catch (err) {
        
        setIsLoading(false);
        if (err.response?.status === 404) {
          setError('This list was not found.');
        } else {
          setError('Something went wrong while loading the list.');
        }
      }
    };
  
    fetchListAndSetupWebSocket();
  }, [id, user]);
  

  const handleTitleUpdate = async () => {
    if (!listTitle.trim() || listTitle === originalTitle || !isOwner) return;
  
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.access}` },
      };
      await axiosInstance.patch(`lists/${id}/`, { title: listTitle }, config);
      setOriginalTitle(listTitle);
      toast.success('Title updated');
    } catch (err) {
      
      toast.error('Failed to update title');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
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
          disabled={isLoading || permission === 'view' || !isOwner}
          className="input input-bordered text-2xl font-bold w-full mr-4"
          placeholder="Untitled List"
          title={!isOwner ? "Only the list owner can rename it" : ""}
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

      {/* Share Modal */}
      {isOwner && (
        <ShareListModal
          listId={id}
          isOpen={showShare}
          onClose={() => setShowShare(false)}
          onShareSuccess={() => setShareRefreshTrigger(prev => prev + 1)} // 🆕
        />
      )}

      {/* Todo Creation Form */}
      {permission !== 'view' && <TodoForm listId={id} setTodos={setTodos} socket={socket} />}

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
        <Table todos={todos} setTodos={setTodos} permission={permission} socket={socket} />   
      )}

      {/* Shared With Section */}
      {isOwner && <SharedWithSection listId={id} token={user.access} isOwner={isOwner} refreshTrigger={shareRefreshTrigger}/>}
    </div>
  );
};

export default TodoListPage;
