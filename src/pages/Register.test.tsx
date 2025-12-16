import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Register } from './Register';

// Mock RTK Query hook
vi.mock('../shared/src/web', async () => ({
  useRegisterMutation: vi.fn(),
}));

import { useRegisterMutation } from '../shared/src/web';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Register Component', () => {
  const mockRegister = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRegisterMutation as unknown as vi.Mock).mockReturnValue([
      mockRegister,
      { isLoading: false },
    ]);
  });

  const renderRegister = () =>
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

  it('renders all input fields and submit button', () => {
    renderRegister();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Register' })
    ).toBeInTheDocument();
  });

  it('shows error if passwords do not match', async () => {
    renderRegister();

    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'Abcd123!' },
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'Xyz123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    const error = await screen.findByText('Passwords do not match.');
    expect(error).toBeInTheDocument();

    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('shows error if email is invalid', async () => {
    renderRegister();
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Alice' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'alice@invalid' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'Abcd123!' },
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'Abcd123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));
    expect(
      await screen.findByText('Please enter a valid email address.')
    ).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('shows error if password does not satisfy at least 4 criteria', async () => {
    renderRegister();
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Alice' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'alice@test.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'abc' },
    }); // weak
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'abc' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));
    expect(
      await screen.findByText('Password must satisfied at least 4 criteria.')
    ).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('calls register mutation and navigates on success', async () => {
    mockRegister.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ token: 'abc123' }),
    });

    renderRegister();
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Alice' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'alice@test.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'Abcd123!' },
    }); // strong password
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'Abcd123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: 'Alice',
        email: 'alice@test.com',
        password: 'Abcd123!',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows API error message when registration fails', async () => {
    const error = { data: { message: 'Email already exists' } };
    mockRegister.mockReturnValue({ unwrap: vi.fn().mockRejectedValue(error) });

    renderRegister();
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Alice' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'alice@test.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'Abcd123!' },
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'Abcd123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    expect(await screen.findByText('Email already exists')).toBeInTheDocument();
  });

  it('disables submit button when isLoading is true', () => {
    (useRegisterMutation as unknown as vi.Mock).mockReturnValue([
      mockRegister,
      { isLoading: true },
    ]);
    renderRegister();
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Registering...');
  });
});
