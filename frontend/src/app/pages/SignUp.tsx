import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '@/app/context/AuthContext';
import flowtyLogo from '@/imports/FlowtyLogo.png';

export default function SignUp() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await signup(username, email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--flowty-ink)]" style={{
      backgroundImage: 'linear-gradient(135deg, var(--flowty-accent-border) 0%, transparent 50%, var(--flowty-accent-border) 100%)',
    }}>
      <div className="bg-[var(--flowty-paper)] rounded-lg shadow-2xl p-8 w-full max-w-sm border-2 border-[var(--flowty-ink)]">
        <div className="flex justify-center mb-4">
          <img src={flowtyLogo} alt="Flowty" className="h-20 w-auto" />
        </div>
        <h1 className="text-2xl font-['Permanent_Marker'] text-[var(--flowty-ink)] mb-6 text-center">Sign Up</h1>
        {error && <p className="text-[var(--flowty-error)] text-sm mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-[var(--flowty-input-bg)] border-2 border-[var(--flowty-ink)] rounded px-3 py-2 font-['Courier_Prime'] text-sm"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-[var(--flowty-input-bg)] border-2 border-[var(--flowty-ink)] rounded px-3 py-2 font-['Courier_Prime'] text-sm"
            required
          />
          <input
            type="password"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-[var(--flowty-input-bg)] border-2 border-[var(--flowty-ink)] rounded px-3 py-2 font-['Courier_Prime'] text-sm"
            required
            minLength={6}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-[var(--flowty-ink)] text-[var(--flowty-paper)] font-['Special_Elite'] py-2 rounded border-2 border-[var(--flowty-ink)] hover:bg-[var(--flowty-title-hover)] transition-colors text-sm uppercase tracking-wider"
          >
            {isLoading ? 'Loading...' : 'Sign Up'}
          </button>
        </form>
        <p className="text-center mt-4 text-sm font-['Courier_Prime'] text-[var(--flowty-text-secondary)]">
          Already have an account?{' '}
          <Link to="/login" className="text-[var(--flowty-ink)] underline underline-offset-2">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}