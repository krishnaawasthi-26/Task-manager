import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: 'admin@taskvault.dev', password: 'Admin@123' });
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid credentials';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="mesh-bg hidden flex-col justify-center p-12 lg:flex"><h1 className="font-display text-6xl font-extrabold">Welcome back</h1><p className="mt-4 max-w-md text-slate-300">Continue managing secure, categorized work from a production-grade REST API.</p></section>
      <section className="grid place-items-center p-6">
        <form onSubmit={submit} className="glass w-full max-w-md rounded-3xl p-8">
          <h2 className="font-display text-3xl font-bold">Sign in</h2>
          {error && <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}
          <div className="mt-6 space-y-4">
            <Input label="Email" icon={Mail} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <Input label="Password" icon={Lock} type={show ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required right={<button type="button" onClick={() => setShow(!show)} className="p-2 text-textMuted">{show ? <EyeOff size={17} /> : <Eye size={17} />}</button>} />
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-3 text-sm text-indigo-200">🔑 Admin: admin@taskvault.dev / Admin@123</div>
            <Button className="w-full py-3" isLoading={loading}>Sign in</Button>
            <p className="text-center text-sm text-textMuted">Don't have an account? <Link className="font-bold text-accent" to="/register">Register</Link></p>
          </div>
        </form>
      </section>
    </main>
  );
}
