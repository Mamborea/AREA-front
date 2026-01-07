import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useValidateJiraMutation } from '../shared/src/web';

export function JiraCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Validating session...');
  const [validateJira, { isLoading }] = useValidateJiraMutation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (!code) {
      setStatus('Error: No authorization code found.');
      return;
    }

    try {
      const decodedState = state ? JSON.parse(atob(state)) : {};

      // IF MOBILE: Kick them back to the app
      if (decodedState.platform === 'mobile') {
        setStatus('Redirecting to mobile app...');
        window.location.href = `area://auth/jira?code=${code}`;
        return;
      }
    } catch (e) {
      console.error('State decode failed', e);
      // Fall through to normal web flow
    }

    // IF WEB (or if state is invalid): Continue with normal web login...
    const linkAccount = async () => {
      setStatus('Linking your Jira account...');
      try {
        await validateJira({ code }).unwrap();
        setStatus('Success! Redirecting...');
        setTimeout(() => {
          navigate('/profile');
        }, 1000);
      } catch (_error) {
        setStatus('Failed to link Jira account. See console for details.');
      }
    };

    linkAccount();
  }, [navigate, validateJira]);

  return (
    <div
      style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}
    >
      <h2>{status}</h2>
      {isLoading && <p>Validating...</p>}
    </div>
  );
}
