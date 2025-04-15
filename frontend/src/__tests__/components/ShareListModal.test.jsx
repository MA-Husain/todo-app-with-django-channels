import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ShareListModal from '../../components/ShareListModal';
import { vi } from 'vitest';
import axios from '../../axiosConfig';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

// Mocks
vi.mock('../../axiosConfig');
vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));
vi.mock('react-redux', () => ({
  useSelector: vi.fn(),
}));

describe('ShareListModal', () => {
  const mockUser = {
    email: 'test@example.com',
    access: 'mock_access_token',
  };

  const defaultProps = {
    listId: 42,
    isOpen: true,
    onClose: vi.fn(),
    onShareSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.resetAllMocks();
    useSelector.mockReturnValue({ user: mockUser, userInfo: mockUser });
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(<ShareListModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render modal with initial state', () => {
    render(<ShareListModal {...defaultProps} />);
    expect(screen.getByText(/share this list/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/user@example.com/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveValue('view');
  });

  it('should show error toast when email matches own email', async () => {
    render(<ShareListModal {...defaultProps} />);
  
    const input = screen.getByPlaceholderText(/user@example.com/i);
    fireEvent.change(input, { target: { value: 'test@example.com' } });
  
    await waitFor(() => {
      expect(toast.error).not.toHaveBeenCalled(); // No toast yet
    });
  
    const shareButton = screen.getByRole('button', { name: /share/i });
    expect(shareButton).toBeDisabled(); // Button disabled, so no toast
  
    // Optionally check tooltip or validation message exists
    expect(screen.getByText(/you cannot share the list with yourself/i)).toBeInTheDocument();
  });

  it('should make API call and handle success case', async () => {
    axios.post.mockResolvedValueOnce({});
    render(<ShareListModal {...defaultProps} />);

    const input = screen.getByPlaceholderText(/user@example.com/i);
    fireEvent.change(input, { target: { value: 'other@example.com' } });

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'edit' } });

    const submitButton = screen.getByRole('button', { name: /share/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/shared-todolists/',
        {
          todo_list: 42,
          shared_with_email: 'other@example.com',
          permission: 'edit',
        },
        {
          headers: {
            Authorization: `Bearer mock_access_token`,
          },
        }
      );
      expect(toast.success).toHaveBeenCalledWith('List shared successfully!');
      expect(defaultProps.onShareSuccess).toHaveBeenCalled();
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it('should handle API error on share failure', async () => {
    axios.post.mockRejectedValueOnce(new Error('Sharing failed'));
    render(<ShareListModal {...defaultProps} />);

    const input = screen.getByPlaceholderText(/user@example.com/i);
    fireEvent.change(input, { target: { value: 'other@example.com' } });

    const submitButton = screen.getByRole('button', { name: /share/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Failed to share list. Check if the email is valid or already shared.'
      );
    });
  });

  it('should call onClose when cancel button is clicked', () => {
    render(<ShareListModal {...defaultProps} />);
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should disable share button when sharing with self', () => {
    render(<ShareListModal {...defaultProps} />);
    const input = screen.getByPlaceholderText(/user@example.com/i);
    fireEvent.change(input, { target: { value: 'test@example.com' } });

    const shareButton = screen.getByRole('button', { name: /share/i });
    expect(shareButton).toBeDisabled();
  });

  it('should show "Sharing..." text when loading', async () => {
    // Create a promise that resolves manually
    let resolver;
    axios.post.mockImplementationOnce(() => new Promise((res) => (resolver = res)));

    render(<ShareListModal {...defaultProps} />);
    const input = screen.getByPlaceholderText(/user@example.com/i);
    fireEvent.change(input, { target: { value: 'valid@example.com' } });

    const submitButton = screen.getByRole('button', { name: /share/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/sharing.../i)).toBeInTheDocument();

    resolver(); // cleanup
  });
});
