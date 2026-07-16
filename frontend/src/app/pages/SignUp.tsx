import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '@/app/context/AuthContext';

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
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e]" style={{
      backgroundImage: 'linear-gradient(135deg, rgba(126,229,231,0.08) 0%, transparent 50%, rgba(126,229,231,0.08) 100%)',
    }}>
      <div className="bg-[#e7e1af] rounded-lg shadow-2xl p-8 w-full max-w-sm border-2 border-[#1a1a2e]">
        <h1 className="text-2xl font-['Permanent_Marker'] text-[#1a1a2e] mb-6 text-center">Sign Up</h1>
        {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-[#fafafa] border-2 border-[#1a1a2e] rounded px-3 py-2 font-['Courier_Prime'] text-sm"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-[#fafafa] border-2 border-[#1a1a2e] rounded px-3 py-2 font-['Courier_Prime'] text-sm"
            required
          />
          <input
            type="password"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-[#fafafa] border-2 border-[#1a1a2e] rounded px-3 py-2 font-['Courier_Prime'] text-sm"
            required
            minLength={6}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-[#1a1a2e] text-[#e7e1af] font-['Special_Elite'] py-2 rounded border-2 border-[#1a1a2e] hover:bg-[#2a2a4e] transition-colors text-sm uppercase tracking-wider"
          >
            {isLoading ? 'Loading...' : 'Sign Up'}
          </button>
        </form>
        <p className="text-center mt-4 text-sm font-['Courier_Prime'] text-[#8a6a40]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#1a1a2e] underline underline-offset-2">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}