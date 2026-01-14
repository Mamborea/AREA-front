import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import { Profile } from './Profile';

// Mock Redux hooks & API hooks
vi.mock('../shared/src/web', async () => {
  return {
    useAppSelector: vi.fn(),
    useGetGithubAuthUrlQuery: vi.fn(),
    useGetMicrosoftAuthUrlQuery: vi.fn(),
    useGetGmailAuthUrlQuery: vi.fn(),
    useGetDiscordAuthUrlQuery: vi.fn(),
    useGetServicesQuery: vi.fn(),
    useConnectionQuery: vi.fn(),
  };
});

import {
  useAppSelector,
  useGetGithubAuthUrlQuery,
  useGetMicrosoftAuthUrlQuery,
  useGetGmailAuthUrlQuery,
  useGetDiscordAuthUrlQuery,
  useGetServicesQuery,
  useConnectionQuery,
} from '../shared/src/web';

describe('Profile component', () => {
  const mockUser = { id: '123', name: 'Alice', email: 'alice@test.com' };
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default Redux state
    (useAppSelector as unknown as Mock).mockImplementation((selector) =>
      selector({ auth: { user: mockUser } })
    );

    // Default services query
    (useGetServicesQuery as unknown as Mock).mockReturnValue({
      data: {
        server: {
          services: [
            { name: 'github', actions: [], reactions: [] },
            { name: 'microsoft', actions: [], reactions: [] },
          ],
        },
      },
    });

    // Default API hooks
    (useGetGithubAuthUrlQuery as unknown as Mock).mockReturnValue({
      refetch: mockRefetch,
    });
    (useGetMicrosoftAuthUrlQuery as unknown as Mock).mockReturnValue({
      refetch: mockRefetch,
    });
    (useGetGmailAuthUrlQuery as unknown as Mock).mockReturnValue({
      refetch: mockRefetch,
    });
    (useGetDiscordAuthUrlQuery as unknown as Mock).mockReturnValue({
      refetch: mockRefetch,
    });
    (useConnectionQuery as unknown as Mock).mockReturnValue({
      isLoading: false,
      data: { connected: false },
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
    delete (window as any).location;
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
    delete (window as any).location;
    window.location = { href: '' } as any;

    await fireEvent.click(msButton);

    expect(mockRefetch).toHaveBeenCalled();
    expect(window.location.href).toBe(url);
  });

  it('shows loading spinner when GitHub API is loading', () => {
    (useConnectionQuery as unknown as Mock).mockReturnValue({
      isLoading: true,
      data: { connected: false },
    });

    renderProfile();

    const loadingElements = screen.getAllByText('Loading...');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it('shows success message when GitHub account is linked', () => {
    (useConnectionQuery as unknown as Mock).mockImplementation((params: any) => {
      if (params?.provider === 'github') {
        return {
          isLoading: false,
          data: { connected: true },
        };
      }
      return {
        isLoading: false,
        data: { connected: false },
      };
    });

    renderProfile();

    expect(screen.getByText('✓ GitHub Account Linked')).toBeInTheDocument();
    expect(screen.getByText('Change Account')).toBeInTheDocument();
  });

  it('shows success message when Microsoft account is linked', () => {
    (useConnectionQuery as unknown as Mock).mockImplementation((params: any) => {
      if (params?.provider === 'microsoft') {
        return {
          isLoading: false,
          data: { connected: true },
        };
      }
      return {
        isLoading: false,
        data: { connected: false },
      };
    });

    renderProfile();

    expect(screen.getByText('✓ Microsoft Account Linked')).toBeInTheDocument();
    expect(screen.getByText('Change Account')).toBeInTheDocument();
  });
});
