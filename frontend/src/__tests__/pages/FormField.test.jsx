// __tests__/pages/FormField.test.jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FormField from '../../pages/FormField'

describe('FormField', () => {
  it('renders with given props', () => {
    render(
      <FormField
        type="text"
        placeholder="Enter name"
        name="username"
        value="John"
        onChange={() => {}}
      />
    )

    const input = screen.getByPlaceholderText('Enter name')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'text')
    expect(input).toHaveAttribute('name', 'username')
    expect(input).toHaveValue('John')
  })

  it('calls onChange when input value changes', () => {
    const handleChange = vi.fn()

    render(
      <FormField
        type="email"
        placeholder="Enter email"
        name="email"
        value=""
        onChange={handleChange}
      />
    )

    const input = screen.getByPlaceholderText('Enter email')
    fireEvent.change(input, { target: { value: 'test@example.com' } })

    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('respects required prop', () => {
    render(
      <FormField
        type="password"
        placeholder="Enter password"
        name="password"
        value=""
        onChange={() => {}}
        required={false}
      />
    )

    const input = screen.getByPlaceholderText('Enter password')
    expect(input).not.toBeRequired()
  })

  it('applies custom className to wrapper div', () => {
    const { container } = render(
      <FormField
        placeholder="Enter something"
        name="custom"
        value=""
        onChange={() => {}}
        className="my-custom-class"
      />
    )

    const wrapper = container.firstChild
    expect(wrapper).toHaveClass('form-control')
    expect(wrapper).toHaveClass('my-custom-class')
  })
})
