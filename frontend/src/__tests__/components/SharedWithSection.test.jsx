import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import SharedWithSection from '../../components/SharedWithSection';
import { vi } from 'vitest';
import axios from '../../axiosConfig';
import { toast } from 'react-hot-toast';

// Mocks
vi.mock('../../axiosConfig');
vi.mock('react-hot-toast', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('SharedWithSection', () => {
  const token = 'test-token';
  const listId = 1;
  const sharedUsersMock = [
    {
      id: 101,
      shared_with_first_name: 'John',
      shared_with_last_name: 'Doe',
      permission: 'view',
    },
    {
      id: 102,
      shared_with_first_name: 'Jane',
      shared_with_last_name: 'Smith',
      permission: 'edit',
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should not render if not owner', async () => {
    render(
      <SharedWithSection listId={listId} token={token} isOwner={false} />
    );
    expect(screen.queryByText('Shared With')).not.toBeInTheDocument();
  });

  it('renders loading state', () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    render(<SharedWithSection listId={listId} token={token} isOwner={true} />);
    expect(screen.getByText(/loading shared users/i)).toBeInTheDocument();
  });

  it('shows message if no users shared', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    render(<SharedWithSection listId={listId} token={token} isOwner={true} />);

    await waitFor(() => {
      expect(screen.getByText(/not shared with anyone/i)).toBeInTheDocument();
    });
  });

  it('renders shared users with correct info', async () => {
    axios.get.mockResolvedValueOnce({ data: sharedUsersMock });
  
    render(<SharedWithSection listId={listId} token={token} isOwner={true} />);
  
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  
      const selects = screen.getAllByRole('combobox');
      expect(selects).toHaveLength(2);
      expect(selects[0].value).toBe('view');
      expect(selects[1].value).toBe('edit');
    });  
  });

  it('updates permission when changed', async () => {
    axios.get.mockResolvedValueOnce({ data: sharedUsersMock });
    axios.patch.mockResolvedValueOnce({});
    axios.get.mockResolvedValueOnce({ data: sharedUsersMock }); // re-fetch

    render(<SharedWithSection listId={listId} token={token} isOwner={true} />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const select = screen.getAllByRole('combobox')[0];
    fireEvent.change(select, { target: { value: 'edit' } });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Permission updated');
    });

    expect(axios.patch).toHaveBeenCalledWith(
      '/shared-todolists/101/',
      { permission: 'edit' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  });

  it('handles permission update failure', async () => {
    axios.get.mockResolvedValueOnce({ data: sharedUsersMock });
    axios.patch.mockRejectedValueOnce(new Error('fail'));

    render(<SharedWithSection listId={listId} token={token} isOwner={true} />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const select = screen.getAllByRole('combobox')[0];
    fireEvent.change(select, { target: { value: 'edit' } });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to update permission.');
    });
  });

  it('calls unshare and refreshes list', async () => {
    window.confirm = vi.fn(() => true);
    axios.get.mockResolvedValueOnce({ data: sharedUsersMock });
    axios.delete.mockResolvedValueOnce({});
    axios.get.mockResolvedValueOnce({ data: [] });

    render(<SharedWithSection listId={listId} token={token} isOwner={true} />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const deleteBtn = screen.getAllByRole('button')[0];
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        '/shared-todolists/101/',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      expect(toast.success).toHaveBeenCalledWith('User unshared');
    });
  });

  it('does not call unshare if cancelled', async () => {
    window.confirm = vi.fn(() => false);
    axios.get.mockResolvedValueOnce({ data: sharedUsersMock });

    render(<SharedWithSection listId={listId} token={token} isOwner={true} />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const deleteBtn = screen.getAllByRole('button')[0];
    fireEvent.click(deleteBtn);

    expect(axios.delete).not.toHaveBeenCalled();
  });
});
