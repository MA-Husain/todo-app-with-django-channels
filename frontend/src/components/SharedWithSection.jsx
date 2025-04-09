import { useEffect, useState } from 'react';
import axios from '../axiosConfig';
import { toast } from 'react-hot-toast';
import { MdDelete } from 'react-icons/md';

const SharedWithSection = ({ listId, token, isOwner, refreshTrigger }) => {
  const [sharedUsers, setSharedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSharedUsers = async () => {
    try {
      const res = await axios.get(`/shared-todolists/?list_id=${listId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSharedUsers(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load shared users.');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = async (id, newPermission) => {
    try {
      await axios.patch(`/shared-todolists/${id}/`, { permission: newPermission }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Permission updated');
      fetchSharedUsers();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update permission.');
    }
  };

  const handleUnshare = async (id) => {
    if (!window.confirm('Unshare this user?')) return;

    try {
      await axios.delete(`/shared-todolists/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('User unshared');
      fetchSharedUsers();
    } catch (err) {
      console.error(err);
      toast.error('Failed to unshare user.');
    }
  };

  useEffect(() => {
    fetchSharedUsers();
  }, [listId, refreshTrigger]); // 👈 listen for the refreshTrigger

  if (!isOwner) return null;
  if (loading) return <p>Loading shared users...</p>;
  if (sharedUsers.length === 0)
    return <p className="mt-6 text-gray-500 italic">Not shared with anyone.</p>;

  return (
    <div className="mt-10">
      <h3 className="text-lg font-semibold mb-3">Shared With</h3>
      <ul className="space-y-2">
        {sharedUsers.map((share) => (
          <li
            key={share.id}
            className="flex justify-between items-center bg-base-200 p-3 rounded-md"
          >
            <div>
              <p className="font-medium">
                {share.shared_with_first_name} {share.shared_with_last_name}
              </p>
              <p className="text-sm text-gray-500">Permission: {share.permission}</p>
            </div>

            <div className="flex items-center gap-3">
              <select
                className="select select-sm select-bordered"
                value={share.permission}
                onChange={(e) => handlePermissionChange(share.id, e.target.value)}
              >
                <option value="view">View</option>
                <option value="edit">Edit</option>
              </select>
              <button
                className="btn btn-sm btn-outline btn-error"
                onClick={() => handleUnshare(share.id)}
              >
                <MdDelete size={18} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SharedWithSection;
