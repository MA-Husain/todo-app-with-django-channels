import { describe, it, vi, beforeEach, afterEach, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DashboardPage from '../../pages/Dashboard';
import { MemoryRouter } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from '../../axiosConfig';

// Top-level mock navigate function
const navigate = vi.fn();

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigate,
  };
});

// Mock Redux
vi.mock('react-redux', () => ({
  useSelector: vi.fn(),
}));

// Mock axios
vi.mock('../../axiosConfig', () => {
  return {
    default: {
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
      put: vi.fn(),
    },
  };
});


describe('<DashboardPage />', () => {
  const mockUser = {
    access: 'mockAccessToken',
  };

  beforeEach(() => {
    useSelector.mockReturnValue({ user: mockUser });
  });

  afterEach(() => {
    vi.clearAllMocks();
    navigate.mockClear();
  });

  it('renders personal and shared todo lists', async () => {
    axios.get.mockImplementation((url) => {
      if (url === '/lists/') {
        return Promise.resolve({
          data: [{ id: 1, title: 'My List 1' }],
        });
      }
      if (url.startsWith('/shared-todolists/')) {
        return Promise.resolve({
          data: [
            {
              id: 101,
              list: { id: 5, title: 'Shared List A' },
              permission: 'view',
            },
          ],
        });
      }
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('My List 1')).toBeInTheDocument();
      expect(screen.getByText('Shared List A')).toBeInTheDocument();
      expect(screen.getByText('Permission: view')).toBeInTheDocument();
    });
  });

  it('shows empty state when no lists are returned', async () => {
    axios.get.mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/no lists yet/i)).toBeInTheDocument();
      expect(screen.getByText(/no shared lists yet/i)).toBeInTheDocument();
    });
  });

  it('creates a new list when "+ New List" is clicked', async () => {
    const newList = { id: 99, title: 'Untitled List' };
  
    axios.get.mockResolvedValue({ data: [] });
    axios.post.mockResolvedValue({ data: newList });
  
    useSelector.mockReturnValue({ user: mockUser });
  
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );
  
    const createButton = screen.getByText('+ New List');
    fireEvent.click(createButton);
  
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/lists/',
        { title: 'Untitled List' },
        expect.objectContaining({
          headers: { Authorization: 'Bearer mockAccessToken' },
        })
      );
      expect(navigate).toHaveBeenCalledWith('/lists/99');
    });
  });

  it('deletes a list when delete icon is clicked and confirmed', async () => {
    axios.get.mockImplementation((url) => {
      if (url === '/lists/') {
        return Promise.resolve({
          data: [{ id: 1, title: 'My List 1' }],
        });
      }
      if (url.startsWith('/shared-todolists/')) {
        return Promise.resolve({ data: [] });
      }
    });

    axios.delete.mockResolvedValue({});

    // Mock confirm to always return true
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('My List 1')).toBeInTheDocument();
    });

    const deleteButton = screen.getByTitle('Delete');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        '/lists/1/',
        expect.objectContaining({
          headers: { Authorization: 'Bearer mockAccessToken' },
        })
      );
    });
  });

  it('does not delete if confirm is cancelled', async () => {
    axios.get.mockResolvedValue({ data: [{ id: 2, title: 'Another List' }] });

    vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Another List')).toBeInTheDocument();
    });

    const deleteButton = screen.getByTitle('Delete');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(axios.delete).not.toHaveBeenCalled();
    });
  });
});
