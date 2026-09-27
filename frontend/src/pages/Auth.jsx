import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { readJSON, writeJSON, setCurrentUser } from '../utils/storage';

// Prototype auth: accounts live in this browser's localStorage only. Passwords are
// stored as salted SHA-256 hashes rather than plain text.
async function hashPassword(email, password) {
  const data = new TextEncoder().encode(`healthai:${email}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
}

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  useDocumentTitle(isLogin ? 'Login | HealthAI' : 'Sign Up | HealthAI');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const email = formData.email.trim().toLowerCase();
    const name = formData.name.trim();

    if (!email || !formData.password || (!isLogin && !name)) {
      setError('Please fill all required fields.');
      return;
    }
    if (!isLogin && formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setSubmitting(true);
    const passwordHash = await hashPassword(email, formData.password);
    const users = readJSON('users', []);
    const existing = users.find(u => u.email.toLowerCase() === email);

    if (isLogin) {
      // Accounts created before hashing stored the plain password; upgrade them on login.
      const valid = existing && (existing.passwordHash === passwordHash || existing.password === formData.password);
      if (!valid) {
        setError('Incorrect email or password.');
        setSubmitting(false);
        return;
      }
      if (!existing.passwordHash) {
        writeJSON('users', users.map(u => (u === existing ? { name: u.name, email, passwordHash } : u)));
      }
      setCurrentUser({ name: existing.name, email });
    } else {
      if (existing) {
        setError('An account with this email already exists.');
        setSubmitting(false);
        return;
      }
      writeJSON('users', [...users, { name, email, passwordHash }]);
      setCurrentUser({ name, email });
    }
    navigate('/');
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-stone-50">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-lg border border-stone-100">
        <div>
          <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            {isLogin ? <LogIn className="w-8 h-8 text-primary-600" /> : <UserPlus className="w-8 h-8 text-primary-600" />}
          </div>
          <h2 className="text-center text-3xl font-extrabold text-stone-900">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="mt-2 text-center text-sm text-stone-600">
            {isLogin ? "Enter your details to access your account." : "Get started with your health journey."}
          </p>
        </div>
        
        {error && (
          <div role="alert" className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="auth-name" className="block text-sm font-medium text-stone-700 mb-1">Full Name</label>
                <input
                  id="auth-name"
                  type="text"
                  autoComplete="name"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            )}
            <div>
              <label htmlFor="auth-email" className="block text-sm font-medium text-stone-700 mb-1">Email address</label>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label htmlFor="auth-password" className="block text-sm font-medium text-stone-700 mb-1">Password</label>
              <input
                id="auth-password"
                type="password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                minLength={isLogin ? undefined : 8}
                required
                className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full py-3 disabled:opacity-60">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
          <p className="text-xs text-center text-stone-500">
            Demo accounts are stored in this browser only and are used to keep your history separate.
          </p>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-stone-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button 
              type="button" 
              onClick={() => {setIsLogin(!isLogin); setError('');}}
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
