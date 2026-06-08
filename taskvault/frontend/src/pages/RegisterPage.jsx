import { Check, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import { useAuth } from '../hooks/useAuth';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const score = useMemo(() => [form.password.length >= 8, /[A-Z]/.test(form.password), /\d/.test(form.password), /[^A-Za-z0-9]/.test(form.password)].filter(Boolean).length, [form.password]);
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || 'Could not register';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="mesh-bg hidden flex-col justify-center p-12 lg:flex">
        <h1 className="font-display text-6xl font-extrabold">Join TaskVault</h1>
        <div className="mt-8 space-y-4">{['JWT-secured sessions', 'Colored category workflows', 'Admin-ready REST API'].map((item) => <p key={item} className="flex items-center gap-3 text-slate-200"><Check className="text-success" /> {item}</p>)}</div>
      </section>
      <section className="grid place-items-center p-6">
        <form onSubmit={submit} className="glass w-full max-w-md rounded-3xl p-8">
          <h2 className="font-display text-3xl font-bold">Create your account</h2>
          {error && <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}
          <div className="mt-6 space-y-4">
            <Input label="Full Name" icon={User} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} minLength={2} required />
            <Input label="Email" icon={Mail} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <Input label="Password" icon={Lock} type={show ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required right={<button type="button" onClick={() => setShow(!show)} className="p-2 text-textMuted">{show ? <EyeOff size={17} /> : <Eye size={17} />}</button>} />
            <div><div className="mb-2 grid grid-cols-4 gap-2">{[0,1,2,3].map((i) => <div key={i} className={'h-2 rounded-full ' + (i < score ? ['bg-danger','bg-warning','bg-blue-500','bg-success'][i] : 'bg-border')} />)}</div><span className="text-xs text-textMuted">{score ? labels[score - 1] : 'Weak'}</span></div>
            <Input label="Confirm Password" icon={Lock} type={show ? 'text' : 'password'} value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
            <Button className="w-full py-3" isLoading={loading}>Create Account</Button>
            <p className="text-center text-sm text-textMuted">Already have an account? <Link className="font-bold text-accent" to="/login">Sign in</Link></p>
          </div>
        </form>
      </section>
    </main>
  );
}
