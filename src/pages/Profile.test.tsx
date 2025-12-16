import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Profile } from './Profile';

// Mock Redux hooks & API hooks
vi.mock('../shared/src/web', async () => {
  return {
    useAppSelector: vi.fn(),
    useGetGithubAuthUrlQuery: vi.fn(),
    useGetMicrosoftAuthUrlQuery: vi.fn(),
    useListRepositoriesQuery: vi.fn(),
    useListMicrosoftWebhooksQuery: vi.fn(),
  };
});

import {
  useAppSelector,
  useGetGithubAuthUrlQuery,
  useGetMicrosoftAuthUrlQuery,
  useListMicrosoftWebhooksQuery,
  useListRepositoriesQuery,
} from '../shared/src/web';

describe('Profile component', () => {
  const mockUser = { id: '123', name: 'Alice', email: 'alice@test.com' };
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default Redux state
    (useAppSelector as unknown as vi.Mock).mockImplementation((selector) =>
      selector({ auth: { user: mockUser } })
    );

    // Default API hooks
    (useGetGithubAuthUrlQuery as unknown as vi.Mock).mockReturnValue({
      refetch: mockRefetch,
    });
    (useGetMicrosoftAuthUrlQuery as unknown as vi.Mock).mockReturnValue({
      refetch: mockRefetch,
    });
    (useListRepositoriesQuery as unknown as vi.Mock).mockReturnValue({
      isLoading: false,
      isSuccess: false,
      isError: true,
    });
    (useListMicrosoftWebhooksQuery as unknown as vi.Mock).mockReturnValue({
      isLoading: false,
      isSuccess: false,
      isError: true,
    });
  });

  const renderProfile = () =>
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

  it('renders user info correctly', () => {
    renderProfile();

    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('ID:')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
    expect(screen.getByText('Name:')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Email:')).toBeInTheDocument();
    expect(screen.getByText('alice@test.com')).toBeInTheDocument();
  });

  it('renders GitHub and Microsoft buttons when services are not linked', () => {
    renderProfile();

    expect(screen.getByText('Link GitHub Account')).toBeInTheDocument();
    expect(screen.getByText('Link Microsoft Account')).toBeInTheDocument();
  });

  it('calls GitHub refetch and redirects on button click', async () => {
    const url = 'https://github.com/login/oauth/authorize';
    mockRefetch.mockResolvedValue({ data: { url } });

    renderProfile();

    const githubButton = screen.getByText('Link GitHub Account');

    // Mock window.location.href
    delete window.location;
    window.location = { href: '' } as any;

    await fireEvent.click(githubButton);

    expect(mockRefetch).toHaveBeenCalled();
    expect(window.location.href).toBe(url);
  });

  it('calls Microsoft refetch and redirects on button click', async () => {
    const url = 'https://login.microsoftonline.com/';
    mockRefetch.mockResolvedValue({ data: { url } });

    renderProfile();

    const msButton = screen.getByText('Link Microsoft Account');

    // Mock window.location.href
    delete window.location;
    window.location = { href: '' } as any;

    await fireEvent.click(msButton);

    expect(mockRefetch).toHaveBeenCalled();
    expect(window.location.href).toBe(url);
  });

  it('shows loading spinner when GitHub API is loading', () => {
    (useListRepositoriesQuery as unknown as vi.Mock).mockReturnValue({
      isLoading: true,
      isSuccess: false,
      isError: false,
    });

    renderProfile();

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows success message when GitHub account is linked', () => {
    (useListRepositoriesQuery as unknown as vi.Mock).mockReturnValue({
      isLoading: false,
      isSuccess: true,
      isError: false,
    });

    renderProfile();

    expect(screen.getByText('✓ GitHub Account Linked')).toBeInTheDocument();
    expect(screen.getByText('Change Account')).toBeInTheDocument();
  });

  it('shows success message when Microsoft account is linked', () => {
    (useListMicrosoftWebhooksQuery as unknown as vi.Mock).mockReturnValue({
      isLoading: false,
      isSuccess: true,
      isError: false,
    });

    renderProfile();

    expect(screen.getByText('✓ Microsoft Account Linked')).toBeInTheDocument();
    expect(screen.getByText('Change Account')).toBeInTheDocument();
  });
});
