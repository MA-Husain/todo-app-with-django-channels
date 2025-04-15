import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { vi } from 'vitest';
import configureStore from 'redux-mock-store';
import TodoListPage from '../../pages/TodoListPage';
import axiosInstance from '../../axiosConfig';
import * as redux from 'react-redux';

// Mocks
vi.mock('../../axiosConfig');
vi.mock('../../components/TodoForm', () => ({
default: () => <div data-testid="todo-form">MockTodoForm</div>,
}));

vi.mock('../../components/Table', () => ({
default: () => <div data-testid="todo-table">MockTable</div>,
}));

vi.mock('../../components/ShareListModal', () => ({
default: () => <div data-testid="share-modal">MockShareModal</div>,
}));

vi.mock('../../components/SharedWithSection', () => ({
default: () => <div data-testid="shared-section">MockSharedWithSection</div>,
}));
  
// WebSocket mock
class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.onopen = () => {};
    this.onmessage = () => {};
    this.onerror = () => {};
    this.onclose = () => {};
    setTimeout(() => this.onopen(), 10);
  }
  send() {}
  close() {
    this.onclose({ reason: 'Closed by test' });
  }
}
global.WebSocket = MockWebSocket;

// Mock store setup
const mockStore = configureStore([]);
const renderWithProviders = (ui, store, route = '/lists/1') => {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/lists/:id" element={ui} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
};

describe('TodoListPage', () => {
  const mockUser = {
    access: 'mock-access-token',
  };

  const store = mockStore({
    auth: {
      user: mockUser,
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: { title: 'Test List' } });
    axiosInstance.get.mockResolvedValueOnce({ data: [] }); // todos
    axiosInstance.get.mockResolvedValueOnce({ data: { permission: 'edit', is_owner: true } });

    renderWithProviders(<TodoListPage />, store);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByDisplayValue('Test List')).toBeInTheDocument());
  });

  it('shows error message if list not found', async () => {
    axiosInstance.get.mockRejectedValueOnce({ response: { status: 404 } });

    renderWithProviders(<TodoListPage />, store);

    await waitFor(() => {
      expect(screen.getByText(/this list was not found/i)).toBeInTheDocument();
    });
  });

  it('shows error message on unknown error', async () => {
    axiosInstance.get.mockRejectedValueOnce(new Error('Something went wrong'));

    renderWithProviders(<TodoListPage />, store);

    await waitFor(() => {
      expect(screen.getByText(/something went wrong while loading/i)).toBeInTheDocument();
    });
  });

  it('renders todos when fetched', async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: { title: 'My Tasks' } }); // list
    axiosInstance.get.mockResolvedValueOnce({ data: [{ id: 1, text: 'First Todo' }] }); // todos
    axiosInstance.get.mockResolvedValueOnce({ data: { permission: 'edit', is_owner: true } }); // permission

    renderWithProviders(<TodoListPage />, store);

    await waitFor(() => {
      expect(screen.getByDisplayValue('My Tasks')).toBeInTheDocument();
      expect(screen.getByTestId('todo-table')).toBeInTheDocument();
      expect(screen.getByTestId('todo-form')).toBeInTheDocument();
      expect(screen.getByTestId('shared-section')).toBeInTheDocument();
    });
  });

  it('disables input if user has view-only permission', async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: { title: 'Read Only List' } });
    axiosInstance.get.mockResolvedValueOnce({ data: [] }); // todos
    axiosInstance.get.mockResolvedValueOnce({ data: { permission: 'view', is_owner: false } });

    renderWithProviders(<TodoListPage />, store);

    await waitFor(() => {
      const input = screen.getByDisplayValue('Read Only List');
      expect(input).toBeDisabled();
      expect(screen.queryByTestId('todo-form')).not.toBeInTheDocument();
    });
  });

  it('shows placeholder if no todos', async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: { title: 'Empty List' } });
    axiosInstance.get.mockResolvedValueOnce({ data: [] });
    axiosInstance.get.mockResolvedValueOnce({ data: { permission: 'edit', is_owner: true } });

    renderWithProviders(<TodoListPage />, store);

    await waitFor(() => {
      expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
    });
  });

  it('does not allow title update if unchanged or not owner', async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: { title: 'Original' } });
    axiosInstance.get.mockResolvedValueOnce({ data: [] });
    axiosInstance.get.mockResolvedValueOnce({ data: { permission: 'edit', is_owner: false } });

    renderWithProviders(<TodoListPage />, store);

    await waitFor(() => {
      const input = screen.getByDisplayValue('Original');
      expect(input).toBeDisabled(); // should be disabled due to not being owner
    });
  });

  it('calls API to update title on blur if changed', async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: { title: 'Old Title' } });
    axiosInstance.get.mockResolvedValueOnce({ data: [] });
    axiosInstance.get.mockResolvedValueOnce({ data: { permission: 'edit', is_owner: true } });

    axiosInstance.patch.mockResolvedValueOnce({});

    renderWithProviders(<TodoListPage />, store);

    await waitFor(() => {
      const input = screen.getByDisplayValue('Old Title');
      fireEvent.change(input, { target: { value: 'New Title' } });
      fireEvent.blur(input);
    });

    await waitFor(() => {
      expect(axiosInstance.patch).toHaveBeenCalledWith(
        'lists/1/',
        { title: 'New Title' },
        { headers: { Authorization: `Bearer ${mockUser.access}` } }
      );
    });
  });

  it('opens share modal when share button is clicked', async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: { title: 'Shareable List' } });
    axiosInstance.get.mockResolvedValueOnce({ data: [] });
    axiosInstance.get.mockResolvedValueOnce({ data: { permission: 'edit', is_owner: true } });

    renderWithProviders(<TodoListPage />, store);

    await waitFor(() => {
      const shareBtn = screen.getByRole('button', { name: /share/i });
      fireEvent.click(shareBtn);
      expect(screen.getByTestId('share-modal')).toBeInTheDocument();
    });
  });
});
