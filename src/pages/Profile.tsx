import {
  useAppSelector,
  useGetGithubAuthUrlQuery,
  useGetMicrosoftAuthUrlQuery,
  useListMicrosoftWebhooksQuery,
  useListRepositoriesQuery,
} from '../shared/src/web';

function GitHubLinker() {
  const { refetch: getAuthUrl } = useGetGithubAuthUrlQuery();
  const { isLoading, isSuccess, isError } = useListRepositoriesQuery();

  const handleLinkGithub = async () => {
    const result = await getAuthUrl();
    if (result.data?.url) {
      window.location.href = result.data.url;
    }
  };

  if (isLoading) {
    return <div className='loading-spinner'>Loading...</div>;
  }

  if (isError) {
    return (
      <button type='button' onClick={handleLinkGithub} className='btn-github'>
        Link GitHub Account
      </button>
    );
  }

  if (isSuccess) {
    return (
      <div className='service-linked'>
        <p className='linked-status'>✓ GitHub Account Linked</p>
        <button
          type='button'
          onClick={handleLinkGithub}
          className='btn-github-change'
        >
          Change Account
        </button>
      </div>
    );
  }
  return null;
}

function MicrosoftLinker() {
  const { refetch: getAuthUrl } = useGetMicrosoftAuthUrlQuery();
  const { isLoading, isSuccess, isError } = useListMicrosoftWebhooksQuery();

  const handleLinkMicrosoft = async () => {
    const result = await getAuthUrl();
    if (result.data?.url) {
      window.location.href = result.data.url;
    }
  };

  if (isLoading) {
    return <div className='loading-spinner'>Loading...</div>;
  }

  if (isError) {
    return (
      <button
        type='button'
        onClick={handleLinkMicrosoft}
        className='btn-microsoft'
      >
        Link Microsoft Account
      </button>
    );
  }

  if (isSuccess) {
    return (
      <div className='service-linked'>
        <p className='linked-status'>✓ Microsoft Account Linked</p>
        <button
          type='button'
          onClick={handleLinkMicrosoft}
          className='btn-microsoft-change'
        >
          Change Account
        </button>
      </div>
    );
  }

  return null;
}

export function Profile() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className='profile'>
      <h1>Profile</h1>
      <div className='profile-card'>
        <div className='profile-info'>
          <div className='info-row'>
            <span className='info-label'>ID:</span>
            <span>{user?.id}</span>
          </div>
          <div className='info-row'>
            <span className='info-label'>Name:</span>
            <span>{user?.name}</span>
          </div>
          <div className='info-row'>
            <span className='info-label'>Email:</span>
            <span>{user?.email}</span>
          </div>
        </div>
        <div className='profile-actions'>
          <h3>Connected Services</h3>
          <GitHubLinker />
          <MicrosoftLinker />
        </div>
      </div>
    </div>
  );
}
