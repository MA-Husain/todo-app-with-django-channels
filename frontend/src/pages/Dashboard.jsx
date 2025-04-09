import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import { MdDelete } from 'react-icons/md';

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [lists, setLists] = useState([]);
  const [shared, setShared] = useState([]);

  useEffect(() => {
    if (!user) return;

    const config = {
      headers: { Authorization: `Bearer ${user.access}` },
    };

    const fetchLists = async () => {
      try {
        const res = await axios.get('/lists/', config);
        setLists(res.data);
      } catch (err) {
        console.error(err.response?.data || err.message);
      }
    };

    const fetchShared = async () => {
      try {
        const res = await axios.get('/shared-todolists/?shared_with_me=true', config);
        setShared(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchLists();
    fetchShared();
  }, [user]);

  const handleCreate = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.access}` },
      };
      const res = await axios.post('/lists/', { title: 'Untitled List' }, config);
      const newList = res.data;
      setLists((prev) => [...prev, newList]);
      navigate(`/lists/${newList.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation(); // ⛔ prevent card click from triggering
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.access}` },
      };
      await axios.delete(`/lists/${id}/`, config);
      setLists((prev) => prev.filter((list) => list.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
        <button className="btn btn-primary" onClick={handleCreate}>
          + New List
        </button>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">My ToDo Lists</h2>
        {lists.length === 0 ? (
          <p className="text-gray-500 mb-6">No lists yet. Create one!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {lists.map((list) => (
              <div
                key={list.id}
                onClick={() => navigate(`/lists/${list.id}`)}
                className="card bg-base-100 shadow-md hover:shadow-xl transition duration-200 cursor-pointer relative group"
              >
                <div className="card-body flex flex-row items-center justify-between">
                  <h2 className="card-title truncate">{list.title || 'Untitled List'}</h2>

                  <button
                    className="text-red-500 hover:text-red-700 z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm("Are you sure you want to delete this list?")) {
                        handleDelete(list.id, e);
                      }
                    }}
                    title="Delete"
                  >
                    <MdDelete size={22} />
                  </button>
                </div>
              </div>
            ))}

          </div>
        )}
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">Shared With Me</h2>
        {shared.length === 0 ? (
          <p className="text-gray-500">No shared lists yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {shared.map((list) => (
              <div
                key={list.id}
                onClick={() => navigate(`/lists/${list.list?.id}`)}

                className="card bg-base-200 shadow-md hover:shadow-xl transition duration-200 cursor-pointer"
              >
                <div className="card-body">
                <h2 className="card-title truncate">
                  {list.list?.title || 'Untitled Shared List'}
                </h2>
                  <p className="text-sm text-gray-500">Permission: {list.permission}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
