import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../shared/src/web';

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();

  const requirements = [
    { label: 'At least 8 characters', test: (pwd: string) => pwd.length >= 8 },
    {
      label: 'At least one uppercase letter',
      test: (pwd: string) => /[A-Z]/.test(pwd),
    },
    {
      label: 'At least one lowercase letter',
      test: (pwd: string) => /[a-z]/.test(pwd),
    },
    { label: 'At least one number', test: (pwd: string) => /[0-9]/.test(pwd) },
    {
      label: 'At least one special character',
      test: (pwd: string) => /[\W_]/.test(pwd),
    },
  ];

  const passwordStrength = requirements.reduce(
    (score, req) => score + (req.test(password) ? 1 : 0),
    0
  );

  const isEmailValid = (value: string) =>
    value.length <= 254 &&
    // /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]{1,63}(\.[a-zA-Z0-9-]{1,63})*\.[a-zA-Z]{2,63}$/.test(value); // strict
    /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.)+[a-zA-Z]{2,63}$/.test(
      value
    );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isEmailValid(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (passwordStrength < 5) {
      setErrorMessage('Password must satisfied at least 5 criteria.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    try {
      const data = await register({ name, email, password }).unwrap();
      if (data.token) {
        navigate('/dashboard');
      } else {
        setErrorMessage('Failed to get authentication token.');
      }
    } catch (err) {
      const apiError = err as { data?: { message: string } };
      const message = apiError.data?.message || 'An unexpected error occurred.';
      setErrorMessage(message);
      console.error('Failed to register:', err);
    }
  };

  return (
    <div className='auth-container'>
      <div className='auth-card'>
        <h1>Register</h1>
        {errorMessage && <div className='error-message'>{errorMessage}</div>}
        <form onSubmit={handleSubmit}>
          <div className='form-group'>
            <label htmlFor='name'>Name</label>
            <input
              type='text'
              id='name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className='form-group'>
            <label htmlFor='email'>Email</label>
            <input
              type='email'
              id='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className='form-group'>
            <label htmlFor='password'>Password</label>
            <input
              type='password'
              id='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className='password-requirements'>
              <p>Password requirements:</p>
              <ul>
                {requirements.map((req) => (
                  <li
                    key={req.label}
                    style={{ color: req.test(password) ? 'green' : 'red' }}
                  >
                    {req.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className='form-group'>
            <label htmlFor='confirmPassword'>Confirm Password</label>
            <input
              type='password'
              id='confirmPassword'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type='submit' className='btn-primary' disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className='auth-link'>
          Already have an account? <Link to='/login'>Login</Link>
        </p>
      </div>
    </div>
  );
}
