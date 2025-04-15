// src/__tests__/components/Table.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Table from '../../components/Table';
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

const mockTodos = [
  {
    id: 1,
    body: 'Test Todo 1',
    completed: false,
    created: '2024-04-10T12:00:00Z',
  },
  {
    id: 2,
    body: 'Test Todo 2',
    completed: true,
    created: '2024-04-11T12:00:00Z',
  },
];

class MockWebSocket {
    constructor(url) {
      this.url = url;
      this.readyState = MockWebSocket.OPEN;
      this.send = vi.fn();
      this.close = vi.fn();
    }
  
    static OPEN = 1;
  
    addEventListener() {}
    removeEventListener() {}
  }
  
  global.WebSocket = MockWebSocket;
  

describe('Table component', () => {
  beforeEach(() => {
    useSelector.mockImplementation((selector) =>
      selector({ auth: { user: mockUser } })
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('renders loading state', () => {
    render(<Table todos={[]} isLoading={true} setTodos={vi.fn()} />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('renders no todos message', () => {
    render(<Table todos={[]} isLoading={false} setTodos={vi.fn()} />);
    expect(screen.getByText(/no todos found/i)).toBeInTheDocument();
  });

  test('renders todos with correct info', () => {
    render(<Table todos={mockTodos} isLoading={false} setTodos={vi.fn()} />);
    expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  test('deletes a todo and sends websocket message', async () => {
    const setTodosMock = vi.fn();
    const socket = new MockWebSocket('ws://localhost:8000/ws/todo/1/');
  
    axios.delete.mockResolvedValue({});
  
    render(
      <Table
        todos={mockTodos}
        isLoading={false}
        setTodos={setTodosMock}
        permission="edit"
        socket={socket}
      />
    );
  
    const deleteButton = screen.getByTestId('delete-button-1');
    fireEvent.click(deleteButton);
  
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        'http://localhost:8000/api/items/1/',
        expect.any(Object)
      );
      expect(setTodosMock).toHaveBeenCalled();
      expect(socket.send).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'todo_deleted',
          todo_id: 1,
        })
      );
    });
  });
  

  test('edits a todo and sends websocket message', async () => {
    const setTodosMock = vi.fn();
    const socket = new MockWebSocket('ws://localhost:8000/ws/todo/1/');
    const updatedTodo = { ...mockTodos[0], body: 'Updated Todo' };
  
    axios.patch.mockResolvedValue({ data: updatedTodo });
  
    render(
      <Table
        todos={mockTodos}
        isLoading={false}
        setTodos={setTodosMock}
        permission="edit"
        socket={socket}
      />
    );
  
    const editButton = screen.getByTestId('edit-button-1');
    fireEvent.click(editButton);
  
    const input = screen.getByDisplayValue('Test Todo 1');
    fireEvent.change(input, { target: { value: 'Updated Todo' } });
  
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
  
    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith(
        'http://localhost:8000/api/items/1/',
        { body: 'Updated Todo' },
        expect.any(Object)
      );
      expect(setTodosMock).toHaveBeenCalled();
      expect(socket.send).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'todo_updated',
          todo: updatedTodo,
        })
      );
    });
  });
  

  test('toggles checkbox and sends websocket message', async () => {
    const setTodosMock = vi.fn();
    const socket = new MockWebSocket('ws://localhost:8000/ws/todo/1/');
    const updatedTodo = { ...mockTodos[0], completed: true };
  
    axios.patch.mockResolvedValue({ data: updatedTodo });
  
    render(
      <Table
        todos={[mockTodos[0]]}
        isLoading={false}
        setTodos={setTodosMock}
        permission="edit"
        socket={socket}
      />
    );
  
    const checkboxButton = screen.getByTestId('checkbox-button-1');
    fireEvent.click(checkboxButton);
  
    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith(
        'http://localhost:8000/api/items/1/',
        { completed: true },
        expect.any(Object)
      );
      expect(setTodosMock).toHaveBeenCalled();
      expect(socket.send).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'todo_updated',
          todo: updatedTodo,
        })
      );
    });
  });
  

  test('does not show delete button when permission is view', () => {
    render(
      <Table
        todos={mockTodos}
        isLoading={false}
        setTodos={vi.fn()}
        permission="view"
      />
    );
  
    expect(screen.queryByTestId('delete-button-1')).not.toBeInTheDocument();
  });
    
  test('does not show edit button when permission is view', () => {
    render(
      <Table
        todos={mockTodos}
        isLoading={false}
        setTodos={vi.fn()}
        permission="view"
      />
    );
  
    expect(screen.queryByTestId('edit-button-1')).not.toBeInTheDocument();
  });

  test('checkbox button is disabled when permission is view', () => {
    render(
      <Table
        todos={[mockTodos[0]]}
        isLoading={false}
        setTodos={vi.fn()}
        permission="view"
      />
    );
  
    const checkboxButton = screen.getByTestId('checkbox-button-1');
    expect(checkboxButton).toBeDisabled();
  });

  test('checkbox button has correct disabled style when permission is view', () => {
    render(
      <Table
        todos={[mockTodos[0]]}
        isLoading={false}
        setTodos={vi.fn()}
        permission="view"
      />
    );
  
    const checkboxButton = screen.getByTestId('checkbox-button-1');
    expect(checkboxButton).toHaveClass('opacity-50');
  });

  test('edit input is disabled when permission is view', () => {
    render(
      <Table
        todos={[mockTodos[0]]}
        isLoading={false}
        setTodos={vi.fn()}
        permission="view"
      />
    );
  
    // Simulate edit mode manually
    const { container } = render(
      <Table
        todos={[mockTodos[0]]}
        isLoading={false}
        setTodos={vi.fn()}
        permission="view"
      />
    );
  });
  
});
