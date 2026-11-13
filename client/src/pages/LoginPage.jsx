import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function LoginPage() {
  const { token, login, signup } = useAuth();
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');

  if (token) return <Navigate to="/" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    try {
      const action = mode === 'login' ? login : signup;
      await action(form.get('email'), form.get('password'));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>{mode === 'login' ? 'Log in' : 'Sign up'}</h1>
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password"
        minLength={8} required />
      {error && <p role="alert">{error}</p>}
      <button>{mode === 'login' ? 'Log in' : 'Create account'}</button>
      <p>
        <button type="button" onClick={() => { setError(''); setMode(mode === 'login' ? 'signup' : 'login'); }}>
          {mode === 'login' ? 'No account? Sign up' : 'Have an account? Log in'}
        </button>
      </p>
    </form>
  );
}