import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useValidateMicrosoftMutation } from '../shared/src/web';

export function MicrosoftCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Linking your Microsoft account...');
  const [validateMicrosoft, { isLoading, isError }] =
    useValidateMicrosoftMutation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (!code) {
      setStatus('Error: No code found.');
      return;
    }

    const linkAccount = async () => {
      try {
        await validateMicrosoft({ code }).unwrap();
        setStatus('Success! Redirecting...');
        setTimeout(() => {
          navigate('/profile');
        }, 1000);
      } catch (_error) {
        setStatus('Failed to link Microsoft account. See console for details.');
      }
    };

    linkAccount();
  }, [navigate, validateMicrosoft]);

  return (
    <div
      style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}
    >
      <h2>{status}</h2>
      {isLoading && <p>Validating...</p>}
      {isError && (
        <p style={{ color: 'red' }}>An error occurred. Please try again.</p>
      )}
    </div>
  );
}
