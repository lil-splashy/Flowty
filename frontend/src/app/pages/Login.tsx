import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '@/app/context/AuthContext';
import flowtyLogo from '@/imports/FlowtyLogo.png';
import blueprintBg from '@/imports/blueprint-background.png';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
      navigate('/');
    } catch {
      setError('Invalid username or password');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e]" style={{
      backgroundImage: 'linear-gradient(135deg, rgba(126,229,231,0.08) 0%, transparent 50%, rgba(126,229,231,0.08) 100%)',
    }}>
      <div className="bg-[#e7e1af] rounded-lg shadow-2xl p-8 w-full max-w-sm border-2 border-[#1a1a2e]">
        <div className="flex justify-center mb-4">
          <img src={flowtyLogo} alt="Flowty" className="h-20 w-auto" />
        </div>
        <h1 className="text-2xl font-['Permanent_Marker'] text-[#1a1a2e] mb-6 text-center">Log In</h1>
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
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-[#fafafa] border-2 border-[#1a1a2e] rounded px-3 py-2 font-['Courier_Prime'] text-sm"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-[#1a1a2e] text-[#e7e1af] font-['Special_Elite'] py-2 rounded border-2 border-[#1a1a2e] hover:bg-[#2a2a4e] transition-colors text-sm uppercase tracking-wider"
          >
            {isLoading ? 'Loading...' : 'Log In'}
          </button>
        </form>
        <p className="text-center mt-4 text-sm font-['Courier_Prime'] text-[#8a6a40]">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#1a1a2e] underline underline-offset-2">
            Sign up
          </Link>
        </p>
        <p className="text-center mt-2 text-xs font-['Courier_Prime'] text-[#8a6a40]">
          Demo: username <b>demo</b>, password <b>password</b>
        </p>
      </div>
    </div>
  );
}