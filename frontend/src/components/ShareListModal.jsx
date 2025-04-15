import React, { useState } from 'react';
import axios from '../axiosConfig';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

const ShareListModal = ({ listId, isOpen, onClose, onShareSuccess }) => {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('view');
  const [isLoading, setIsLoading] = useState(false);
  const { user, userInfo } = useSelector((state) => state.auth);
  const isSharingWithSelf = email.trim().toLowerCase() === userInfo?.email?.toLowerCase();
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !permission) {
      toast.error('Please fill in all fields');
      return;
    }

    if (isSharingWithSelf) {
      toast.error('You cannot share the list with yourself.');
      return;
    }

    setIsLoading(true);

    try {
      await axios.post(
        '/shared-todolists/',
        {
          todo_list: listId,
          shared_with_email: email,
          permission,
        },
        {
          headers: {
            Authorization: `Bearer ${user?.access}`,
          },
        }
      );

      toast.success('List shared successfully!');
      onShareSuccess?.(); // ✅ trigger refresh
      setEmail('');
      setPermission('view');
      onClose();
    } catch (error) {
      toast.error('Failed to share list. Check if the email is valid or already shared.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-base-100 text-base-content rounded-xl w-full max-w-md p-6 shadow-2xl transform transition-all scale-100">
        <h3 className="text-xl font-bold mb-4">Share This List</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">
              <span className="label-text">Email Address</span>
            </label>
            <input
              type="email"
              className="input input-bordered w-full"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Permission</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={permission}
              onChange={(e) => setPermission(e.target.value)}
            >
              <option value="view">View</option>
              <option value="edit">Edit</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || isSharingWithSelf || !email || !permission}
            >
              {isLoading ? 'Sharing...' : 'Share'}
            </button>
          </div>
          {isSharingWithSelf && (
            <p className="text-sm text-red-500 mt-1">
              You cannot share the list with yourself.
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default ShareListModal;
