import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TodoForm from '../../components/TodoForm';
import { vi } from 'vitest';
import axios from '../../axiosConfig';
import { useSelector } from 'react-redux';

// Mock react-redux
vi.mock('react-redux', () => ({
  useSelector: vi.fn(),
}));

// Mock axios
vi.mock('../../axiosConfig');

const mockUser = {
  access: 'mockAccessToken',
};

describe('TodoForm component', () => {
  const listId = 123;

  beforeEach(() => {
    useSelector.mockImplementation((selector) =>
      selector({ auth: { user: mockUser } })
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('renders input and button', () => {
    render(<TodoForm listId={listId} />);

    expect(screen.getByPlaceholderText(/add a new task/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });

  test('does not call API if input is empty', async () => {
    render(<TodoForm listId={listId} />);
    const addButton = screen.getByRole('button', { name: /add/i });

    fireEvent.click(addButton);

    await waitFor(() => {
      expect(axios.post).not.toHaveBeenCalled();
    });
  });

  test('calls API on submit with valid input', async () => {
    axios.post.mockResolvedValue({
      data: {
        id: 1,
        body: 'New Task',
        completed: false,
        created: new Date().toISOString(),
      },
    });

    render(<TodoForm listId={listId} />);

    const input = screen.getByPlaceholderText(/add a new task/i);
    fireEvent.change(input, { target: { value: 'New Task' } });

    const addButton = screen.getByRole('button', { name: /add/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:8000/api/items/',
        { body: 'New Task', todo_list: listId },
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockUser.access}`,
          }),
        })
      );
    });

    // Confirm input gets cleared
    expect(screen.getByPlaceholderText(/add a new task/i).value).toBe('');
  });

  test('sends WebSocket message when socket is open', async () => {
    const mockSend = vi.fn();
    const mockSocket = {
      readyState: WebSocket.OPEN,
      send: mockSend,
    };

    const newTodo = {
      id: 1,
      body: 'WebSocket Task',
      completed: false,
      created: new Date().toISOString(),
    };

    axios.post.mockResolvedValue({ data: newTodo });

    render(<TodoForm listId={listId} socket={mockSocket} />);

    const input = screen.getByPlaceholderText(/add a new task/i);
    fireEvent.change(input, { target: { value: 'WebSocket Task' } });

    const addButton = screen.getByRole('button', { name: /add/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockSend).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'todo_created',
          todo: newTodo,
        })
      );
    });
  });

  test('does not send WebSocket if socket is not open', async () => {
    const mockSend = vi.fn();
    const mockSocket = {
      readyState: WebSocket.CLOSED,
      send: mockSend,
    };

    const newTodo = {
      id: 1,
      body: 'WebSocket Closed',
      completed: false,
      created: new Date().toISOString(),
    };

    axios.post.mockResolvedValue({ data: newTodo });

    render(<TodoForm listId={listId} socket={mockSocket} />);

    const input = screen.getByPlaceholderText(/add a new task/i);
    fireEvent.change(input, { target: { value: 'WebSocket Closed' } });

    const addButton = screen.getByRole('button', { name: /add/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockSend).not.toHaveBeenCalled();
    });
  });

  test('submits on Enter key press', async () => {
    const newTodo = {
      id: 1,
      body: 'Enter key todo',
      completed: false,
      created: new Date().toISOString(),
    };

    axios.post.mockResolvedValue({ data: newTodo });

    render(<TodoForm listId={listId} />);

    const input = screen.getByPlaceholderText(/add a new task/i);
    fireEvent.change(input, { target: { value: 'Enter key todo' } });

    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });
  });
});
