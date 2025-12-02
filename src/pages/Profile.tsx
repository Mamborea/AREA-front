import { useAppSelector, useGetGithubAuthUrlQuery } from '../shared/src/web';

export function Profile() {
  const { user } = useAppSelector((state) => state.auth);
  const { refetch } = useGetGithubAuthUrlQuery();

  const handleLinkGithub = async () => {
    const result = await refetch();
    if (result.data?.url) {
      window.location.href = result.data.url;
    }
  };

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
          <button
            type='button'
            onClick={handleLinkGithub}
            className='btn-github'
          >
            Link GitHub Account
          </button>
        </div>
      </div>
    </div>
  );
}
